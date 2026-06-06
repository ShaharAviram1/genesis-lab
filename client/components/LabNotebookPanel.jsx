import './LabNotebookPanel.css';

function formatNotebookTime(createdAt) {
    const d = new Date(createdAt);
    const now = new Date();
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return timeStr;
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + timeStr;
}

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
                                <span className="notebook-outcome">{entry.outcome === 'discovery' ? '✦ ' : ''}{entry.outcome}</span>
                                <span className="notebook-time">
                                    {formatNotebookTime(entry.createdAt)}
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
