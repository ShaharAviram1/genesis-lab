function AtomPanel({ atoms, createAtom, energy, creatingAtom, isBusy }) {
    return (
        <>
            <h2>Create atoms</h2>
            {atoms.map((atom) => {
                const isDisabled = creatingAtom === atom.name || energy < atom.energyCost || isBusy;

                return (
                    <button key={atom.name} onClick={() => createAtom(atom.name)} disabled={isDisabled}>
                        {creatingAtom === atom.name ? `Creating ${atom.name}` : `${atom.name} (cost ${atom.energyCost}⚡)`}
                    </button>
                );
            })}
        </>
    );
}

export default AtomPanel;