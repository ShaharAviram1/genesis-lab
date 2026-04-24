import './AtomPanel.css';

function AtomPanel({ atoms, createAtom, energy, creatingAtom, isBusy }) {
    return (
        <div className="atom-panel">
            <div className="panel-title">Synthesize</div>
            <div className="atom-grid">
                {atoms.map((atom) => {
                    const isCreating = creatingAtom === atom.name;
                    const isDisabled = isCreating || energy < atom.energyCost || isBusy;
                    const symbol = atom.symbol || atom.name.substring(0, 2).toUpperCase();

                    return (
                        <button
                            key={atom.name}
                            className={`atom-card ${isCreating ? 'creating' : ''}`}
                            onClick={() => createAtom(atom.name)}
                            disabled={isDisabled}
                        >
                            <span className="atom-symbol">{symbol}</span>
                            <span className="atom-name">{isCreating ? '...' : atom.name}</span>
                            <span className="atom-cost">{atom.energyCost} ⚡</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default AtomPanel;
