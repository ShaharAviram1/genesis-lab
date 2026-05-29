const { WebSocketServer, WebSocket } = require('ws');
const User = require('./../models/User');
const { getEnergyMultiplier } = require('./../utils/gameEconomy');
const { resolveAndPruneUserQueue } = require('./../utils/resolveQueue');

const reactorSessions = new Map(); // Map of userId to live reactor session state


//CONSTANTS
const TICK_RATE = 10; // ticks per second
const TICK_INTERVAL_MS = 1000 / TICK_RATE; // Interval in milliseconds
const CLIENT_UPDATE_RATE = 4; // times per second
const ACTIVITY_DECAY_PER_SECOND = 1; // Activity decay per second (exponential decay)
const ACTIVITY_EPSILON = 0.01; // Minimum activity level to consider as active
const ENERGY_MULTIPLIER = 0.1; // Multiplier to convert activity level to energy gain
const CLICK_ACTIVITY_GAIN = 5; // Activity gain per core click
const MAX_ACTIVITY_LEVEL = 100; // Maximum cap for activity level


// ── Queue event helpers ───────────────────────────────────────────────────────

// Sanitizes a single queue entry for WS transmission — strips product identity if undiscovered.
function sanitizeQueueEntryForWS(entry) {
    const out = {
        reactionKey:        entry.reactionKey,
        slot:               entry.slot,
        status:             entry.status,
        startTime:          entry.startTime,
        expectedCompletion: entry.expectedCompletion,
        completedAt:        entry.completedAt,
        revealOnCompletion: entry.revealOnCompletion,
        reactionName: entry.revealOnCompletion ? 'Unknown Synthesis' : entry.snapshot?.reactionName
    };
    if (entry.snapshot) {
        out.snapshot = entry.revealOnCompletion
            ? { energyCost: entry.snapshot.energyCost, reactants: entry.snapshot.reactants }
            : { ...entry.snapshot };
    }
    return out;
}

// Builds the sanitized queue array for queue_state emission.
function buildQueueState(user) {
    return (user.activeQueue || []).map(entry =>
        sanitizeQueueEntryForWS(entry.toObject ? entry.toObject() : entry)
    );
}

// Sends a single WebSocket event to a user's live session.
// Best-effort: silently returns false if disconnected or send fails.
// HTTP request correctness is never conditional on this succeeding.
function emitToUser(username, eventType, payload) {
    const session = reactorSessions.get(username);
    if (!session || !session.ws || session.ws.readyState !== WebSocket.OPEN) return false;
    try {
        session.ws.send(JSON.stringify({ type: eventType, ...payload }));
        return true;
    } catch (err) {
        console.error(`emitToUser: failed to send '${eventType}' to '${username}':`, err);
        return false;
    }
}

// Emits synthesis_completed, synthesis_discovered, or synthesis_failed for each
// entry in the completions array returned by resolveQueue / resolveAndPruneUserQueue.
function emitQueueCompletions(username, completions) {
    for (const { entry, wasDiscovery, prevUnlockTier, newUnlockTier } of completions) {
        if (entry.status === 'failed') {
            emitToUser(username, 'synthesis_failed', {
                reactionKey: entry.reactionKey,
                reason:      'Synthesis failed'
            });
        } else {
            emitToUser(username, wasDiscovery ? 'synthesis_discovered' : 'synthesis_completed', {
                reactionKey:    entry.reactionKey,
                productName:    entry.snapshot.productName,
                productKey:     entry.snapshot.productKey,
                quantity:       entry.snapshot.productQuantity,
                wasDiscovery,
                prevUnlockTier,
                newUnlockTier
            });
        }
    }
}


