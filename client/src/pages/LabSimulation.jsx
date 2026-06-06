import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import "./LabSimulation.css";
import fetchWithTimeout, { FetchTimeoutError } from "../utils/fetchWithTimeout";
import { useToast } from "../context/ToastContext";
import InventoryPanel from "../../components/InventoryPanel";
import AtomPanel from "../../components/AtomPanel";
import ReactionPanel from "../../components/ReactionPanel";
import SelectedReactionPanel from "../../components/SelectedReactionPanel";
import PrestigeBranchPanel from "../../components/PrestigeBranchPanel";
import HeaderPanel from "../../components/HeaderPanel";
import ObjectiveStrip from "../../components/ObjectiveStrip";
import BigBangPanel from "../../components/BigBangPanel";
import QueuePanel from "../../components/QueuePanel";

import GenesisScene from "../../components/GenesisScene";
import ExperimentPanel from "../../components/ExperimentPanel";
import LabNotebookPanel from "../../components/LabNotebookPanel";


// How long a completed/failed entry remains visible in the reactor slot UI
// before being dropped from activeQueue. Server retains entries up to 24h for
// replay/debug; the client trims to a short flash so the slot returns to idle.
const COMPLETED_VISIBLE_MS = 2500;

// Mirrors server/config/prestigeConfig.js getMaxBufferSlots().
// Maps blueprintKey → grantsBuffer value.
const BUFFER_GRANTING_BLUEPRINTS = { queue_buffer: 1, extended_buffer: 2 };

function queueEntryIdentity(entry) {
    return entry.queueEntryId || entry._id || `${entry.reactionKey}-${entry.startTime || ''}`;
}

