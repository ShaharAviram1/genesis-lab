import { useState, useEffect, useRef } from 'react';
import './HeaderPanel.css';

const TIER_NAMES = {
    0:  'Primordial',
    1:  'Atomic',
    2:  'Basic Chemistry',
    3:  'Combustion',
    4:  'Organic',
    5:  'Complex Systems',
    6:  'Materials Science',
    7:  'Advanced Alloys',
    8:  'Nano Engineering',
    9:  'Carbon Nanoscience',
    10: 'Plasma Science',
    11: 'Nuclear Chemistry',
    12: 'Quantum Threshold',
    13: 'Quantum Frontier',
    14: 'Quantum Coherence',
    15: 'Chromodynamics',
    16: 'Bose-Nova Physics',
    17: 'Vacuum Lattice',
    18: 'Axionic Synthesis',
    19: 'Entropic Horizons',
    20: 'Holographic Systems',
    21: 'Planck Density',
    22: 'Quantum Foam',
    23: 'Graviton Synthesis',
    24: 'Spacetime Nexus',
};

function useAnimatedValue(target) {
    const [display, setDisplay] = useState(target);
    const s = useRef({ display: target, target, frame: null });

    useEffect(() => {
        s.current.target = target;
        if (s.current.frame) return;
        const animate = () => {
            const diff = s.current.target - s.current.display;
            if (Math.abs(diff) < 0.5) {
                s.current.display = s.current.target;
                setDisplay(Math.round(s.current.target));
                s.current.frame = null;
                return;
            }
            // fast drop when spending energy, slow rise when accumulating
            const speed = diff < 0 ? 0.32 : 0.10;
            s.current.display += diff * speed;
            setDisplay(Math.round(s.current.display));
            s.current.frame = requestAnimationFrame(animate);
        };
        s.current.frame = requestAnimationFrame(animate);
    }, [target]);

    useEffect(() => {
        return () => { if (s.current.frame) cancelAnimationFrame(s.current.frame); };
    }, []);

    return display;
}

function HeaderPanel({ unlockTier, bigBangs, genesisShards, energy, energyRate, user, onLogout }) {
    const displayEnergy = useAnimatedValue(energy);
    const tierName = TIER_NAMES[unlockTier] ?? `Tier ${unlockTier}`;

    return (
        <header className="header-panel">

            <div className="header-brand">
                <span className="header-brand-main">Genesis</span>
                <span className="header-brand-sub">Lab</span>
            </div>

            {/* Spacer — reserved for U3-B navigation tabs */}
            <div className="header-nav" aria-hidden="true" />

            <div className="header-stats">

                <div className="stat-block stat-block--energy">
                    <span className="stat-block-label">Energy</span>
                    <div className="stat-block-row">
                        <span className="stat-block-value stat-block-value--energy">
                            ⚡ {displayEnergy.toLocaleString()}
                        </span>
                        {energyRate > 0.05 && (
                            <span className="stat-rate">+{energyRate.toFixed(1)}/s</span>
                        )}
                    </div>
                </div>

                <div className="stat-sep" />

                <div className="stat-block stat-block--tier">
                    <span className="stat-block-label">Tier</span>
                    <div className="stat-block-row">
                        <span className="stat-block-value stat-block-value--tier">T{unlockTier}</span>
                        <span className="stat-tier-name">{tierName}</span>
                    </div>
                </div>

                <div className="stat-sep" />

                <div className="stat-block stat-block--shard">
                    <span className="stat-block-label">Shards</span>
                    <span className="stat-block-value stat-block-value--shard">{genesisShards} ◈</span>
                </div>

                {bigBangs > 0 && (
                    <>
                        <div className="stat-sep" />
                        <div className="stat-block stat-block--cycles">
                            <span className="stat-block-label">Cycles</span>
                            <span className="stat-block-value stat-block-value--cycles">× {bigBangs}</span>
                        </div>
                    </>
                )}

            </div>

            <div className="header-account">
                <span className="account-username">{user}</span>
                <button className="account-logout" onClick={onLogout}>Logout</button>
            </div>

        </header>
    );
}

export default HeaderPanel;
