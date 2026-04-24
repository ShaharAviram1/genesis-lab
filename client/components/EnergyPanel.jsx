import { useState, useEffect, useRef } from 'react';
import './EnergyPanel.css';

function EnergyPanel({ energy, energyRate }) {
    const [displayEnergy, setDisplayEnergy] = useState(energy);
    const s = useRef({ display: energy, target: energy, frame: null });

    useEffect(() => {
        s.current.target = energy;
        if (s.current.frame) return; // animation already running

        const animate = () => {
            const diff = s.current.target - s.current.display;
            if (Math.abs(diff) < 0.5) {
                s.current.display = s.current.target;
                setDisplayEnergy(Math.round(s.current.target));
                s.current.frame = null;
                return;
            }
            // fast for drops (spending energy), smooth for gains
            const speed = diff < 0 ? 0.32 : 0.10;
            s.current.display += diff * speed;
            setDisplayEnergy(Math.round(s.current.display));
            s.current.frame = requestAnimationFrame(animate);
        };
        s.current.frame = requestAnimationFrame(animate);
    }, [energy]);

    useEffect(() => {
        return () => { if (s.current.frame) cancelAnimationFrame(s.current.frame); };
    }, []);

    return (
        <div className="energy-panel">
            <span className="energy-icon">⚡</span>
            <span className="energy-label">Energy</span>
            <span className="energy-value">{displayEnergy.toLocaleString()}</span>
            {energyRate > 0.05 && (
                <span className="energy-rate">+{energyRate.toFixed(1)}/s</span>
            )}
        </div>
    );
}

export default EnergyPanel;
