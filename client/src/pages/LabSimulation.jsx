import { useState, useEffect } from "react";




const LabSimulation = () => {
    const [user, setUser] = useState("alchemist");
    const [reactions, setReactions] = useState([]);
    const [selectedReaction, setSelectedReaction] = useState(null);
    const [result, setResult] = useState("");


    const checkReaction = async (reaction) => {
        const res = await fetch(`http://localhost:3000/api/reactions/${ reaction }?user=${ user }`);
        const data = await res.json();
        setSelectedReaction(data.reaction);
        setResult(data.canPerform ? "✅ Can Perform" : "❌ Cannot Perform");
    };

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
            <h1>Reactions availablity</h1>
            {reactions.map((reaction) => (
                <button key={reaction.reactionID} onClick={async () => await checkReaction(reaction.reactionID)}>
                    Reaction: {reaction.product}
                </button>
            ))}
            {selectedReaction && 
                <div>
                <p2>Can reaction be performed?</p2>
                <pre>{result}</pre>
                </div>
            }
        </>
    );

};
export default LabSimulation;