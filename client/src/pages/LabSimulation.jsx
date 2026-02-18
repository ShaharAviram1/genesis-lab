import { useState, useEffect } from "react";




const LabSimulation = () => {
    const [user, setUser] = useState("alchemist");
    const [reactions, setReactions] = useState([]);
    const [selectedReaction, setSelectedReaction] = useState(null);
    const [result, setResult] = useState("");
    const [inventory, setInventory] = useState([]);
    const [checking, setChecking] = useState(false);
    const [performing, setPerforming] = useState(false);


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
                await fetchInventory();
                await checkReaction(reactionID);
            }
        }
        catch (err) {
            console.log(err);
        }
        finally {
            setPerforming(false);  
        }
        
    };

    const fetchInventory = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/users/${user}`);
                const data = await res.json();
                setInventory(data.inventory);
            }
            catch (err) {
                console.log(err);
            }
        };

    useEffect(() => {
        fetchInventory();
    }, [user]);

    useEffect(() => {
        const fetchReactions = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/reactions");
                const data = await res.json();
                setReactions(data);
            }
            catch (err) {
                console.log(err);
            }
        };
        fetchReactions();
    }, []);

    return (
        <>
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
            <h1>Reactions availability</h1>
            {reactions.map((reaction) => (
                <button key={reaction.reactionID} disabled={checking || performing} onClick={() => checkReaction(reaction.reactionID)}>
                    {reaction.reactants.map(r => `${r.quantity} ${r.substance.symbol}`).join(" + ")} → {reaction.product.quantity} {reaction.product.substance.symbol}
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
                                {reactant.quantity} {reactant.substance.symbol} — You have {userQuantity} {hasEnough ? "✅" : "❌"}
                            </div>
                        );
                    })}
                    <p>{result}</p>
                    {result === "✅ Can Perform" && (
                        <button disabled={checking || performing} onClick={() => performReaction(selectedReaction.reactionID)}>
                            Perform reaction
                        </button>
                    )}
                </div>
            )}
        </>
    );

};
export default LabSimulation;