function reactorRuntime(server) {
    const wss = new WebSocketServer({ server });
    setInterval(() => {
        const now = Date.now();
        reactorSessions.forEach((session) => {
            tickSession(session, now);
        });
    }, TICK_INTERVAL_MS);

    const flushInterval = setInterval(() => {
            reactorSessions.forEach(async (session) => {
                 await flushPendingMongoEnergyForSession(session);
            });
    }, 1500); // Flush pending energy to MongoDB every 1.5 seconds


    wss.on('connection', async (ws, req) => {
        ws.id = req.url.split('?user=')[1]; // Assuming the client connects with ws://server?user=username
        if (!ws.id) {
            console.log('Connection rejected: No user ID provided');
            ws.close();
            return;
        }
        console.log(`User ${ws.id} connected to reactor runtime`);

        let user;
        try {
            user = await User.findOne({ username: ws.id });
            if (!user) {
                console.log(`Connection rejected: User ${ws.id} not found`);
                ws.close();
                return;
            }
        } catch (err) {
            console.error('Database error:', err);
            ws.close();
            return;
        }

        const energyMultiplier = getEnergyMultiplier(user);
        const session = getOrCreateSession(ws.id, user.energy || 0, energyMultiplier);
        session.ws = ws;
        sendReactorState(ws, session);

        // Step 1: Resolve any queue entries that completed while the user was offline.
        // session.ws is set above, so the user is now connected — emit fresh completions
        // live and do NOT create pending notifications for them (anti-duplication rule).
        try {
            const { completions, userModified } = await resolveAndPruneUserQueue(user);
            if (userModified) await user.save();
            if (completions.length > 0) emitQueueCompletions(ws.id, completions);
        } catch (queueErr) {
            console.error('Queue resolution error on WS connect for user', ws.id, ':', queueErr);
        }

        // Step 2: Drain stored pending notifications created by HTTP routes that resolved
        // the queue while the user had no WS session. Each is delivered exactly once:
        // deliveredAt is set and persisted before moving on.
        try {
            const pendingToDeliver = user.pendingNotifications.filter(n => !n.deliveredAt);
            if (pendingToDeliver.length > 0) {
                const now = new Date();
                for (const notification of pendingToDeliver) {
                    emitToUser(ws.id, notification.type, notification.payload);
                    notification.deliveredAt = now;
                }
                await user.save();
                console.log(`Delivered ${pendingToDeliver.length} pending notification(s) to user '${ws.id}'`);
            }
        } catch (drainErr) {
            console.error('Pending notification drain error for user', ws.id, ':', drainErr);
        }

        emitToUser(ws.id, 'queue_state', { queue: buildQueueState(user) });

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message.toString());
                if (data.type === 'core_click') {
                    const session = reactorSessions.get(ws.id);
                    if (!session) return;

                    applyCoreClick(session);
                    console.log('Activity:', session.activityLevel);
                    sendReactorState(ws, session);
                }
            } catch (err) {
                console.error('Invalid message format:', message);
                return;
            }
        });

        const clientInterval = setInterval(() => {
            const session = reactorSessions.get(ws.id);
            if (!session) return;
            if (ws.readyState !== WebSocket.OPEN) {
                clearInterval(clientInterval);
                return;
            }
            sendReactorState(ws, session);
        }, 1000 / CLIENT_UPDATE_RATE);

        ws.on('close', async () => {
            console.log('Client disconnected');
            const session = reactorSessions.get(ws.id);
            if (session) session.ws = null;
            await flushPendingMongoEnergyForSession(session);
            clearInterval(clientInterval);
            reactorSessions.delete(ws.id);
        });
    });
}


// Helper functions for managing reactor sessions and energy calculations



function createReactorSession(userId, persistedEnergyBase, energyMultiplier) {
    const session = {
        userId,
        activityLevel: 0,
        lastUpdateTimestamp: Date.now(),
        energyBuffer: 0,
        pendingMongoEnergy: 0,
        inFlightEnergy: 0,
        lastClickTime: null,
        persistedEnergyBase,
        energyMultiplier,
        activeFlushPromise: null,
    };
    return session;
}

function getSessionTotalEnergy(session){
    return session.persistedEnergyBase + session.pendingMongoEnergy + session.inFlightEnergy;
}

function buildReactorState(session) {
    return {
        type: 'reactor_state',
        activityLevel: session.activityLevel,
        energy: getSessionTotalEnergy(session),
        energyPerSecond: session.activityLevel * ENERGY_MULTIPLIER * session.energyMultiplier
    };
}

function applyCoreClick(session) {
    session.activityLevel += CLICK_ACTIVITY_GAIN;
    if (session.activityLevel > MAX_ACTIVITY_LEVEL) {
        session.activityLevel = MAX_ACTIVITY_LEVEL;
    }
    session.lastClickTime = Date.now();
}

