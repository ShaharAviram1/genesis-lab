import { useState, useEffect } from "react";




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
            setResult(data.canPerform ? "✅ Can Perform" : "❌ Cannot Perform");
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
        fetchUserData();
    }, [user]);

    useEffect(() => {
        fetchReactions();
    }, [user]);

    useEffect(() => {
        fetchAtoms();
    }, [user]);


    useEffect(() => {
        async function checkSelectedReaction() {
            if (checking || performing || creatingAtom || upgrading || bigBangInProgress) return;
            if (selectedReaction?.reactionID) {
                await checkReaction(selectedReaction.reactionID);
            }
        }
        checkSelectedReaction();
    }, [inventory, energy, unlockTier, prestigeUpgrades]);

    return (
        <>
            <h1>Genesis Lab Simulation</h1>
            {/* BIG BANG CONTROL */}
            <button onClick={bigBang} disabled={bigBangInProgress || (bigBangs > 0 && (unlockTier < 3 || energy < 1000))}>{bigBangInProgress ? "Big Bang in progress..." : "Perform Big Bang"}</button>
            {!bigBangInProgress && ( 
                <>
                {/* HEADER */}
                <h3>Unlock Tier: {unlockTier} --- Big Bangs: {bigBangs}</h3>
                <h4>Genesis Shards: {genesisShards}</h4>

                {/* PRESTIGE */}
                {Object.entries(prestigeUpgrades).map(([key, value]) => (
                    <p key={key}>{key.charAt(0).toUpperCase() + key.slice(1)} Prestige Upgrades: {value} <button onClick={() => upgradePrestige(key)} disabled={upgrading === key || genesisShards < ((prestigeUpgrades[key]+1) * 2) || creatingAtom || performing || checking || bigBangInProgress}>{`Upgrade ${key.charAt(0).toUpperCase() + key.slice(1)} (cost: ${(prestigeUpgrades[key]+1) * 2} Genesis Shards)`}</button></p>
                ))}

                {/* ENERGY */}
                <p>Energy: {energy} <button onClick={() => generateEnergy()}>Generate Energy</button></p>

                {/* ATOMS */}
                <h2>Create atoms</h2>
                {atoms.map((atom) => (
                    <button key={atom.name} onClick={() => createAtom(atom.name)} disabled={creatingAtom || energy < atom.energyCost || performing || checking || upgrading || bigBangInProgress}>
                        {creatingAtom === atom.name ? `Creating ${atom.name}` : `${atom.name} (cost ${atom.energyCost}⚡)`}
                    </button>
                ))}

                {/* INVENTORY */}
                <h2>Inventory</h2>
                {inventory.length === 0 ? 
                    (<p>Inventory empty</p>
                    ) : (
                        inventory.map((item) => (
                            <div key={item.substance._id}>
                                {item.substance.name} ({item.substance.symbol}) : {item.quantity}
                            </div>
                        ))
                    )}

                {/* REACTIONS */}
                <h1>Reactions availability</h1>
                {reactions.map((reaction) => (
                    <button key={reaction.reactionID} disabled={checking || performing || creatingAtom || energy < reaction.energyCost || upgrading || bigBangInProgress} onClick={() => checkReaction(reaction.reactionID)}>
                        {selectedReaction?.reactionID === reaction.reactionID ? "[Selected] " : ""}{reaction.reactants.map(r => `${r.quantity} ${r.substance.name}`).join(" + ")} → {reaction.product.quantity} {reaction.product.substance.name} (cost {reaction.energyCost} ⚡)
                    </button>
                ))}
                {checking && !performing && (
                    <div>
                        <h3>Checking...</h3>
                    </div>
                )}
                {performing && (
                    <div>
                        <h3>Performing...</h3>
                    </div>
                )}

                {/* SELECTED REACTION */}
                {selectedReaction && !checking && !performing &&(
                    <div>
                        <h3>Reaction Result</h3>
                        <h4>Requirements</h4>
                        {selectedReaction.reactants.map((reactant) => {
                            const userItem = inventory.find(item => item.substance._id === reactant.substance._id);
                            const userQuantity = userItem ? userItem.quantity : 0;
                            const hasEnough = userQuantity >= reactant.quantity;
                            return (
                                <div key={reactant.substance._id}>
                                    {reactant.substance.name}: {userQuantity}/{reactant.quantity} {hasEnough ? "✅" : "❌"}
                                </div>
                            );
                        })}
                        <p>{result}</p>
                        {result === "✅ Can Perform" && (
                            <button disabled={checking || performing || creatingAtom || upgrading || bigBangInProgress} onClick={() => performReaction(selectedReaction.reactionID)}>
                                Perform reaction
                            </button>
                        )}
                    </div>
                )}
                </>
            )}
        </>
    );

};
export default LabSimulation;