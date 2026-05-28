const ATMOSPHERIC_HINTS = {
    1: "Reactor detected synthesis potential in current element space.",
    2: "Complex resonance signature — compound-class synthesis possible.",
    3: "High-complexity structure signature detected at current tier."
};

export function getAtmosphericHint(generationTier) {
    return ATMOSPHERIC_HINTS[generationTier] ?? "Reactor detected synthesis potential.";
}
