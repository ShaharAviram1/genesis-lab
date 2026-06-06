import { useState } from 'react';
import './ExperimentPanel.css';

function ExperimentPanel({ inventory }) {
    const [genFilter, setGenFilter] = useState(null);
    const [hoveredSubstance, setHoveredSubstance] = useState(null);

    const generations = [...new Set(inventory.map(i => i.substance.generationTier))].sort((a, b) => a - b);
    const filteredInventory = genFilter === null
        ? inventory
        : inventory.filter(i => i.substance.generationTier === genFilter);

    return (
        <div className="panel-card experiment-panel">
            <h2 className="panel-title">Substances</h2>

            {generations.length > 1 && (
                <div className="experiment-gen-filters">
                    <button
                        className={`gen-filter-btn${genFilter === null ? ' active' : ''}`}
                        onClick={() => setGenFilter(null)}
                    >All</button>
                    {generations.map(gen => (
                        <button
                            key={gen}
                            className={`gen-filter-btn${genFilter === gen ? ' active' : ''}`}
                            onClick={() => setGenFilter(gen)}
                        >Gen {gen}</button>
                    ))}
                </div>
            )}

            <span className="experiment-section-label">Inventory</span>
            <div className="experiment-substance-scroll">
                <div className="experiment-substance-grid">
                    {filteredInventory.map(item => (
                        <button
                            key={item.substance._id}
                            className="experiment-substance-btn"
                            onMouseEnter={() => setHoveredSubstance(item.substance)}
                            onMouseLeave={() => setHoveredSubstance(null)}
                        >
                            <span className="esb-name">{item.substance.name}</span>
                            <span className="esb-qty">×{item.quantity}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="experiment-hint-area">
                {hoveredSubstance ? (
                    <>
                        <span className="eha-name">{hoveredSubstance.name}</span>
                        {hoveredSubstance.hintText
                            ? <span className="eha-text">{hoveredSubstance.hintText}</span>
                            : <span className="eha-text eha-text--none">No analysis available.</span>
                        }
                    </>
                ) : (
                    <span className="eha-placeholder">Hover a substance to inspect it.</span>
                )}
            </div>
        </div>
    );
}

export default ExperimentPanel;
