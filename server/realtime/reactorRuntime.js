const { WebSocketServer, WebSocket } = require('ws');
const User = require('./../models/User');
const { getEnergyMultiplier } = require('./../utils/gameEconomy');

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
        sendReactorState(ws, session);

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
            await flushPendingMongoEnergyForSession(reactorSessions.get(ws.id));
            clearInterval(clientInterval);
            // Removed clearInterval(flushInterval);
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
        lastClickTime: null,
        persistedEnergyBase,
        energyMultiplier,
        isFlushing: false,
    };
    return session;
}
    
function getSessionTotalEnergy(session){
    return session.persistedEnergyBase + session.pendingMongoEnergy;
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
    if (!session || session.isFlushing || session.pendingMongoEnergy <= 0) {
        return;
    }

    session.isFlushing = true;
    const amountToFlush = session.pendingMongoEnergy;
    session.pendingMongoEnergy -= amountToFlush;

    try {
        const updatedUser = await User.findOneAndUpdate(
            { username: session.userId },
            { $inc: { energy: amountToFlush } },
            { new: true }
        );

        if (!updatedUser) {
            session.pendingMongoEnergy += amountToFlush;
            return;
        }

        console.log(`Flushed ${amountToFlush} energy to MongoDB for user ${session.userId}. New total energy: ${updatedUser.energy}`);
        session.persistedEnergyBase = updatedUser.energy;
    } catch (err) {
        session.pendingMongoEnergy += amountToFlush;
        console.error(`Failed to flush energy for user ${session.userId}:`, err);
    } finally {
        session.isFlushing = false;
    }
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
        session.energyBuffer = 0;
    }
}

module.exports = { flushPendingMongoEnergyForUser, reactorRuntime, updateSessionEnergyMultiplierForUser, updateSessionPersistedEnergyBaseForUser, zeroSessionEnergyForUser };