function tickSession(session, now) {
    // Decay activity level over time
    const dt = (now - session.lastUpdateTimestamp) / 1000; // in seconds
    if (dt <= 0) { return; }
    session.activityLevel *= Math.exp(- ACTIVITY_DECAY_PER_SECOND * dt);
    if (session.activityLevel < ACTIVITY_EPSILON) {
        session.activityLevel = 0;
    }

    // Calculate energy gain based on activity level
    session.energyBuffer += session.activityLevel * ENERGY_MULTIPLIER * session.energyMultiplier * dt;

    // If the buffer contains at least 1 whole energy, move it into pending Mongo energy
    if (session.energyBuffer >= 1) {
        const energyGained = Math.floor(session.energyBuffer);
        session.pendingMongoEnergy += energyGained;
        session.energyBuffer -= energyGained;
        console.log(`User ${session.userId} gained ${(energyGained + session.energyBuffer).toFixed(2)} energy. Total buffer energy: ${session.energyBuffer.toFixed(2)}`);
        // Here you would typically update the user's energy in the database and notify the client
    }
    session.lastUpdateTimestamp = now;

    if (session.activityLevel > 0 && session.ws) {
        sendReactorState(session.ws, session);
    }
}

function getOrCreateSession(userId, persistedEnergyBase, energyMultiplier) {
    let session = reactorSessions.get(userId);
    if (!session) {
        session = createReactorSession(userId, persistedEnergyBase, energyMultiplier);
        reactorSessions.set(userId, session);
    }
    return session;
}

function sendReactorState(ws, session) {
    if(ws.readyState !== WebSocket.OPEN) {
        return;
    }
    ws.send(JSON.stringify(buildReactorState(session)));
}

async function flushPendingMongoEnergyForSession(session) {
    if (!session) return;

    // If a write is already in flight, await it — DB may not yet reflect the pending energy
    if (session.activeFlushPromise) {
        await session.activeFlushPromise;
    }

    if (session.pendingMongoEnergy <= 0) return;

    const doFlush = async () => {
        const amountToFlush = session.pendingMongoEnergy;
        session.pendingMongoEnergy -= amountToFlush;
        session.inFlightEnergy += amountToFlush;
        try {
            const updatedUser = await User.findOneAndUpdate(
                { username: session.userId },
                { $inc: { energy: amountToFlush } },
                { new: true }
            );
            if (!updatedUser) {
                session.pendingMongoEnergy += amountToFlush;
                session.inFlightEnergy -= amountToFlush;
                return;
            }
            console.log(`Flushed ${amountToFlush} energy to MongoDB for user ${session.userId}. New total: ${updatedUser.energy}`);
            session.persistedEnergyBase = updatedUser.energy;
            session.inFlightEnergy -= amountToFlush;
        } catch (err) {
            session.pendingMongoEnergy += amountToFlush;
            session.inFlightEnergy -= amountToFlush;
            console.error(`Failed to flush energy for user ${session.userId}:`, err);
        } finally {
            session.activeFlushPromise = null;
        }
    };

    session.activeFlushPromise = doFlush();
    await session.activeFlushPromise;
}

// Returns true if the given user currently has an open WS connection.
// Used by HTTP routes to decide between live emit and pending notification creation.
function isUserConnected(username) {
    const session = reactorSessions.get(username);
    return !!(session && session.ws && session.ws.readyState === WebSocket.OPEN);
}


//route-facing helpers

async function flushPendingMongoEnergyForUser(username) {
    const session = reactorSessions.get(username);
    if (session) {
        await flushPendingMongoEnergyForSession(session);
    }
}

function updateSessionEnergyMultiplierForUser(username, newMultiplier) {
    const session = reactorSessions.get(username);
    if (session) {
        session.energyMultiplier = newMultiplier;
    }
}

function updateSessionPersistedEnergyBaseForUser(username, newEnergyBase) {
    const session = reactorSessions.get(username);
    if (session) {
        session.persistedEnergyBase = newEnergyBase;
    }
}

function zeroSessionEnergyForUser(username) {
    const session = reactorSessions.get(username);
    if (session) {
        session.persistedEnergyBase = 0;
        session.pendingMongoEnergy = 0;
        session.inFlightEnergy = 0;
        session.energyBuffer = 0;
    }
}

module.exports = {
    reactorRuntime,
    flushPendingMongoEnergyForUser,
    updateSessionEnergyMultiplierForUser,
    updateSessionPersistedEnergyBaseForUser,
    zeroSessionEnergyForUser,
    emitToUser,
    emitQueueCompletions,
    isUserConnected
};