const LabSimulation = ({ username, onLogout }) => {
    const [user, setUser] = useState(username || "");
    const [reactions, setReactions] = useState([]);
    const [selectedReaction, setSelectedReaction] = useState(null);
    const [result, setResult] = useState("");
    const [inventory, setInventory] = useState([]);
    const [checking, setChecking] = useState(false);
    const [performing, setPerforming] = useState(false);
    const [energy, setEnergy] = useState(0);
    const [unlockTier, setUnlockTier] = useState(0);
    const [bigBangs, setBigBangs] = useState(0);
    const [atoms, setAtoms] = useState([]);
    const [creatingAtom, setCreatingAtom] = useState("");
    const [genesisShards, setGenesisShards] = useState(0);
    const [prestigeUpgrades, setPrestigeUpgrades] = useState({ energy: 0, matter: 0, chemistry: 0 });
    const [blueprints, setBlueprints] = useState([]);
    const [generators, setGenerators] = useState([]);
    const [bigBangPhase, setBigBangPhase] = useState(null); // null | 'collapse' | 'singularity' | 'flash' | 'expansion' | 'rebirth'
    const [expectedShards, setExpectedShards] = useState(0);
    const [previousUnlockTier, setPreviousUnlockTier] = useState(0);
    const [activityLevel, setActivityLevel] = useState(0);
    const [energyRate, setEnergyRate] = useState(0);
    const [reactionLog, setReactionLog] = useState([]);
    const [reactorCapabilities, setReactorCapabilities] = useState([]);
    const [capsExpanded, setCapsExpanded] = useState(false);
    const [upgradesExpanded, setUpgradesExpanded] = useState(false);
    const [notebookOpen, setNotebookOpen] = useState(false);
    const [newlyRevealedTier, setNewlyRevealedTier] = useState(null);
    const [justDiscoveredReactionKey, setJustDiscoveredReactionKey] = useState(null);
    const [creationEvent, setCreationEvent] = useState(null);
    const [reactionEvent, setReactionEvent] = useState(null);
    const [queueEvent, setQueueEvent] = useState(null);
    const [activeQueue, setActiveQueue] = useState([]);
    const wsRef = useRef(null);
    const wsEnergyActiveRef = useRef(false);
    const expiredPingsSentRef = useRef(new Set());
    // While inside this window (set by an offline_summary event), per-product
    // toasts for synthesis_completed / discovered / failed are suppressed so the
    // user sees only the consolidated "while you were away" toast.
    const offlineToastSuppressUntilRef = useRef(0);
    const showToast = useToast();
    const navigate = useNavigate();

    const handleLogout = () => {
        onLogout();
        navigate('/auth');
    };

    useEffect(() => {
        if (!username || username === user) return;
        wsEnergyActiveRef.current = false;
        setActivityLevel(0);
        setEnergyRate(0);
        setActiveQueue([]);

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setUser(username);
    }, [username, user]);


    const bigBangActive = !!bigBangPhase;
    const isBusy = checking || performing || creatingAtom || bigBangActive;
    // Slot derivation must mirror server/config/prestigeConfig.js getMaxSlots(user).
    // Base 1 slot + 1 per owned reactor_capacity blueprint.
    const SLOT_GRANTING_BLUEPRINTS = ['expanded_reactor_bay', 'triple_reactor_array'];
    const ownedBlueprintKeys = new Set((blueprints || []).map(b => b.blueprintKey));
    const maxSlots = 1 + SLOT_GRANTING_BLUEPRINTS.filter(k => ownedBlueprintKeys.has(k)).length;
    const maxBufferSlots = Object.entries(BUFFER_GRANTING_BLUEPRINTS)
        .reduce((sum, [key, grants]) => ownedBlueprintKeys.has(key) ? sum + grants : sum, 0);
    const occupiedSlots = activeQueue.filter(e => e.status === 'processing' || e.status === 'resolving').length;
    const queuedCount = activeQueue.filter(e => e.status === 'queued').length;
    const isProcessing = occupiedSlots > 0;
    // reactorOccupied: all slots busy AND buffer full — nothing more can be queued
    const reactorOccupied = occupiedSlots >= maxSlots && queuedCount >= maxBufferSlots;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const runBigBangSequence = async (skipApi = false) => {
        // Fire API immediately so it runs in parallel with the animation.
        // Always pass force=true — BigBangPanel gates this call with a 2-step confirm
        // that already warns the user about forfeited syntheses.
        const apiPromise = skipApi
            ? Promise.resolve({ success: true })
            : fetchWithTimeout(`http://localhost:3000/api/bigbang?user=${user}&force=true`, { method: "POST" })
                .then(r => r.json())
                .catch(err => ({ success: false, error: err }));

        setBigBangPhase('collapse');
        await delay(2000);

        setBigBangPhase('singularity');
        await delay(300);

        setBigBangPhase('flash');
        const data = await apiPromise; // guaranteed done by now

        if (!skipApi) {
            if (!data.success) {
                showToast('error', data.error instanceof FetchTimeoutError ? 'Big Bang timed out' : 'Big Bang failed');
                await delay(400);
                setBigBangPhase(null);
                return;
            }
            setUser(data.username);
            setBigBangs(data.bigBangCount);
            setSelectedReaction(null);
            setResult("");
            setActiveQueue([]);
            await Promise.all([fetchUserData(), fetchReactions(), fetchAtoms()]);
        }

        await delay(500);
        setBigBangPhase('expansion');
        await delay(1000);
        setBigBangPhase('rebirth');
        await delay(2000);
        setBigBangPhase(null);
    };

    const bigBang = () => runBigBangSequence(false);
    const testBigBangAnimation = () => runBigBangSequence(true);

    const handleTierUnlock = (newTier) => {
        const tierMessages = {
            1:  "First synthesis complete",
            2:  "Ionic chemistry unlocked",
            3:  "The ore body opens",
            4:  "The Foundry is running",
            5:  "Workshop expands",
            6:  "Chemical Works active",
            7:  "Materials Lab opens",
            8:  "Precision metallurgy unlocked",
            9:  "Carbon nanoscience begins",
            10: "Gen 1–3 complete",
            11: "Plasma synthesis achieved",
            12: "Nuclear fuel synthesized",
            13: "Gen 5 begins",
            14: "Quantum coherence established",
            15: "Chromodynamic matter achieved",
            16: "Convergence tracks complete",
            17: "Both tracks unified",
            18: "Gen 5 complete",
            19: "Entropic Horizons begin",
            20: "Holographic encoding active",
            21: "Planck-density matter achieved",
            22: "Quantum foam crystallized",
            23: "Graviton condensate formed",
            24: "Gen 6 complete"
        };
        const message = tierMessages[newTier] || "New tier unlocked";
        showToast("milestone", `✦ Tier ${newTier}: ${message}`);
    };

    const getCurrentGoal = () => {
        const hasProduced = (key) => inventory.some(i => i.substance?.substanceKey === key);

        if (unlockTier === 0) return inventory.length === 0
            ? "Synthesize your first atoms."
            : "Test whether simple gases can form a stable compound.";
        if (unlockTier === 1) return "Experiment with your new atoms. Hidden compounds are nearby.";
        if (unlockTier === 2) return "A key ore compound is within reach. It will open the path to metals.";
        if (unlockTier === 3) return "Investigate whether ore compounds can be reduced into workable metals.";
        if (unlockTier === 4) return "Explore whether two metals can be forged into something stronger.";
        if (unlockTier === 5) return "Deeper Workshop materials are possible. Look for unusual extraction routes.";
        if (unlockTier === 6) return "The first structural materials are within range. Look to what the reactor already knows.";
        if (unlockTier === 7) return "Advanced refinement is open. Seek rare metals through complex chemical processes.";
        if (unlockTier === 8) return "Engineered carbon structures may now be achievable.";
        if (unlockTier === 9) return "The plasma era begins. Converge your most advanced materials and ionize the first plasma-state substance.";
        if (unlockTier === 10) return "Stabilize your first plasma-state material — Hydrogen Plasma opens the next tier.";
        if (unlockTier === 11) return "Develop cryogenic containment and a nuclear-grade fuel source.";
        // Gen 4 final gate (T12–13 are unlocked by late Gen 4 substances)
        if (unlockTier === 12) return "Nuclear fuel synthesis underway. Synthesize the quantum substrate to open the quantum frontier.";
        // Gen 5 — Quantum Frontier (T13–T18)
        if (unlockTier === 13) return "Gen 5 begins. Two tracks — topological and photonic — are now accessible. Advance both in parallel.";
        if (unlockTier === 14) return "Quantum coherence is active. Push both Gen 5 tracks toward their mid-tier convergence outputs.";
        if (unlockTier === 15) return "Chromodynamic matter achieved. Both tracks are deepening — push toward the Bose-Nova remnant and magnetar filament.";
        if (unlockTier === 16) return "Bose-Nova remnant created. Complete Track A and push Track B toward strangeon matter.";
        if (unlockTier === 17) return "Quantum vacuum lattice synthesized. Complete strangeon matter, then converge both tracks into the axionic condensate.";
        if (unlockTier === 18) return "Gen 5 complete. The axionic condensate opens three new entropic-horizon synthesis tracks.";
        // Gen 6 — Entropic Horizons (T19–T24)
        if (unlockTier === 19) return "Entropic Horizons begin. Three parallel seed reactions are now unlocked — each requires deep Gen 5 outputs.";
        if (unlockTier === 20) return "Holographic encoding is active. Mid-generation outputs are now accessible across all three tracks.";
        if (unlockTier === 21) return "Planck-density matter achieved. All three Gen 6 output reactions are now open.";
        if (unlockTier === 22) return "Quantum foam crystallized. Three output streams must converge into the spacetime nexus.";
        if (unlockTier === 23) return "Graviton condensate formed. One output stream remains before the final capstone synthesis.";
        if (unlockTier >= 24) return "Gen 6 complete. The spacetime nexus has been synthesized.";
        // Safety fallback for any intermediate state before T12
        const gen4Done = hasProduced('reactive_plasma_core') && hasProduced('quantum_substrate');
        if (gen4Done) return "Gen 4 complete. The reactor is ready for cosmic-scale synthesis.";
        return "Complete the Gen 4 capstone syntheses — converge all three extreme-state tracks.";
    };

    const createAtom = async (atom) => {
        try {
            setCreatingAtom(atom);
            const res = await fetchWithTimeout(`http://localhost:3000/api/atoms/create?user=${user}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({atom: atom})
                });
            const data = await res.json();
            if (data.success) {
                setInventory(data.inventory);
                if (!wsEnergyActiveRef.current) setEnergy(data.energy);
                setCreationEvent({
                    type: "atom_creation",
                    atom,
                    strength: 1,
                    timestamp: Date.now()
                });
                showToast('success', `${atom} created`);
            }
        }
        catch (err) {
            showToast('error', err instanceof FetchTimeoutError ? 'Atom creation timed out' : 'Failed to create atom');
        }
        finally {
            setCreatingAtom("");
        }
    }

    const handleCoreClick = async () => {
        try {
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'core_click' }));
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    const purchaseBlueprint = async (blueprintKey) => {
        try {
            const res = await fetchWithTimeout(
                `http://localhost:3000/api/users/${user}/blueprints/${blueprintKey}`,
                { method: 'POST' }
            );
            const data = await res.json();
            if (!res.ok) {
                showToast('error', data.error || 'Blueprint purchase failed');
                return;
            }
            setGenesisShards(data.genesisShards);
            setBlueprints(data.blueprints);
            showToast('success', 'Blueprint purchased');
        }
        catch (err) {
            showToast('error', err instanceof FetchTimeoutError ? 'Purchase timed out' : 'Blueprint purchase failed');
        }
    };


    const constructGenerator = async (moduleKey) => {
        try {
            const res = await fetchWithTimeout(
                `http://localhost:3000/api/users/${user}/generators/${moduleKey}`,
                { method: 'POST' }
            );
            const data = await res.json();
            if (!res.ok) {
                showToast('error', data.error || 'Construction failed');
                return;
            }
            setGenerators(data.generators);
            if (!wsEnergyActiveRef.current) setEnergy(data.energy);
            if (data.inventory) setInventory(data.inventory);
            showToast('success', 'Module constructed');
        }
        catch (err) {
            showToast('error', err instanceof FetchTimeoutError ? 'Construction timed out' : 'Construction failed');
        }
    };

    const upgradeGenerator = async (moduleKey) => {
        try {
            const res = await fetchWithTimeout(
                `http://localhost:3000/api/users/${user}/generators/${moduleKey}/upgrade`,
                { method: 'POST' }
            );
            const data = await res.json();
            if (!res.ok) {
                showToast('error', data.error || 'Upgrade failed');
                return;
            }
            setGenerators(data.generators);
            if (!wsEnergyActiveRef.current) setEnergy(data.energy);
            if (data.inventory) setInventory(data.inventory);
            showToast('success', 'Module upgraded');
        }
        catch (err) {
            showToast('error', err instanceof FetchTimeoutError ? 'Upgrade timed out' : 'Upgrade failed');
        }
    };

    const experiment = async (substances) => {
        try {
            const response = await fetchWithTimeout(`http://localhost:3000/api/reactions/experiment?user=${user}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ substances: substances.map(s => s._id) })
            });
            const data = await response.json();

            if (!response.ok) {
                const msg = data.hint
                    ? `${data.error || 'Experiment failed'} — ${data.hint}`
                    : (data.error || 'Experiment failed');
                showToast('error', msg);
                return;
            }

            if (data.success) {
                if (data.energy !== undefined && !wsEnergyActiveRef.current) setEnergy(data.energy);
                if (data.inventory) setInventory(data.inventory);

                if (data.queued) {
                    // Timed synthesis — WS synthesis_queued event will update activeQueue
                    const label = data.revealOnCompletion ? 'Unknown synthesis' : 'Experiment';
                    showToast('success', `${label} queued`);
                    return;
                }

                // Instant completion — WS synthesis_completed/discovered already fired if WS is connected
                if (!wsEnergyActiveRef.current) {
                    const successMessage = data.discovered ? 'Discovery!' : 'Experiment successful';
                    showToast(data.discovered ? 'milestone' : 'success', successMessage);
                    if (data.discovered && data.reactionKey) {
                        setJustDiscoveredReactionKey(data.reactionKey);
                        setTimeout(() => setJustDiscoveredReactionKey(null), 3000);
                    }
                    setReactionEvent({
                        type: data.discovered ? "discovery" : "experiment_success",
                        reactionKey: data.reactionKey,
                        timestamp: Date.now()
                    });
                }
                await Promise.all([fetchUserData(), fetchReactions(), fetchAtoms()]);
                return;
            }

            const failMsg = data.hint
                ? `${data.message || 'No stable reaction formed'} — ${data.hint}`
                : (data.message || 'No stable reaction formed');
            showToast('error', failMsg);
            setReactionEvent({
                type: "experiment_failed",
                timestamp: Date.now()
            });
            await fetchUserData();
        }
        catch (err) {
            showToast('error', err instanceof FetchTimeoutError ? 'Experiment timed out' : 'Experiment failed');
        }
    };

    const checkReaction = async (reactionKey) => {
        if (selectedReaction?.reactionKey === reactionKey) {
            setSelectedReaction(null);
            setResult("");
            return;
        }
        try {
            setChecking(true);
            setResult("");
            const res = await fetchWithTimeout(`http://localhost:3000/api/reactions/${reactionKey}?user=${user}`);
            const data = await res.json();
            setSelectedReaction(data.reaction);
            setResult(data.canPerform);
        }
        catch (err) {
            showToast('error', err instanceof FetchTimeoutError ? 'Reaction check timed out' : 'Failed to check reaction');
        }
        finally {
            setChecking(false);
        }
    };

    const performReaction = async (reactionKey) => {
        try {
            setPerforming(true);
            const res = await fetchWithTimeout(
                `http://localhost:3000/api/reactions/queue/${reactionKey}?user=${user}`,
                { method: "POST" }
            );
            const data = await res.json();

            if (!res.ok) {
                showToast('error', data.error || 'Reaction failed');
                return;
            }

            if (data.energy !== undefined && !wsEnergyActiveRef.current) setEnergy(data.energy);
            if (data.inventory) setInventory(data.inventory);

            if (data.completed) {
                // Zero-duration synthesis: WS synthesis_completed/discovered already fired.
                // Only show fallback toast + trigger scene event if WS is not connected.
                if (!wsEnergyActiveRef.current) {
                    if (data.wasDiscovery) {
                        await fetchReactions();
                        setJustDiscoveredReactionKey(data.reactionKey);
                        setTimeout(() => setJustDiscoveredReactionKey(null), 3000);
                        showToast('milestone', 'Discovery! Synthesis complete');
                    } else {
                        showToast('success', selectedReaction ? `${selectedReaction.product.substance.name} synthesized` : 'Synthesis complete');
                    }
                    setReactionEvent({
                        type: data.wasDiscovery ? 'discovery' : 'reaction_success',
                        tier: selectedReaction?.unlockTier ?? 1,
                        timestamp: Date.now()
                    });
                }
                await fetchUserData();
            } else {
                // Timed synthesis — WS synthesis_queued event handles activeQueue update
                const label = data.revealOnCompletion
                    ? 'Unknown synthesis'
                    : (selectedReaction?.name || 'Synthesis');
                showToast('success', `${label} queued`);
                await fetchUserData();
            }
        }
        catch (err) {
            showToast('error', err instanceof FetchTimeoutError ? 'Reaction timed out' : 'Reaction failed');
        }
        finally {
            setPerforming(false);
        }

    };

    const fetchExpectedShards = async () => {
        try {
            const res = await fetchWithTimeout(`http://localhost:3000/api/genesis-shards/${user}`);
            const data = await res.json();
            setExpectedShards(data.genesisShards);
        }
        catch (err) {
            console.error(err);
        }
    };

    const fetchUserData = async () => {
        try {
            const res = await fetchWithTimeout(`http://localhost:3000/api/users/${user}`);
            const data = await res.json();
            setInventory(data.inventory);
            // WS owns energy once connected — REST only sets it on initial load
            if (!wsEnergyActiveRef.current) {
                setEnergy(data.energy);
            }
            setBigBangs(data.bigBangCount);
            setUnlockTier(data.unlockTier);
            setGenesisShards(data.genesisShards);
            setPrestigeUpgrades(data.prestigeUpgrades);
            setBlueprints(data.blueprints || []);
            setGenerators(data.generators || []);
            setReactionLog(data.reactionLog || []);
            setReactorCapabilities(data.reactorCapabilities || []);
        }
        catch (err) {
            console.error(err);
        }
    };
    const fetchReactions = async () => {
        try {
            const res = await fetchWithTimeout(`http://localhost:3000/api/reactions/available?user=${user}`);
            const data = await res.json();
            setReactions(data);
        }
        catch (err) {
            console.error(err);
        }
    };
    const fetchAtoms = async () => {
        try {
            const res = await fetchWithTimeout(`http://localhost:3000/api/atoms/${user}`);
            const data = await res.json();
            setAtoms(data);
        }
        catch (err) {
            console.error(err);
        }
    };


    useEffect(() => {
        if (!user) return;
        fetchExpectedShards();
    }, [user, inventory, unlockTier, bigBangs]);


    useEffect(() => {
        if (!user) return;
        fetchUserData();
    }, [user]);

    useEffect(() => {
        if (!user) return;
        if(wsRef.current) return; // Prevent multiple connections
        const ws = new WebSocket('ws://localhost:3000?user=' + user);
        wsRef.current = ws;
        ws.onopen = () => {
            console.log('WebSocket connected');
        };
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'reactor_state') {
                wsEnergyActiveRef.current = true;
                setActivityLevel(data.activityLevel);
                setEnergy(data.energy);
                setEnergyRate(data.energyPerSecond ?? 0);
            } else if (data.type === 'queue_state') {
                // Hydrate from server queue, but strip stale terminal entries.
                // Keep: active entries (processing/resolving) + recently-completed
                // entries still inside their visibility window. Schedule removal
                // for the latter when their remaining window expires.
                const incoming = data.queue || [];
                const nowMs = Date.now();
                const visible = [];
                const pendingTimeouts = [];
                for (const e of incoming) {
                    if (e.status === 'processing' || e.status === 'resolving' || e.status === 'queued') {
                        visible.push(e);
                        continue;
                    }
                    if (e.status === 'completed' || e.status === 'failed') {
                        const completedAtMs = e.completedAt ? new Date(e.completedAt).getTime() : null;
                        if (completedAtMs == null) continue;                           // retained without timestamp — treat as stale
                        const age = nowMs - completedAtMs;
                        if (age > COMPLETED_VISIBLE_MS) continue;                       // outside window — drop
                        visible.push(e);
                        pendingTimeouts.push({ key: queueEntryIdentity(e), remaining: COMPLETED_VISIBLE_MS - age });
                    }
                }
                setActiveQueue(visible);
                for (const { key, remaining } of pendingTimeouts) {
                    setTimeout(() => {
                        setActiveQueue(prev => prev.filter(x => queueEntryIdentity(x) !== key));
                    }, Math.max(0, remaining));
                }
            } else if (data.type === 'synthesis_queued') {
                setQueueEvent({ type: 'synthesis_queued', timestamp: Date.now() });
                setActiveQueue(prev => {
                    // Dedupe against literal event re-broadcast (multi-tab, server resend) by entry id —
                    // NOT by reactionKey, which would block legitimate parallel queues of the same reaction.
                    if (data.queueEntryId && prev.some(e => e.queueEntryId === data.queueEntryId)) return prev;
                    const entryStatus = data.status || 'processing';
                    return [...prev, {
                        queueEntryId:       data.queueEntryId,
                        reactionKey:        data.reactionKey,
                        slot:               data.slot ?? null,
                        status:             entryStatus,
                        startTime:          data.startTime ?? null,
                        expectedCompletion: data.expectedCompletion ?? null,
                        revealOnCompletion: data.revealOnCompletion,
                        reactionName:       data.reactionName || (data.revealOnCompletion ? 'Unknown Synthesis' : null)
                    }];
                });
            } else if (data.type === 'synthesis_promoted') {
                setActiveQueue(prev => prev.map(e =>
                    (data.queueEntryId && e.queueEntryId === data.queueEntryId)
                        ? { ...e, status: 'processing', slot: data.slot, startTime: data.startTime, expectedCompletion: data.expectedCompletion }
                        : e
                ));
            } else if (data.type === 'offline_summary') {
                const products = Array.isArray(data.products) ? data.products : [];
                const sample = products.slice(0, 3).join(', ');
                const more = products.length > 3 ? ` +${products.length - 3} more` : '';
                const discoveryNote = data.discoveries?.length ? ` · ${data.discoveries.length} discovered` : '';
                const failNote = data.failed > 0 ? ` · ${data.failed} failed` : '';
                const body = products.length > 0
                    ? `While you were away: ${data.count} synthes${data.count === 1 ? 'is' : 'es'} completed (${sample}${more})${discoveryNote}${failNote}`
                    : `While you were away: ${data.count} synthes${data.count === 1 ? 'is' : 'es'} completed${failNote}`;
                showToast(data.discoveries?.length ? 'milestone' : 'success', body);
                // Suppress per-product toasts for the immediately following individual events
                // so the user does not get a flood of duplicate "X synthesized" toasts.
                offlineToastSuppressUntilRef.current = Date.now() + 5000;
            } else if (data.type === 'synthesis_completed' || data.type === 'synthesis_discovered') {
                const wasDiscovery = data.type === 'synthesis_discovered';
                const completedKey = data.reactionKey;
                const completedEntryId = data.queueEntryId;
                setActiveQueue(prev => prev.map(e =>
                    (completedEntryId && e.queueEntryId === completedEntryId) ? { ...e, status: 'completed' } : e
                ));
                setTimeout(() => {
                    setActiveQueue(prev => prev.filter(e => !(completedEntryId && e.queueEntryId === completedEntryId && e.status === 'completed')));
                }, 2500);
                if (Date.now() >= offlineToastSuppressUntilRef.current) {
                    showToast(wasDiscovery ? 'milestone' : 'success', `${data.productName} synthesized`);
                }
                if (data.newCapabilities && data.newCapabilities.length > 0) {
                    data.newCapabilities.forEach(key => {
                        const label = key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                        showToast('milestone', `Reactor capability unlocked: ${label}`);
                    });
                }
                if (data.newUnlockTier && data.newUnlockTier !== data.prevUnlockTier) {
                    const prev = data.prevUnlockTier || 0;
                    for (let t = prev + 1; t <= data.newUnlockTier; t++) {
                        handleTierUnlock(t);
                    }
                    setNewlyRevealedTier(data.newUnlockTier);
                    setTimeout(() => setNewlyRevealedTier(null), 30000);
                    setPreviousUnlockTier(data.newUnlockTier);
                }
                if (wasDiscovery) {
                    setJustDiscoveredReactionKey(completedKey);
                    setTimeout(() => setJustDiscoveredReactionKey(null), 3000);
                    fetchReactions();
                }
                if (data.discoveryTransitions && data.discoveryTransitions.length > 0) {
                    let needsRefetch = false;
                    for (const t of data.discoveryTransitions) {
                        if (t.newState === 'understood') {
                            showToast('milestone', `Pathway understood: ${t.reactionName}`);
                            needsRefetch = true;
                        } else if (t.newState === 'near_complete') {
                            const count = t.totalSignals > 0 ? ` — ${t.completedSignals} of ${t.totalSignals} inputs known` : '';
                            showToast('info', `Gen ${t.generationTier} synthesis pathway nearly complete${count}`);
                            needsRefetch = true;
                        } else if (t.newState === 'partial') {
                            const count = t.totalSignals > 0 ? ` — ${t.completedSignals} of ${t.totalSignals} inputs known` : '';
                            showToast('info', `Gen ${t.generationTier} synthesis pathway partially mapped${count}`);
                            needsRefetch = true;
                        }
                        // anomaly transitions appear silently in the reaction panel
                    }
                    if (needsRefetch && !wasDiscovery) fetchReactions();
                }
                setReactionEvent({
                    type: wasDiscovery ? 'discovery' : 'reaction_success',
                    reactionKey: completedKey,
                    timestamp: Date.now()
                });
                fetchUserData();
            } else if (data.type === 'synthesis_failed') {
                const failedEntryId = data.queueEntryId;
                setActiveQueue(prev => prev.map(e =>
                    (failedEntryId && e.queueEntryId === failedEntryId) ? { ...e, status: 'failed' } : e
                ));
                setTimeout(() => {
                    setActiveQueue(prev => prev.filter(e => !(failedEntryId && e.queueEntryId === failedEntryId && e.status === 'failed')));
                }, 2500);
                setReactionEvent({ type: 'experiment_failed', timestamp: Date.now() });
                if (Date.now() >= offlineToastSuppressUntilRef.current) {
                    showToast('error', 'Synthesis failed');
                }
            }
        };
        return () => {
            if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
                ws.close();
            }
            wsRef.current = null;
        };
    }, [user]);

    useEffect(() => {
        if (!user) return;
        fetchReactions();
    }, [user, unlockTier]);

    useEffect(() => {
        if (!user) return;
        fetchAtoms();
    }, [user]);

    useEffect(() => {
        if (previousUnlockTier !== unlockTier) setPreviousUnlockTier(unlockTier);
    }, [unlockTier]);

    useEffect(() => {
        async function checkSelectedReaction() {
            if (isBusy) return;
            if (selectedReaction?.reactionKey) {
                await checkReaction(selectedReaction.reactionKey);
            }
        }
        checkSelectedReaction();
    }, [inventory, unlockTier, prestigeUpgrades]);

    // Auto-resolve: when a processing entry's deadline passes, ping the server once so
    // resolveAndPruneUserQueue runs and emits the WS completion event. Product delivery
    // comes exclusively from the WS synthesis_completed/synthesis_discovered handler.
    useEffect(() => {
        if (!user) return;
        const processingEntries = activeQueue.filter(e => e.status === 'processing');
        if (processingEntries.length === 0) {
            expiredPingsSentRef.current.clear();
            return;
        }
        const id = setInterval(async () => {
            const now = Date.now();
            for (const entry of processingEntries) {
                // Per-entry identity — never key on reactionKey, which collides
                // when two slots run the same reaction in parallel.
                const id = queueEntryIdentity(entry);
                if (expiredPingsSentRef.current.has(id)) continue;
                if (new Date(entry.expectedCompletion).getTime() <= now) {
                    expiredPingsSentRef.current.add(id);
                    try {
                        await fetchUserData();
                    } catch {
                        // Allow retry on next tick
                        expiredPingsSentRef.current.delete(id);
                    }
                }
            }
        }, 500);
        return () => clearInterval(id);
    }, [user, activeQueue]);

    return (
        <>
            <div className="bigbang-overlay" data-phase={bigBangPhase || ''} />
            <button
                className="test-bigbang-btn"
                onClick={testBigBangAnimation}
                disabled={bigBangActive}
            >
                TEST BIGBANG
            </button>
            <div className="game-shell" data-bigbang={bigBangPhase || undefined}>
                <HeaderPanel
                    unlockTier={unlockTier}
                    bigBangs={bigBangs}
                    genesisShards={genesisShards}
                    energy={energy}
                    energyRate={energyRate}
                    user={user}
                    onLogout={handleLogout}
                />
                <ObjectiveStrip getCurrentGoal={getCurrentGoal} unlockTier={unlockTier} />

                <div className="main-columns">
                    <div className="left-panel">
                        <div className="panel-card atom-card">
                            <AtomPanel atoms={atoms} createAtom={createAtom} energy={energy} creatingAtom={creatingAtom} isBusy={isBusy} />
                        </div>
                        <div className="panel-card matter-lab-card">
                            <InventoryPanel inventory={inventory} />
                            <div className="matter-divider" />
                            <ExperimentPanel inventory={inventory} />
                        </div>
                    </div>

                    <div className="center-scene">
                        <div className="scene-canvas">
                            <GenesisScene onCoreClick={handleCoreClick} activityLevel={activityLevel} creationEvent={creationEvent} reactionEvent={reactionEvent} bigBangPhase={bigBangPhase} queueEvent={queueEvent} isProcessing={isProcessing} />
                        </div>
                    </div>

                    <div className="right-panel">
                        <QueuePanel activeQueue={activeQueue} maxSlots={maxSlots} maxBufferSlots={maxBufferSlots} />
                        {reactorCapabilities.length > 0 && (
                            <div className="panel-card reactor-caps-panel">
                                <button className="reactor-caps-header" onClick={() => setCapsExpanded(e => !e)}>
                                    <span className="panel-title">Reactor Capabilities</span>
                                    <span className="caps-toggle-hint">
                                        {reactorCapabilities.length} active {capsExpanded ? '▴' : '▾'}
                                    </span>
                                </button>
                                {capsExpanded && (
                                    <div className="reactor-caps-list">
                                        {reactorCapabilities.map(key => (
                                            <span key={key} className="reactor-cap-chip">
                                                {key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                        <ReactionPanel reactions={reactions} checkReaction={checkReaction} selectedReaction={selectedReaction} energy={energy} isBusy={isBusy} newlyRevealedTier={newlyRevealedTier} justDiscoveredReactionKey={justDiscoveredReactionKey} />
                        <SelectedReactionPanel selectedReaction={selectedReaction} inventory={inventory} performReaction={performReaction} isBusy={isBusy} result={result} onClose={() => { setSelectedReaction(null); setResult(""); }} reactorOccupied={reactorOccupied} reactorCapabilities={reactorCapabilities} />
                        <div className="panel-card prestige-card">
                            <button className="upgrades-header" onClick={() => setUpgradesExpanded(e => !e)}>
                                <span className="panel-title">Upgrades</span>
                                <span className="upgrades-toggle-hint">
                                    {upgradesExpanded ? 'expanded ▴' : 'collapsed ▾'}
                                </span>
                            </button>
                            {upgradesExpanded && (
                                <PrestigeBranchPanel
                                    genesisShards={genesisShards}
                                    blueprints={blueprints}
                                    prestigeUpgrades={prestigeUpgrades}
                                    purchaseBlueprint={purchaseBlueprint}
                                    isBusy={isBusy}
                                    generators={generators}
                                    constructModule={constructGenerator}
                                    upgradeModule={upgradeGenerator}
                                    userEnergy={energy}
                                    inventory={inventory}
                                />
                            )}
                        </div>
                        <div className="bigbang-zone">
                            <BigBangPanel bigBang={bigBang} bigBangActive={bigBangActive} expectedShards={expectedShards} activeQueueCount={activeQueue.filter(e => e.status === 'processing' || e.status === 'resolving' || e.status === 'queued').length} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={`notebook-drawer${notebookOpen ? ' notebook-drawer--open' : ''}${bigBangPhase ? ' notebook-drawer--bigbang' : ''}`}>
                <button className="notebook-drawer-tab" onClick={() => setNotebookOpen(o => !o)}>
                    <span className="notebook-drawer-label">Lab Notebook</span>
                    <span className="notebook-drawer-chevron" aria-hidden="true" />
                </button>
                <div className="notebook-drawer-body">
                    <LabNotebookPanel reactionLog={reactionLog} />
                </div>
            </div>
        </>
    );

};
export default LabSimulation;
