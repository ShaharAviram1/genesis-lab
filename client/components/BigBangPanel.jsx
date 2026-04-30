import { useState } from 'react';
import './BigBangPanel.css';

function BigBangPanel({ bigBang, expectedShards, bigBangActive }) {
    const [confirming, setConfirming] = useState(false);

    const handleClick = () => {
        if (!confirming) {
            setConfirming(true);
            return;
        }
        setConfirming(false);
        bigBang();
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setConfirming(false);
    };

    return (
        <div className="bigbang-panel">
            {confirming && !bigBangActive && (
                <div className="bigbang-confirm">
                    <span className="bigbang-confirm-text">This resets your run. Continue?</span>
                    <button className="bigbang-cancel-btn" onClick={handleCancel}>Cancel</button>
                </div>
            )}
            <button
                className={`bigbang-btn ${confirming ? 'confirming' : ''}`}
                onClick={handleClick}
                disabled={bigBangActive}
                title={`Estimated genesis shards: ${expectedShards}`}
            >
                <span className="bigbang-icon">✦</span>
                {bigBangActive ? 'Singularity Forming...' : confirming ? 'Confirm Reset' : 'Big Bang'}
                {!bigBangActive && !confirming && expectedShards > 0 && (
                    <span className="bigbang-shards">+{expectedShards} ◈</span>
                )}
            </button>
        </div>
    );
}

export default BigBangPanel;
