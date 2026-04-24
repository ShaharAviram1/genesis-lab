import './ReactionPanel.css';

function ReactionPanel({ reactions, checkReaction, selectedReaction, energy, isBusy, checking, performing }) {
    return (
        <div className="panel-card reaction-panel">
            <div className="panel-title">Reactions</div>
            <div className="reaction-list">
                {reactions.map((reaction) => {
                    const isDisabled = isBusy || energy < reaction.energyCost;
                    const isSelected = selectedReaction?.reactionID === reaction.reactionID;
                    return (
                        <button
                            key={reaction.reactionID}
                            className={`reaction-card ${isSelected ? 'selected' : ''}`}
                            disabled={isDisabled}
                            onClick={() => checkReaction(reaction.reactionID)}
                        >
                            <span className="reaction-formula">
                                {reaction.reactants.map(r => `${r.quantity} ${r.substance.name}`).join(' + ')}
                                <span className="reaction-arrow"> → </span>
                                {reaction.product.quantity} {reaction.product.substance.name}
                                {reaction.byproducts?.length > 0 && (
                                    <span className="reaction-byproducts"> + {reaction.byproducts.map(b => `${b.quantity} ${b.substance.name}`).join(', ')}</span>
                                )}
                            </span>
                            <span className="reaction-cost">{reaction.energyCost} ⚡</span>
                        </button>
                    );
                })}
            </div>
            {checking && !performing && (
                <div className="reaction-status">Analyzing...</div>
            )}
            {performing && (
                <div className="reaction-status">Reacting...</div>
            )}
        </div>
    );
}

export default ReactionPanel;
