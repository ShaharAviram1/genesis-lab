import { useState, useEffect } from "react";



const LabData =  () => { 
    const [substances, setSubstances] = useState([]);
    const [reactions, setReactions] = useState([]);

    useEffect(() => { 
        const fetchsubstancesData = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/substances");
                const data = await res.json();
                setSubstances(data);
            }
            catch (err) {
                console.log(err);
            }
        };
        fetchsubstancesData();
    }, []);
    useEffect(() => {
        const fetchReactionsData = async () => {
            try{
                const res = await fetch("http://localhost:3000/api/reactions");
                const data = await res.json();
                setReactions(data);
            }
            catch (err) {
                console.log(`error fetching data: ${err}`);
            }
        };
        fetchReactionsData();
    }, []);
    return (
        <div>
            <h2>substances</h2>
            {Array.isArray(substances) && substances.length > 0 ? (
            substances.map((el, idx) =>
                el && el._id && el.name && el.symbol ? (
                <p key={el._id}>
                    {el.name} ({el.symbol})
                </p>
                ) : (
                    <p key={`invalid-${idx}`}>Invalid substance object</p>
                )
            )
            ) : (
            <p>No substances available.</p>
            )}

            <h2>Reactions</h2>
            {Array.isArray(reactions) && reactions.length > 0 ? (
            reactions.map((rxn, idx) =>
                rxn && rxn._id && rxn.reactants && rxn.product ? (
                <p key={rxn._id}>
                    {rxn.reactants.map((r)=>`${r.quantity} ${r.substance.name}(${r.substance.symbol})`).join(" + ")} → {rxn.product.quantity} {rxn.product.substance.name}({rxn.product.substance.symbol})
                </p>
                ) : (
                    <p key={`invalid-${idx}`}>Invalid reaction object</p>
                )
            )
            ) : (
            <p>No reactions available.</p>
            )}
        </div>
    );
};

export default LabData;