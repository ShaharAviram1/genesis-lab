import './SelectedReactionPanel.css';

function SelectedReactionPanel({ selectedReaction, inventory, performReaction, isBusy, result, onClose }) {
    if (!selectedReaction) return null;

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
            {selectedReaction.byproducts?.length > 0 && (
                <div className="byproducts-row">
                    <span className="byproducts-label">Also produces:</span>
                    <span className="byproducts-list">{selectedReaction.byproducts.map(b => `${b.quantity} ${b.substance.name}`).join(', ')}</span>
                </div>
            )}
            <div className={`perform-status ${result ? 'can-perform' : 'cannot-perform'}`}>
                {result ? '✓ Ready to React' : '✗ Missing Materials'}
            </div>
            {result && (
                <button className="perform-btn" disabled={isBusy} onClick={() => performReaction(selectedReaction.reactionID)}>
                    ⚗ Perform Reaction
                </button>
            )}
        </div>
    );
}

export default SelectedReactionPanel;
