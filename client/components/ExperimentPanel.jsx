import { useState } from 'react';
import './ExperimentPanel.css';

function ExperimentPanel({ inventory, experiment }) {
    const [selectedSubstances, setSelectedSubstances] = useState([]);

    const toggleSubstance = (substance) => {
        setSelectedSubstances(prev => {
            const isSelected = prev.some(sub => sub._id === substance._id);
            return isSelected
                ? prev.filter(sub => sub._id !== substance._id)
                : [...prev, substance];
        });
    };

    const removePill = (id) => {
        setSelectedSubstances(prev => prev.filter(sub => sub._id !== id));
    };

    const handleExperiment = async () => {
        await experiment(selectedSubstances);
        setSelectedSubstances([]);
    };

    return (
        <div className="panel-card experiment-panel">
            <h2 className="panel-title">Experiment</h2>

            <span className="experiment-section-label">Select Substances</span>
            <div className="experiment-substance-grid">
                {inventory.map(item => {
                    const isSelected = selectedSubstances.some(sub => sub._id === item.substance._id);
                    return (
                        <button
                            key={item.substance._id}
                            className={`experiment-substance-btn${isSelected ? ' selected' : ''}`}
                            onClick={() => toggleSubstance(item.substance)}
                        >
                            <span className="esb-name">{item.substance.name}</span>
                            <span className="esb-qty">×{item.quantity}</span>
                        </button>
                    );
                })}
            </div>

            {selectedSubstances.length > 0 && (
                <div className="experiment-pills">
                    {selectedSubstances.map(substance => (
                        <span key={substance._id} className="experiment-pill">
                            {substance.name}
                            <button className="pill-remove" onClick={() => removePill(substance._id)}>×</button>
                        </span>
                    ))}
                </div>
            )}

            <button
                className="experiment-run-btn"
                disabled={selectedSubstances.length < 1}
                onClick={handleExperiment}
            >
                Attempt Experiment
            </button>
        </div>
    );
}

export default ExperimentPanel;
