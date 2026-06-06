import './ObjectiveStrip.css';

function ObjectiveStrip({ getCurrentGoal, unlockTier }) {
    const goal = getCurrentGoal();

    return (
        <div className="objective-strip">
            <span className="objective-strip-label">Objective</span>
            <span className="objective-strip-text">{goal}</span>
        </div>
    );
}

export default ObjectiveStrip;
