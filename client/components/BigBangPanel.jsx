function BigBangPanel({ bigBang, expectedShards, bigBangInProgress }) { 
    return (
        <>
            <button onClick={bigBang} title={`Estimated genesis shards: ${expectedShards}`} disabled={bigBangInProgress}>
                {bigBangInProgress ? "Big Bang in progress..." : "Perform Big Bang"}
            </button>
        </>
    );
}

export default BigBangPanel;