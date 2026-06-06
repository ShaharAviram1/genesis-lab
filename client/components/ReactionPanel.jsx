import { useState } from 'react';
import './ReactionPanel.css';

function nearCompleteAction(missingHints) {
    const hasSubstance = (missingHints || []).some(h => h.type === 'substance');
    const hasCondition = (missingHints || []).some(h => h.type === 'condition');
    if (hasSubstance && hasCondition) return 'Complete the remaining inputs to understand this pathway.';
    if (hasSubstance) return 'Synthesize one more substance to complete the model.';
    return 'Unlock the required reactor condition to complete the model.';
}

function AnomalyCard({ reaction }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            className={`reaction-card reaction-card--anomaly${hovered ? ' hovered' : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="discovery-header">
                <span className="discovery-gen-tag">Gen {reaction.generationTier}</span>
                <span className="discovery-state-label">Anomaly Detected</span>
            </div>
            {reaction.totalInputCount > 0 && (
                <div className="discovery-input-count">{reaction.totalInputCount}-input pathway</div>
            )}
            {hovered && (
                <div className="discovery-detail">
                    <div className="discovery-detail-row">
                        0 of {reaction.totalInputCount} inputs identified — pathway entirely unmapped.
                    </div>
                    <div className="discovery-detail-action">
                        → Synthesize Gen {reaction.generationTier} substances to begin mapping this pathway.
                    </div>
                </div>
            )}
        </div>
    );
}

function PartialCard({ reaction }) {
    const [hovered, setHovered] = useState(false);
    const knownCount = reaction.revealedInputs?.length ?? 0;
    const unknownCount = (reaction.totalInputCount ?? 0) - knownCount;
    const knownNames = (reaction.revealedInputs || []).map(i => i.name).join(' · ');
    return (
        <div
            className={`reaction-card reaction-card--partial${hovered ? ' hovered' : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="discovery-header">
                <span className="discovery-gen-tag">Gen {reaction.generationTier}</span>
                <span className="discovery-state-label">Partial Pathway</span>
            </div>
            <div className="discovery-slots">
                {(reaction.revealedInputs || []).map(input => (
                    <span key={input.substanceKey} className="discovery-slot discovery-slot--known">
                        {input.name}
                    </span>
                ))}
                {Array.from({ length: unknownCount }).map((_, i) => (
                    <span key={`unknown-${i}`} className="discovery-slot discovery-slot--unknown">???</span>
                ))}
            </div>
            {hovered && (
                <div className="discovery-detail">
                    {knownNames && (
                        <div className="discovery-detail-row">Known: {knownNames}</div>
                    )}
                    <div className="discovery-detail-action">
                        → {knownCount} of {reaction.totalInputCount} inputs identified — synthesize more Gen {reaction.generationTier} materials to reveal the remaining {unknownCount} input{unknownCount !== 1 ? 's' : ''}.
                    </div>
                </div>
            )}
        </div>
    );
}

function NearCompleteCard({ reaction }) {
    const [hovered, setHovered] = useState(false);
    const action = nearCompleteAction(reaction.missingHints);
    const missingHint = (reaction.missingHints || [])[0];
    const missingLabel = missingHint?.type === 'condition'
        ? 'reactor condition'
        : missingHint?.hint ?? 'one more input';
    return (
        <div
            className={`reaction-card reaction-card--near-complete${hovered ? ' hovered' : ''}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="discovery-header">
                <span className="discovery-gen-tag">Gen {reaction.generationTier}</span>
                <span className="discovery-state-label">Near Complete</span>
            </div>
            <div className="discovery-slots">
                {(reaction.revealedInputs || []).map(input => (
                    <span key={input.substanceKey} className="discovery-slot discovery-slot--known">
                        {input.name}
                    </span>
                ))}
                {(reaction.missingHints || []).map((hint, i) => (
                    <span
                        key={`hint-${i}`}
                        className={`discovery-slot discovery-slot--hinted discovery-slot--hinted-${hint.type}`}
                    >
                        {hint.hint} ●
                    </span>
                ))}
            </div>
            {hovered && (
                <div className="discovery-detail">
                    <div className="discovery-detail-row">
                        One signal remaining — missing: {missingLabel}.
                    </div>
                    <div className="discovery-detail-action">→ {action}</div>
                </div>
            )}
        </div>
    );
}

function ReactionPanel({ reactions, checkReaction, selectedReaction, energy, isBusy, checking, performing, newlyRevealedTier, justDiscoveredReactionKey }) {
    return (
        <div className="panel-card reaction-panel">
            <div className="panel-title">Reactions</div>
            <div className="reaction-list">
                {reactions.map((reaction) => {
                    const { discoveryState } = reaction;

                    if (discoveryState === 'anomaly') {
                        return <AnomalyCard key={reaction.reactionKey} reaction={reaction} />;
                    }
                    if (discoveryState === 'partial') {
                        return <PartialCard key={reaction.reactionKey} reaction={reaction} />;
                    }
                    if (discoveryState === 'near_complete') {
                        return <NearCompleteCard key={reaction.reactionKey} reaction={reaction} />;
                    }

                    // Known reactions (discoveredByDefault or understood)
                    const isSelected = selectedReaction?.reactionKey === reaction.reactionKey;
                    const isDisabled = isBusy || energy < reaction.energyCost;
                    const isRevealed = reaction.reactionKey === justDiscoveredReactionKey;
                    const isNew = reaction.isNewlyUnderstood === true;
                    return (
                        <button
                            key={reaction.reactionKey}
                            className={`reaction-card${isSelected ? ' selected' : ''}${isRevealed ? ' reaction-card--revealed' : ''}${isNew ? ' reaction-card--new' : ''}`}
                            disabled={isDisabled}
                            onClick={() => checkReaction(reaction.reactionKey)}
                        >
                            <span className="reaction-formula">
                                {reaction.reactants.map(r => `${r.quantity} ${r.substance.name}`).join(' + ')}
                                <span className="reaction-arrow"> → </span>
                                {reaction.product.quantity} {reaction.product.substance.name}
                            </span>
                            {isNew && <span className="reaction-badge-new">NEW</span>}
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
