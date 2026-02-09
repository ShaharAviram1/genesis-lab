import { useState, useEffect } from "react";



const LabData =  () => { 
    const [elements, setElements] = useState([]);
    const [reactions, setReactions] = useState([]);

    useEffect(() => { 
        const fetchElementsData = async () => {
            try {
                const res = await fetch("http://localhost:3000/api/elements");
                const data = await res.json();
                setElements(data);
            }
            catch (err) {
                console.log(err);
            }
        };
        fetchElementsData();
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
            <h2>Elements</h2>
            {Array.isArray(elements) && elements.length > 0 ? (
            elements.map((el, idx) =>
                el && el._id && el.name && el.symbol ? (
                <p key={el._id}>
                    {el.name} ({el.symbol})
                </p>
                ) : (
                    <p key={`invalid-${idx}`}>Invalid element object</p>
                )
            )
            ) : (
            <p>No elements available.</p>
            )}

            <h2>Reactions</h2>
            {Array.isArray(reactions) && reactions.length > 0 ? (
            reactions.map((rxn, idx) =>
                rxn && rxn._id && rxn.reactants && rxn.product ? (
                <p key={rxn._id}>
                    {rxn.reactants.map((r)=>`${r.quantity} ${r.element.name}(${r.element.symbol})`).join(" + ")} → {rxn.product}
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