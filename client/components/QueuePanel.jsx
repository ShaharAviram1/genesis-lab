import { useState, useEffect } from 'react';
import './QueuePanel.css';

function getProgress(entry, now) {
    const start = new Date(entry.startTime).getTime();
    const end = new Date(entry.expectedCompletion).getTime();
    const total = end - start;
    if (total <= 0) return 100;
    return Math.min(100, Math.max(0, ((now - start) / total) * 100));
}

function formatETA(expectedCompletion) {
    const eta = new Date(expectedCompletion);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrowStart = new Date(todayStart.getTime() + 86400000);
    const dayAfterStart = new Date(todayStart.getTime() + 2 * 86400000);
    const timeStr = eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (eta < tomorrowStart) return `Today ${timeStr}`;
    if (eta < dayAfterStart) return `Tomorrow ${timeStr}`;
    return eta.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + timeStr;
}

function formatCountdown(expectedCompletion, now) {
    const ms = new Date(expectedCompletion) - now;
    if (ms <= 0) return 'Finalizing...';
    const s = Math.ceil(ms / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) {
        const m = Math.floor(s / 60);
        const rem = s % 60;
        return `${m}m ${rem < 10 ? '0' : ''}${rem}s`;
    }
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const rem = s % 60;
    return `${h}h ${m < 10 ? '0' : ''}${m}m ${rem < 10 ? '0' : ''}${rem}s`;
}

// Pure lookup: prefer an active occupant; fall back to any terminal entry
// still present in activeQueue. Hydration trimming (LabSimulation queue_state
// handler) is the single source of truth for what is "still visible".
function findSlotEntry(activeQueue, slotIndex) {
    const matches = activeQueue.filter(e => e.slot === slotIndex);
    return (
        matches.find(e => e.status === 'processing' || e.status === 'resolving')
        ?? matches.find(e => e.status === 'completed' || e.status === 'failed')
        ?? null
    );
}

function getStatusLabel(entry, now) {
    if (!entry) return 'Available';
    if (entry.status === 'resolving') return 'Finalizing';
    if (entry.status === 'queued') return 'Queued';
    if (entry.status === 'processing') {
        const remaining = new Date(entry.expectedCompletion) - now;
        return remaining <= 0 ? 'Finalizing' : 'Processing';
    }
    if (entry.status === 'completed') return 'Completed';
    if (entry.status === 'failed') return 'Failed';
    return entry.status;
}

function QueuePanel({ activeQueue, maxSlots = 1, maxBufferSlots = 0 }) {
    const [now, setNow] = useState(Date.now());

    const anyActive = activeQueue.some(e => e.status === 'processing' || e.status === 'resolving');

    useEffect(() => {
        if (!anyActive) return;
        const id = setInterval(() => setNow(Date.now()), 500);
        return () => clearInterval(id);
    }, [anyActive]);

    const slots = Array.from({ length: maxSlots }, (_, i) => ({
        index: i,
        entry: findSlotEntry(activeQueue, i)
    }));

    const bufferedEntries = activeQueue.filter(e => e.status === 'queued');

    return (
        <div className="panel-card queue-panel">
            <div className="panel-title">Reactor Queue</div>
            <div className="queue-slot-list">
                {slots.map(({ index, entry }) => {
                    const status = getStatusLabel(entry, now);
                    const isActive = entry && (entry.status === 'processing' || entry.status === 'resolving');
                    const displayName = entry
                        ? (entry.revealOnCompletion && entry.status !== 'completed'
                            ? 'Unknown Synthesis'
                            : (entry.reactionName || entry.snapshot?.reactionName || 'Unknown Synthesis'))
                        : null;

                    return (
                        <div
                            key={index}
                            className={`queue-slot queue-slot-${entry ? entry.status : 'empty'}`}
                        >
                            <div className="queue-slot-header">
                                <span className="queue-slot-label">Reactor Slot {index + 1}</span>
                                <span className={`queue-slot-status queue-slot-status-${entry ? entry.status : 'empty'}`}>
                                    {status}
                                </span>
                            </div>
                            {!entry ? (
                                <div className="queue-slot-empty">— idle —</div>
                            ) : (
                                <div className="queue-slot-body">
                                    <div className="queue-entry-name">{displayName}</div>
                                    {isActive && (
                                        <>
                                            <div className="queue-progress-track">
                                                <div
                                                    className="queue-progress-fill"
                                                    style={{ width: `${getProgress(entry, now)}%` }}
                                                />
                                            </div>
                                            <div className="queue-entry-countdown">
                                                {formatCountdown(entry.expectedCompletion, now)}
                                            </div>
                                            <div className="queue-entry-eta">
                                                ETA {formatETA(entry.expectedCompletion)}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            {(maxBufferSlots > 0 || bufferedEntries.length > 0) && (
                <div className="queue-buffer-section">
                    <div className="queue-buffer-label">
                        Buffered ({bufferedEntries.length}/{maxBufferSlots})
                    </div>
                    {bufferedEntries.length === 0 && (
                        <div className="queue-slot-empty">— buffer empty —</div>
                    )}
                    {bufferedEntries.map((entry, i) => {
                        const displayName = entry.revealOnCompletion
                            ? 'Unknown Synthesis'
                            : (entry.reactionName || entry.snapshot?.reactionName || 'Unknown Synthesis');
                        return (
                            <div key={entry.queueEntryId || i} className="queue-slot queue-slot-queued">
                                <div className="queue-slot-header">
                                    <span className="queue-slot-label">#{i + 1}</span>
                                    <span className="queue-slot-status queue-slot-status-queued">Queued</span>
                                </div>
                                <div className="queue-slot-body">
                                    <div className="queue-entry-name">{displayName}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default QueuePanel;
