function ReactionPanel({reactions, checkReaction, selectedReaction, energy, isBusy, checking, performing}) {
    return (
        <>
            <h1>Reactions availability</h1>

            {reactions.map((reaction) => {
                const isDisabled = isBusy || energy < reaction.energyCost;
                const isSelected = selectedReaction?.reactionID === reaction.reactionID;
                return (
                    <button key={reaction.reactionID} disabled={isDisabled} onClick={() => checkReaction(reaction.reactionID)}>
                        {isSelected ? "[Selected] " : ""}{reaction.reactants.map(r => `${r.quantity} ${r.substance.name}`).join(" + ")} → {reaction.product.quantity} {reaction.product.substance.name} (cost {reaction.energyCost} ⚡)
                    </button>
                );
            })}
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
        </>
    );
}
export default ReactionPanel;