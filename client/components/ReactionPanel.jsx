import './ReactionPanel.css';

function ReactionPanel({ reactions, checkReaction, selectedReaction, energy, isBusy, checking, performing, newlyRevealedTier, justDiscoveredReactionKey }) {
    return (
        <div className="panel-card reaction-panel">
            <div className="panel-title">Reactions</div>
            <div className="reaction-list">
                {reactions.map((reaction) => {
                    const isSelected = selectedReaction?.reactionKey === reaction.reactionKey;

                    if (reaction.unknown) {
                        const isNewlyDetected = reaction.unlockTier === newlyRevealedTier;
                        const inputLabel = reaction.reactantCount ? `${reaction.reactantCount}-input` : null;
                        return (
                            <button
                                key={reaction.reactionKey}
                                className={`reaction-card reaction-card--unknown ${isSelected ? 'selected' : ''}`}
                                onClick={() => checkReaction(reaction.reactionKey)}
                            >
                                <div className="reaction-unknown-header">
                                    <span className="reaction-unknown-name">Unknown Synthesis</span>
                                    {isNewlyDetected && <span className="reaction-badge-new">DETECTED</span>}
                                </div>
                                <div className="reaction-unknown-footer">
                                    {reaction.hint && <span className="reaction-unknown-hint">{reaction.hint}</span>}
                                    {inputLabel && <span className="reaction-unknown-count">{inputLabel}</span>}
                                </div>
                            </button>
                        );
                    }

                    const isDisabled = isBusy || energy < reaction.energyCost;
                    const isRevealed = reaction.reactionKey === justDiscoveredReactionKey;
                    return (
                        <button
                            key={reaction.reactionKey}
                            className={`reaction-card ${isSelected ? 'selected' : ''} ${isRevealed ? 'reaction-card--revealed' : ''}`}
                            disabled={isDisabled}
                            onClick={() => checkReaction(reaction.reactionKey)}
                        >
                            <span className="reaction-formula">
                                {reaction.reactants.map(r => `${r.quantity} ${r.substance.name}`).join(' + ')}
                                <span className="reaction-arrow"> → </span>
                                {reaction.product.quantity} {reaction.product.substance.name}
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
