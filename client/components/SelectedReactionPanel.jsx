function SelectedReactionPanel({ selectedReaction, inventory, performReaction, isBusy, result}) {
    return (
        <>
            {selectedReaction && !isBusy &&(
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
                    <p>{result ? "✅ Can Perform" : "❌ Cannot Perform"}</p>
                    {result && (
                        <button disabled={isBusy} onClick={() => performReaction(selectedReaction.reactionID)}>
                            Perform reaction
                        </button>
                    )}
                </div>
            )}
        </>
    );
}

export default SelectedReactionPanel;