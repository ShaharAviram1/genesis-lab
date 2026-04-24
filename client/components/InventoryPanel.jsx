import './InventoryPanel.css';

function InventoryPanel({ inventory }) {
    const atoms = inventory.filter(item => item.substance.type === 'atom');
    const compounds = inventory.filter(item => item.substance.type !== 'atom');

    const renderItem = (item) => (
        <div key={item.substance._id} className={`inventory-item inventory-item--${item.substance.type}`}>
            <span className="substance-symbol">{item.substance.symbol}</span>
            <span className="substance-name">{item.substance.name}</span>
            <span className="substance-qty">×{item.quantity}</span>
        </div>
    );

    return (
        <div className="panel-card inventory-panel">
            <div className="panel-title">Inventory</div>
            {inventory.length === 0 ? (
                <p className="inventory-empty">No substances yet</p>
            ) : (
                <div className="inventory-list">
                    {atoms.length > 0 && (
                        <>
                            <span className="inventory-group-label">Atoms</span>
                            {atoms.map(renderItem)}
                        </>
                    )}
                    {compounds.length > 0 && (
                        <>
                            <span className="inventory-group-label">Compounds</span>
                            {compounds.map(renderItem)}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

export default InventoryPanel;
