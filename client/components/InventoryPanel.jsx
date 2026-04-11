function InventoryPanel({ inventory }) {
    return (
        <div>
            <h2>Inventory</h2>
            {inventory.length === 0 ? 
                (<p>Inventory empty</p>
                ) : (
                    inventory.map((item) => (
                        <div key={item.substance._id}>
                            {item.substance.name} ({item.substance.symbol}) : {item.quantity}
                        </div>
                    ))
            )}
        </div>
    );
}

export default InventoryPanel;