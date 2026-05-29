import './SelectedReactionPanel.css';

function prettifyKey(key) {
    return key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function SelectedReactionPanel({ selectedReaction, inventory, performReaction, isBusy, result, onClose, reactorOccupied, reactorCapabilities = [] }) {
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

    const conditions = selectedReaction.conditions || [];
    const missingCapabilities = conditions.filter(key => !reactorCapabilities.includes(key));
    const lacksCapabilities = missingCapabilities.length > 0;

    const isTimed = selectedReaction.reactionTime > 0;
    const statusText = reactorOccupied
        ? '⚙ Reactor Occupied'
        : lacksCapabilities
        ? '⚠ Reactor Lacks Capability'
        : result ? '✓ Ready to React' : '✗ Missing Materials';
    const statusClass = reactorOccupied
        ? 'reactor-busy'
        : lacksCapabilities
        ? 'lacks-capability'
        : result ? 'can-perform' : 'cannot-perform';

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
            {conditions.length > 0 && (
                <div className="reactor-requirements">
                    <div className="reactor-req-label">Reactor Requirements</div>
                    {conditions.map(key => {
                        const met = reactorCapabilities.includes(key);
                        return (
                            <div key={key} className={`requirement-row ${met ? 'met' : 'unmet'}`}>
                                <span className="req-name">{prettifyKey(key)}</span>
                                <span className="req-status">{met ? '✓' : '✗'}</span>
                            </div>
                        );
                    })}
                </div>
            )}
            <div className={`perform-status ${statusClass}`}>
                {statusText}
            </div>
            {lacksCapabilities ? (
                <button className="perform-btn lacks-cap-btn" disabled>
                    Reactor lacks: {missingCapabilities.map(prettifyKey).join(', ')}
                </button>
            ) : result && (
                <button
                    className="perform-btn"
                    disabled={isBusy || reactorOccupied}
                    onClick={() => performReaction(selectedReaction.reactionKey)}
                >
                    {isTimed ? '⏱ Queue Synthesis' : '⚗ Perform Reaction'}
                </button>
            )}
        </div>
    );
}

export default SelectedReactionPanel;
