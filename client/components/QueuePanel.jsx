import { useState, useEffect } from 'react';
import './QueuePanel.css';

function getProgress(entry, now) {
    const start = new Date(entry.startTime).getTime();
    const end = new Date(entry.expectedCompletion).getTime();
    const total = end - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, ((now - start) / total) * 100));
}

function formatCountdown(expectedCompletion, now) {
    const ms = new Date(expectedCompletion) - now;
    if (ms <= 0) return 'Finalizing...';
    const s = Math.ceil(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}m ${rem < 10 ? '0' : ''}${rem}s`;
}

function QueuePanel({ activeQueue }) {
    const [now, setNow] = useState(Date.now());
    const processingEntry = activeQueue.find(e => e.status === 'processing' || e.status === 'resolving');

    useEffect(() => {
        if (!processingEntry) return;
        const id = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(id);
    }, [!!processingEntry]);

    return (
        <div className="panel-card queue-panel">
            <div className="panel-title">Reactor Queue</div>
            {!processingEntry ? (
                <div className="queue-idle">Reactor idle</div>
            ) : (
                <div className="queue-entry">
                    <div className="queue-entry-name">
                        {processingEntry.reactionName || 'Unknown Synthesis'}
                    </div>
                    <div className="queue-progress-track">
                        <div
                            className="queue-progress-fill"
                            style={{ width: `${getProgress(processingEntry, now)}%` }}
                        />
                    </div>
                    <div className="queue-entry-countdown">
                        {formatCountdown(processingEntry.expectedCompletion, now)}
                    </div>
                </div>
            )}
        </div>
    );
}

export default QueuePanel;
