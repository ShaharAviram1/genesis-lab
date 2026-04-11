function EnergyPanel({ energy, generateEnergy}) {
    return (
        <div>
            <h2>Energy</h2>
            <p>Energy: {energy} <button onClick={() => generateEnergy()}>Generate Energy</button></p>
        </div>
    );
}

export default EnergyPanel;

