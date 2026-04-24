import { useState } from 'react';
import './BigBangPanel.css';

function BigBangPanel({ bigBang, expectedShards, bigBangInProgress }) {
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
            {confirming && !bigBangInProgress && (
                <div className="bigbang-confirm">
                    <span className="bigbang-confirm-text">This resets your run. Continue?</span>
                    <button className="bigbang-cancel-btn" onClick={handleCancel}>Cancel</button>
                </div>
            )}
            <button
                className={`bigbang-btn ${confirming ? 'confirming' : ''}`}
                onClick={handleClick}
                disabled={bigBangInProgress}
                title={`Estimated genesis shards: ${expectedShards}`}
            >
                <span className="bigbang-icon">✦</span>
                {bigBangInProgress ? 'Singularity Forming...' : confirming ? 'Confirm Reset' : 'Big Bang'}
                {!bigBangInProgress && !confirming && expectedShards > 0 && (
                    <span className="bigbang-shards">+{expectedShards} ◈</span>
                )}
            </button>
        </div>
    );
}

export default BigBangPanel;
