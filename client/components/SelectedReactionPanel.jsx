import './SelectedReactionPanel.css';

function SelectedReactionPanel({ selectedReaction, inventory, performReaction, isBusy, result, onClose }) {
    if (!selectedReaction) return null;

    if (selectedReaction.unknown) {
        const inputLabel = selectedReaction.reactantCount ? `${selectedReaction.reactantCount}-input synthesis` : "Unknown input count";
        return (
            <div className="panel-card selected-reaction-panel">
                <div className="panel-title selected-reaction-header">
                    <span>Unknown Synthesis</span>
                    <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
                </div>
                <div className="resonance-body">
                    <div className="resonance-input-count">{inputLabel}</div>
                    {selectedReaction.hint && <div className="resonance-hint">{selectedReaction.hint}</div>}
                    <div className="resonance-cta">Combine substances in the Experiment Panel to discover this reaction.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="panel-card selected-reaction-panel">
            <div className="panel-title selected-reaction-header">
                <span>Selected Reaction</span>
                <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
            </div>
            <div className="requirements-list">
                {selectedReaction.reactants.map((reactant) => {
                    const userItem = inventory.find(item => item.substance._id === reactant.substance._id);
                    const userQuantity = userItem ? userItem.quantity : 0;
                    const hasEnough = userQuantity >= reactant.quantity;
                    return (
                        <div key={reactant.substance._id} className={`requirement-row ${hasEnough ? 'met' : 'unmet'}`}>
                            <span className="req-name">{reactant.substance.name}</span>
                            <span className="req-qty">{userQuantity}/{reactant.quantity}</span>
                            <span className="req-status">{hasEnough ? '✓' : '✗'}</span>
                        </div>
                    );
                })}
            </div>
            <div className={`perform-status ${result ? 'can-perform' : 'cannot-perform'}`}>
                {result ? '✓ Ready to React' : '✗ Missing Materials'}
            </div>
            {result && (
                <button className="perform-btn" disabled={isBusy} onClick={() => performReaction(selectedReaction.reactionKey)}>
                    ⚗ Perform Reaction
                </button>
            )}
        </div>
    );
}

export default SelectedReactionPanel;
