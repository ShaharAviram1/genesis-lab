import { useState, useEffect } from "react";
import "./LabSimulation.css";
import InventoryPanel from "../../components/InventoryPanel";
import AtomPanel from "../../components/AtomPanel";
import ReactionPanel from "../../components/ReactionPanel";
import SelectedReactionPanel from "../../components/SelectedReactionPanel";
import EnergyPanel from "../../components/EnergyPanel";
import PrestigePanel from "../../components/PrestigePanel";
import HeaderPanel from "../../components/HeaderPanel";
import BigBangPanel from "../../components/BigBangPanel";
import GenesisScene from "../../components/GenesisScene";



const LabSimulation = () => {
    const [user, setUser] = useState("alchemist");
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
    const [bigBangInProgress, setBigBangInProgress] = useState(false);
    const [expectedShards, setExpectedShards] = useState(0);
    const [tierPopup, setTierPopup] = useState(false);
    const [previousUnlockTier, setPreviousUnlockTier] = useState(0);
    const [activityLevel, setActivityLevel] = useState(0); // New state for activity level

    const isBusy = checking || performing || creatingAtom || upgrading || bigBangInProgress;

    const bigBang = async () => {
        try {
            setBigBangInProgress(true);
            const res = await fetch(`http://localhost:3000/api/bigbang?user=${user}`, { method: "POST" });
            const data = await res.json();
            if (data.success) {
                setUser(data.username);
                setBigBangs(data.bigBangCount);
                await fetchUserData();
                await fetchReactions();
                await fetchAtoms();
                setSelectedReaction(null);
                setResult("");
            }
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setBigBangInProgress(false);
        }
    }

    const handleTierUnlock = (newTier) => {
        const tierMessages = {
            1: "You’ve begun your journey",
            2: "Basic Chemistry Expanded",
            3: "Fuel Reactions Available",
            4: "Organic Chemistry Unlocked",
            5: "Complex Systems Emerging"
        };
        setTierPopup({ tier: newTier, message: tierMessages[newTier] || "New Tier Unlocked" });
        // auto-hide after 3 seconds
        setTimeout(() => {
            setTierPopup(null);
        }, 3000);
};

    const getCurrentGoal = () => {
        if (inventory.length === 0) {
            return "Create your first atom";
        }

        const hasCompound = inventory.some(item => item.substance.type === "compound");
        if (!hasCompound) {
            return "Try combining atoms to discover a new compound";
        }

        if (unlockTier === 1) {
            return "Combine atoms to form simple compounds";
        }

        if (unlockTier === 2) {
            return "Expand your inventory and unlock stronger reactions";
        }

        if (unlockTier >= 3) {
            return "Build up resources and prepare for a Big Bang reset";
        }

        return "Explore and experiment";
    };

    const createAtom = async (atom) => {
        try {
            setCreatingAtom(atom);
            const res = await fetch(`http://localhost:3000/api/atoms/create?user=${user}`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                }, body: JSON.stringify({atom: atom})
                });
            const data = await res.json();
            if (data.success) {
                setInventory(data.inventory);
                setEnergy(data.energy);
            }
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setCreatingAtom("");
        }
    }

    const generateEnergy = async () => {
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
            const res = await fetch(`http://localhost:3000/api/prestige/upgrade/${user}`, { method: "POST" , body: JSON.stringify({ upgrade: type }), headers: { 'Content-Type': 'application/json' }});
            const data = await res.json();
            if (data.success) {
                await fetchUserData();
                await fetchReactions();
                await fetchAtoms();
            }
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setUpgrading("");
        }
    }


    const checkReaction = async (reaction) => {
        try {
            setChecking(true);
            setResult("");
            const res = await fetch(`http://localhost:3000/api/reactions/${reaction}?user=${user}`);
            const data = await res.json();
            setSelectedReaction(data.reaction);
            setResult(data.canPerform);
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setChecking(false);
        }
    };

    const performReaction = async (reactionID) => {
        try {
            setPerforming(true);
            const res = await fetch(`http://localhost:3000/api/perform/${reactionID}?user=${user}`,{method: "POST"});
            const data = await res.json();
            if (data.success) {
                await fetchUserData();
            }
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setPerforming(false);  
        }
        
    };

    const fetchExpectedShards = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/genesis-shards/${user}`);
            const data = await res.json();
            setExpectedShards(data.genesisShards);
        }
        catch (err) {
            console.log(err);
        }
    };

    const fetchUserData = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/users/${user}`);
            const data = await res.json();
            setInventory(data.inventory);
            setEnergy(data.energy);
            setBigBangs(data.bigBangCount);
            setUnlockTier(data.unlockTier);
            setGenesisShards(data.genesisShards);
            setPrestigeUpgrades(data.prestigeUpgrades);
        }
        catch (err) {
            console.log(err);
        }
    };
    const fetchReactions = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/reactions/available?user=${user}`);
            const data = await res.json();
            setReactions(data);
        }
        catch (err) {
            console.log(err);
        }
    };
    const fetchAtoms = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/atoms/${user}`);
            const data = await res.json();
            setAtoms(data);
        }  
        catch (err) {
            console.log(err);
        }
    };
    

    useEffect(() => {
        fetchExpectedShards();
    }, [inventory, unlockTier, bigBangs]);

    useEffect(() => {
        fetchUserData();
    }, [user]);

    useEffect(() => { 
        const interval = setInterval(() => {
            if (activityLevel > 2) {
                generateEnergy();
            }
        }, 500); // Generate energy every half second
        return () => clearInterval(interval); // Cleanup interval on unmount
    }, []);

    useEffect(() => {
        fetchReactions();
    }, [user, unlockTier]);

    useEffect(() => {
        fetchAtoms();
    }, [user]);

    useEffect(() => {
        if (previousUnlockTier < unlockTier && previousUnlockTier !== 0) {
            handleTierUnlock(unlockTier);
        }
        previousUnlockTier !== unlockTier && setPreviousUnlockTier(unlockTier);
    }, [unlockTier]);

    useEffect(() => {
        async function checkSelectedReaction() {
            if (isBusy) return;
            if (selectedReaction?.reactionID) {
                await checkReaction(selectedReaction.reactionID);
            }
        }
        checkSelectedReaction();
    }, [inventory, energy, unlockTier, prestigeUpgrades]);

    return (
        <>
            {tierPopup && (
                <div className="tier-popup">
                    🚀 Tier {tierPopup.tier} Unlocked: {tierPopup.message}
                </div>
            )}
            {!bigBangInProgress && ( 
                <div className="game-shell">
                    <div className="top-bar">
                    {/* HEADER */}
                        <HeaderPanel unlockTier={unlockTier} bigBangs={bigBangs} genesisShards={genesisShards} getCurrentGoal={getCurrentGoal} />
                    </div>

                    <div className="bottom-bar">
                        {/* PRESTIGE */}
                        <PrestigePanel prestigeUpgrades={prestigeUpgrades} upgradePrestige={upgradePrestige} genesisShards={genesisShards} upgrading={upgrading} isBusy={isBusy} />
                        {/* BIG BANG CONTROL */}
                        <BigBangPanel bigBang={bigBang} bigBangInProgress={bigBangInProgress} expectedShards={expectedShards} />
                    </div>

                    <div className="center-scene">
                        <GenesisScene onCoreClick={generateEnergy} onActivityChange={setActivityLevel} />
                        <div>
                            {/* ENERGY */}
                            <EnergyPanel energy={energy} generateEnergy={generateEnergy} />
                            {/* ATOMS */}
                            <AtomPanel atoms={atoms} createAtom={createAtom} energy={energy} creatingAtom={creatingAtom} isBusy={isBusy} />
                            </div>
                    </div>

                    <div className="left-panel"> 
                        {/* INVENTORY */}
                        <InventoryPanel inventory={inventory} />
                    </div>

                    <div className="right-panel">
                        {/* REACTIONS */}
                        <ReactionPanel reactions={reactions} checkReaction={checkReaction} selectedReaction={selectedReaction} energy={energy} isBusy={isBusy} />
                        {/* SELECTED REACTION */}
                        <SelectedReactionPanel selectedReaction={selectedReaction} inventory={inventory} performReaction={performReaction} isBusy={isBusy} result={result} />
                    </div>

                </div>
            )}
        </>
    );

};
export default LabSimulation;