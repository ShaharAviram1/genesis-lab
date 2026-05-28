import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import "./LabSimulation.css";
import fetchWithTimeout, { FetchTimeoutError } from "../utils/fetchWithTimeout";
import { useToast } from "../context/ToastContext";
import InventoryPanel from "../../components/InventoryPanel";
import AtomPanel from "../../components/AtomPanel";
import ReactionPanel from "../../components/ReactionPanel";
import SelectedReactionPanel from "../../components/SelectedReactionPanel";
import EnergyPanel from "../../components/EnergyPanel";
import PrestigePanel from "../../components/PrestigePanel";
import HeaderPanel from "../../components/HeaderPanel";
import BigBangPanel from "../../components/BigBangPanel";

import GenesisScene from "../../components/GenesisScene";
import ExperimentPanel from "../../components/ExperimentPanel";
import LabNotebookPanel from "../../components/LabNotebookPanel";



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
    const [upgrading, setUpgrading] = useState("");
    const [bigBangPhase, setBigBangPhase] = useState(null); // null | 'collapse' | 'singularity' | 'flash' | 'expansion' | 'rebirth'
    const [expectedShards, setExpectedShards] = useState(0);
    const [previousUnlockTier, setPreviousUnlockTier] = useState(0);
    const [activityLevel, setActivityLevel] = useState(0);
    const [energyRate, setEnergyRate] = useState(0);
    const [reactionLog, setReactionLog] = useState([]);
    const [notebookOpen, setNotebookOpen] = useState(false);
    const [newlyRevealedTier, setNewlyRevealedTier] = useState(null);
    const [justDiscoveredReactionKey, setJustDiscoveredReactionKey] = useState(null);
    const [creationEvent, setCreationEvent] = useState(null);
    const [reactionEvent, setReactionEvent] = useState(null);
    const wsRef = useRef(null);
    const wsEnergyActiveRef = useRef(false);
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

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setUser(username);
    }, [username, user]);
    

    const bigBangActive = !!bigBangPhase;
    const isBusy = checking || performing || creatingAtom || upgrading || bigBangActive;

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    const runBigBangSequence = async (skipApi = false) => {
        // Fire API immediately so it runs in parallel with the animation
        const apiPromise = skipApi
            ? Promise.resolve({ success: true })
            : fetchWithTimeout(`http://localhost:3000/api/bigbang?user=${user}`, { method: "POST" })
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
            10: "Gen 1–3 complete"
        };
        const message = tierMessages[newTier] || "New tier unlocked";
        showToast("milestone", `\u2726 Tier ${newTier}: ${message}`);
    };

    const getCurrentGoal = () => {
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
        if (unlockTier === 9) return "Bring your most advanced materials together for the final synthesis.";
        return "The reactor has synthesized everything in the known universe. The Big Bang awaits.";
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

 /*    const generateEnergy = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/generate-energy?user=${user}`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setEnergy(data.energy);
            }
        }
        catch (err) {
            console.log(err);
        }
    }
 */
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

    const upgradePrestige = async (type) => { 
        try {
            if (type === "energy") {
                setUpgrading("energy");
            }
            else if (type === "matter") {
                setUpgrading("matter");
            }
            else if (type === "chemistry") {
                setUpgrading("chemistry");
            }
            const res = await fetchWithTimeout(`http://localhost:3000/api/prestige/upgrade/${user}`, { method: "POST" , body: JSON.stringify({ upgrade: type }), headers: { 'Content-Type': 'application/json' }});
            const data = await res.json();
            if (data.success) {
                await fetchUserData();
                await fetchReactions();
                await fetchAtoms();
                showToast('success', `${type.charAt(0).toUpperCase() + type.slice(1)} upgrade purchased`);
            }
        }
        catch (err) {
            showToast('error', err instanceof FetchTimeoutError ? 'Upgrade timed out' : 'Upgrade failed');
        }
        finally {
            setUpgrading("");
        }
    }


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
                const productName = data.reaction?.product?.substance?.name || "New substance";
                const successMessage = data.discovered
                    ? `Discovery! ${productName} created`
                    : `Experiment successful: ${productName} created`;

                showToast(data.discovered ? 'milestone' : 'success', successMessage);
                if (data.discovered && data.reactionKey) {
                    setJustDiscoveredReactionKey(data.reactionKey);
                    setTimeout(() => setJustDiscoveredReactionKey(null), 3000);
                }
                setReactionEvent({
                    type: data.discovered ? "discovery" : "experiment_success",
                    reactionKey: data.reactionKey,
                    tier: data.reaction?.unlockTier ?? 1,
                    timestamp: Date.now()
                });
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
            const res = await fetchWithTimeout(`http://localhost:3000/api/perform/${reactionKey}?user=${user}`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                await fetchUserData();
                if (data.discovered) {
                    await fetchReactions();
                    setJustDiscoveredReactionKey(data.reactionKey);
                    setTimeout(() => setJustDiscoveredReactionKey(null), 3000);
                    showToast('milestone', selectedReaction ? `Discovery! ${selectedReaction.product.substance.name} synthesized` : 'Discovery!');
                } else {
                    showToast('success', selectedReaction ? `${selectedReaction.product.substance.name} synthesized` : 'Reaction complete');
                }
                setReactionEvent({
                    type: data.discovered ? 'discovery' : 'reaction_success',
                    tier: selectedReaction?.unlockTier ?? 1,
                    timestamp: Date.now()
                });
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
            setReactionLog(data.reactionLog || []);
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
        if (previousUnlockTier < unlockTier && previousUnlockTier !== 0) {
            handleTierUnlock(unlockTier);
            setNewlyRevealedTier(unlockTier);
            const t = setTimeout(() => setNewlyRevealedTier(null), 30000);
            return () => clearTimeout(t);
        }
        previousUnlockTier !== unlockTier && setPreviousUnlockTier(unlockTier);
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
                <div className="top-bar">
                    <HeaderPanel unlockTier={unlockTier} bigBangs={bigBangs} genesisShards={genesisShards} getCurrentGoal={getCurrentGoal} />
                    <div className="lab-account">
                        <span className="lab-account-user">{user}</span>
                        <button className="lab-logout-btn" onClick={handleLogout}>Logout</button>
                    </div>
                </div>

                <div className="main-columns">
                    <div className="left-panel">
                        <div className="panel-card atom-card">
                            <AtomPanel atoms={atoms} createAtom={createAtom} energy={energy} creatingAtom={creatingAtom} isBusy={isBusy} />
                        </div>
                        <div className="panel-card matter-lab-card">
                            <InventoryPanel inventory={inventory} />
                            <div className="matter-divider" />
                            <ExperimentPanel inventory={inventory} experiment={experiment} />
                        </div>
                    </div>

                    <div className="center-scene">
                        <div className="scene-canvas">
                            <GenesisScene onCoreClick={handleCoreClick} activityLevel={activityLevel} creationEvent={creationEvent} reactionEvent={reactionEvent} bigBangPhase={bigBangPhase} />
                        </div>
                    </div>

                    <div className="right-panel">
                        <EnergyPanel energy={energy} energyRate={energyRate} />
                        <ReactionPanel reactions={reactions} checkReaction={checkReaction} selectedReaction={selectedReaction} energy={energy} isBusy={isBusy} newlyRevealedTier={newlyRevealedTier} justDiscoveredReactionKey={justDiscoveredReactionKey} />
                        <SelectedReactionPanel selectedReaction={selectedReaction} inventory={inventory} performReaction={performReaction} isBusy={isBusy} result={result} onClose={() => { setSelectedReaction(null); setResult(""); }} />
                        <div className="panel-card prestige-card">
                            <div className="panel-title">Upgrades</div>
                            <PrestigePanel prestigeUpgrades={prestigeUpgrades} upgradePrestige={upgradePrestige} genesisShards={genesisShards} upgrading={upgrading} isBusy={isBusy} />
                        </div>
                        <div className="bigbang-zone">
                            <BigBangPanel bigBang={bigBang} bigBangActive={bigBangActive} expectedShards={expectedShards} />
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