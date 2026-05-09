import './LabNotebookPanel.css';

function LabNotebookPanel({ reactionLog }) {
    return (
        <div className="panel-card lab-notebook-panel">
            <div className="panel-title">Lab Notebook</div>
            {reactionLog.length === 0 ? (
                <p className="notebook-empty">No experiments recorded yet.</p>
            ) : (
                <div className="notebook-list">
                    {reactionLog.map((entry, i) => (
                        <div key={i} className={`notebook-entry notebook-entry--${entry.outcome}`}>
                            <div className="notebook-entry-header">
                                <span className="notebook-outcome">{entry.outcome}</span>
                                <span className="notebook-time">
                                    {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="notebook-message">{entry.message}</div>
                            <div className="notebook-substances">{entry.substances.join(' + ')}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default LabNotebookPanel;
