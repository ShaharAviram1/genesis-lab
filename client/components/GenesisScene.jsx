import { useEffect, useRef, useMemo, Component, Suspense } from "react";
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, useGLTF, Environment } from '@react-three/drei'
import { ACESFilmicToneMapping, Color, Vector3, Quaternion, AdditiveBlending } from 'three'

const COLOR_ORANGE = new Color('#ff5500');
const COLOR_VIOLET = new Color('#9933ff');
const COLOR_WHITE  = new Color('#ffffff');
const _tmpColor    = new Color();
const _tmpVec3     = new Vector3();
const _tmpQuat     = new Quaternion();
const _MOTE_UP     = new Vector3(0, 1, 0);

const ARC_SEGMENTS = 9;
const PARTICLE_COUNT = 64;
const BURST_COUNT  = 200;
const EMBER_COUNT  = 50;


const TRAIL_LENGTH = 18;
const MOTE_SELF_ROT = [
    { drx:  0.011, dry:  0.007, drz:  0.005 },
    { drx: -0.008, dry:  0.013, drz: -0.009 },
    { drx:  0.006, dry: -0.011, drz:  0.014 },
    { drx: -0.014, dry:  0.005, drz:  0.008 },
    { drx:  0.009, dry: -0.006, drz: -0.012 },
];

const RING_SEGMENTS = 24;
const RING_GAP = 0.18;
function computeRingSegments(radius, tube) {
    const arcLen = (2 * Math.PI * radius / RING_SEGMENTS) * (1 - RING_GAP);
    const segH = tube * 3.4;
    const segD = tube * 2.8;
    return Array.from({ length: RING_SEGMENTS }, (_, i) => {
        const angle = (i / RING_SEGMENTS) * Math.PI * 2;
        return { angle, x: Math.cos(angle) * radius, z: Math.sin(angle) * radius, arcLen, segH, segD };
    });
}

// Orbital uses local space (always spins around the ring's own center).
// Tilt and roll use world space so they're independent of orbital speed.
const RING_ORBITAL    = new Vector3(0, 1, 0);
const RING_WORLD_TILT = new Vector3(1, 0, 0);
const RING_WORLD_ROLL = new Vector3(0, 0, 1);

const WARP_COUNT = 90;
const WARP_DATA = Array.from({ length: WARP_COUNT }, () => {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    return {
        dx: Math.sin(phi) * Math.cos(theta),
        dy: Math.sin(phi) * Math.sin(theta),
        dz: Math.cos(phi),
        outerR: 8  + Math.random() * 6,
        innerR: 4  + Math.random() * 2,
    };
});
import { EffectComposer, Bloom } from '@react-three/postprocessing'

useGLTF.preload('/reactor-core.glb')
useGLTF.preload('/moonstone_opt.glb')

class CanvasErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { crashed: false };
    }
    static getDerivedStateFromError() {
        return { crashed: true };
    }
    componentDidCatch(error) {
        console.warn('[GenesisScene] Canvas error caught by boundary:', error.message);
    }
    render() {
        if (this.state.crashed) {
            return (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--teal)', fontFamily: 'var(--font-display)', fontSize: '0.85rem', opacity: 0.5 }}>
                    3D viewport unavailable
                </div>
            );
        }
        return this.props.children;
    }
}

const MOTE_CONFIGS = [
    {
        angle: 0,
        baseRadius: 2.45,
        currentRadius: 2.45,
        speed: 0.037,
        verticalOffset: -0.12,
        opacity: 0,
        scale: 0.9,
    },
    {
        angle: (Math.PI * 2) / 5,
        baseRadius: 2.58,
        currentRadius: 2.58,
        speed: 0.045,
        verticalOffset: 0.08,
        opacity: 0,
        scale: 1.05,
    },
    {
        angle: (Math.PI * 4) / 5,
        baseRadius: 2.72,
        currentRadius: 2.72,
        speed: 0.04,
        verticalOffset: -0.04,
        opacity: 0,
        scale: 0.95,
    },
    {
        angle: (Math.PI * 6) / 5,
        baseRadius: 2.52,
        currentRadius: 2.52,
        speed: 0.05,
        verticalOffset: 0.13,
        opacity: 0,
        scale: 1.1,
    },
    {
        angle: (Math.PI * 8) / 5,
        baseRadius: 2.66,
        currentRadius: 2.66,
        speed: 0.042,
        verticalOffset: -0.09,
        opacity: 0,
        scale: 0.98,
    },
];

function SceneContent({ onCoreClick, activityLevel, creationEvent, reactionEvent, bigBangPhase }) {
    const { scene: coreScene }      = useGLTF('/reactor-core.glb');
    const { scene: moonstoneScene } = useGLTF('/moonstone_opt.glb');

    // Memoized — only traverses once when the GLTF scene object changes
    const { coreGeometry, coreTexMaps } = useMemo(() => {
        let coreGeometry = null;
        let coreTexMaps = { map: null, normalMap: null, roughnessMap: null, metalnessMap: null };
        coreScene.traverse((child) => {
            if (child.isMesh && !coreGeometry) {
                coreGeometry = child.geometry;
                const m = child.material;
                coreTexMaps = {
                    map:          m.map,
                    normalMap:    m.normalMap,
                    roughnessMap: m.roughnessMap,
                    metalnessMap: m.metalnessMap,
                };
            }
        });
        return { coreGeometry, coreTexMaps };
    }, [coreScene]);

    const { moonstoneGeometry, moonstoneMaterials } = useMemo(() => {
        let geo = null;
        let baseMat = null;
        moonstoneScene.traverse((child) => {
            if (child.isMesh && !geo) {
                geo = child.geometry;
                baseMat = child.material;
            }
        });
        // Scale geometry from model-space units (~0.009 wide) to scene units (~0.14 radius)
        const scaledGeo = geo.clone();
        scaledGeo.scale(0.12, 0.12, 0.12);
        const mats = MOTE_CONFIGS.map(() => {
            const m = baseMat.clone();
            m.transparent = true;
            m.depthWrite = false;
            m.opacity = 0.22;
            return m;
        });
        return { moonstoneGeometry: scaledGeo, moonstoneMaterials: mats };
    }, [moonstoneScene]);

    const ring1Segs = useMemo(() => computeRingSegments(1.5, 0.07), []);
    const ring2Segs = useMemo(() => computeRingSegments(2.1, 0.07), []);
    const ring3Segs = useMemo(() => computeRingSegments(2.4, 0.06), []);
    const coreRef = useRef();
    const materialRef = useRef();
    const ringRef = useRef();
    const ring2Ref = useRef();
    const ring3Ref = useRef();
    const impulseRef = useRef(0);
    const glowKickRef = useRef(0);
    const pointLightRef = useRef();
    const reactionLightRef = useRef();
    const drawLightRef = useRef();
    const assemblyRef = useRef();
    const kickRef = useRef(0);
    const lastCreationEventRef = useRef(null);
    const creationPulseRef = useRef(0);
    const creationChannelRef = useRef(0);
    const creationPulseFiredRef = useRef(false);
    const creationChannelVisualRef = useRef(0);
    const creationPulseVisualRef = useRef(0);
    const lastReactionEventRef = useRef(null);
    const reactionBurstRef = useRef(0);
    const reactionBurstVisualRef = useRef(0);
    const reactionStrengthRef = useRef(0);
    const ringBoostRef = useRef(0);
    const ringWobbleRef = useRef({ t1:0, r1:0, t2:0, r2:0, t3:0, r3:0 });
    const coreWobbleRef = useRef({ t: 0, r: 0 });
    const reactionPhaseRef = useRef({ phase: null, progress: 0 });
    const shockwaveRef = useRef();
    const shockwaveMaterialRef = useRef();
    const shockwaveStateRef = useRef({ active: false, progress: 0, strength: 1 });
    const motesRef = useRef();
    const motesDataRef = useRef(MOTE_CONFIGS.map((mote) => ({ ...mote })));
    const arcGeosRef = useRef(MOTE_CONFIGS.map(() => null));
    const arcMatsRef = useRef(MOTE_CONFIGS.map(() => null));
    const arcArraysRef = useRef(MOTE_CONFIGS.map(() => new Float32Array(ARC_SEGMENTS * 3)));
    const trailGeosRef = useRef(MOTE_CONFIGS.map(() => null));
    const trailMatsRef = useRef(MOTE_CONFIGS.map(() => null));
    const trailArraysRef = useRef(MOTE_CONFIGS.map((mote) => {
        const arr = new Float32Array(TRAIL_LENGTH * 3);
        const x = Math.cos(mote.angle) * mote.baseRadius;
        const z = Math.sin(mote.angle) * mote.baseRadius;
        for (let t = 0; t < TRAIL_LENGTH; t++) {
            arr[t * 3]     = x;
            arr[t * 3 + 1] = mote.verticalOffset;
            arr[t * 3 + 2] = z;
        }
        return arr;
    }));
    const moteRotRef = useRef(MOTE_SELF_ROT.map(r => ({ ...r, rx: 0, ry: 0, rz: 0 })));

    // Materialization dust particles
    const particleGeoRef    = useRef();
    const particleMatRef    = useRef();
    const particleArrayRef  = useRef(new Float32Array(PARTICLE_COUNT * 3));
    const particleActiveRef = useRef(false);
    const particleDataRef   = useRef(
        Array.from({ length: PARTICLE_COUNT }, () => ({ dx: 0, dy: 0, dz: 0, currentR: 3 }))
    );

    // Reaction burst particles (fast sparks)
    const burstGeoRef    = useRef();
    const burstMatRef    = useRef();
    const burstArrayRef  = useRef(new Float32Array(BURST_COUNT * 3));
    const burstActiveRef = useRef(false);
    const burstDataRef   = useRef(
        Array.from({ length: BURST_COUNT }, () => ({ vx:0, vy:0, vz:0, x:0, y:0, z:0, life:0, maxLife:1 }))
    );

    // Reaction burst embers (slow, large glowing chunks)
    const emberGeoRef    = useRef();
    const emberMatRef    = useRef();
    const emberArrayRef  = useRef(new Float32Array(EMBER_COUNT * 3));
    const emberDataRef   = useRef(
        Array.from({ length: EMBER_COUNT }, () => ({ vx:0, vy:0, vz:0, x:0, y:0, z:0, life:0, maxLife:1 }))
    );

    // BigBang animation
    const bigBangAnimRef = useRef({ collapseProgress: 0, expansionProgress: 0, rebirthProgress: 0 });
    const bigBangSWStatesRef = useRef([
        { active: false, progress: 0, delay: 0.0 },
        { active: false, progress: 0, delay: 0.28 },
        { active: false, progress: 0, delay: 0.55 },
    ]);
    const bigBangSWMeshesRef = useRef([null, null, null]);
    const bigBangSWMatsRef   = useRef([null, null, null]);
    const suctionRingRef     = useRef();
    const suctionRingMatRef  = useRef();
    const warpGeoRef         = useRef();
    const warpMatRef         = useRef();
    const warpArrayRef       = useRef(new Float32Array(WARP_COUNT * 2 * 3));

    useEffect(() => {
        if (creationEvent && (!lastCreationEventRef.current || creationEvent.timestamp !== lastCreationEventRef.current.timestamp)) {
            creationChannelRef.current = 2.0;
            creationPulseRef.current = 0;
            creationPulseFiredRef.current = false;
            lastCreationEventRef.current = creationEvent;
            // Spawn materialization dust
            particleActiveRef.current = true;
            particleDataRef.current.forEach(p => {
                const theta = Math.random() * Math.PI * 2;
                const phi   = Math.acos(2 * Math.random() - 1);
                p.dx = Math.sin(phi) * Math.cos(theta);
                p.dy = Math.sin(phi) * Math.sin(theta);
                p.dz = Math.cos(phi);
                p.currentR = 2.2 + Math.random() * 1.8; // spread 2.2–4.0
            });
        }
    }, [creationEvent]);

    useEffect(() => {
        if (reactionEvent && (!lastReactionEventRef.current || reactionEvent.timestamp !== lastReactionEventRef.current.timestamp)) {
            const strength = Math.min(Math.max((reactionEvent.tier ?? 1) / 5, 0.5), 1.0);
            reactionStrengthRef.current = strength;
            reactionPhaseRef.current = { phase: 'draw', progress: 0 };
            lastReactionEventRef.current = reactionEvent;
        }
    }, [reactionEvent]);

    useEffect(() => {
        const a = bigBangAnimRef.current;
        const resetShockwaves = () => {
            bigBangSWStatesRef.current.forEach(sw => { sw.active = false; sw.progress = 0; });
            bigBangSWMeshesRef.current.forEach(m => { if (m) m.scale.setScalar(0); });
            bigBangSWMatsRef.current.forEach(m => { if (m) m.opacity = 0; });
        };

        if (bigBangPhase === 'collapse')  { a.collapseProgress = 0; }
        if (bigBangPhase === 'expansion') {
            a.expansionProgress = 0;
            bigBangSWStatesRef.current.forEach(sw => { sw.active = true; sw.progress = 0; });
            bigBangSWMeshesRef.current.forEach(m => { if (m) m.scale.setScalar(0); });
            bigBangSWMatsRef.current.forEach(m => { if (m) m.opacity = 0; });
        }
        if (bigBangPhase === 'rebirth')   { a.rebirthProgress = 0; resetShockwaves(); }
        if (!bigBangPhase)                { resetShockwaves(); }
    }, [bigBangPhase]);

    useFrame((state, delta) => {
        const normalizedActivity = Math.min(Math.max(activityLevel / 100, 0), 1);
        const visualActivity = Math.pow(normalizedActivity, 0.9);
        const speedActivity = Math.pow(normalizedActivity, 0.65);
        const impulse = impulseRef.current;
        const kick = kickRef.current;
        const glowKick = glowKickRef.current;
        const time = state.clock.elapsedTime;
        const basePulse = Math.sin(time * 1.8) * 0.03;
        const activityPulse = visualActivity * 0.05;
        // Ring breathing — each ring has its own slow oscillation
        const breath1 = 1 + Math.sin(time * 0.7) * 0.018 * (0.4 + visualActivity * 0.6);
        const breath2 = 1 + Math.sin(time * 0.5 + 1.2) * 0.022 * (0.4 + visualActivity * 0.6);
        const breath3 = 1 + Math.sin(time * 0.9 + 2.4) * 0.016 * (0.4 + visualActivity * 0.6);

        // Reaction phase state machine
        const rp = reactionPhaseRef.current;
        if (rp.phase === 'draw') {
            rp.progress += delta / 0.9;
            if (rp.progress >= 1) {
                rp.phase = 'burst';
                reactionBurstRef.current = 1.0;
                shockwaveStateRef.current = { active: true, progress: 0, strength: reactionStrengthRef.current };
                // Spawn burst sparks
                burstActiveRef.current = true;
                const str = reactionStrengthRef.current;
                burstDataRef.current.forEach(p => {
                    const theta = Math.random() * Math.PI * 2;
                    const phi   = Math.acos(2 * Math.random() - 1);
                    const nx = Math.sin(phi) * Math.cos(theta);
                    const ny = Math.sin(phi) * Math.sin(theta);
                    const nz = Math.cos(phi);
                    const speed = (6 + Math.random() * 8) * str;
                    p.vx = nx * speed; p.vy = ny * speed; p.vz = nz * speed;
                    p.x  = nx * 1.1;  p.y  = ny * 1.1;  p.z  = nz * 1.1;
                    p.life    = 0;
                    p.maxLife = 0.8 + Math.random() * 1.0;
                });
                // Spawn embers — slower, linger longer
                emberDataRef.current.forEach(p => {
                    const theta = Math.random() * Math.PI * 2;
                    const phi   = Math.acos(2 * Math.random() - 1);
                    const nx = Math.sin(phi) * Math.cos(theta);
                    const ny = Math.sin(phi) * Math.sin(theta);
                    const nz = Math.cos(phi);
                    const speed = (1.5 + Math.random() * 2.5) * str;
                    p.vx = nx * speed; p.vy = ny * speed; p.vz = nz * speed;
                    p.x  = nx * 1.1;  p.y  = ny * 1.1;  p.z  = nz * 1.1;
                    p.life    = 0;
                    p.maxLife = 1.2 + Math.random() * 1.2;
                });
            }
        } else if (rp.phase === 'burst' && reactionBurstRef.current < 0.01) {
            rp.phase = null;
        }
        const drawIntensity = rp.phase === 'draw' ? rp.progress : 0;

        creationChannelVisualRef.current += (creationChannelRef.current - creationChannelVisualRef.current) * 0.10;
        creationPulseVisualRef.current += (creationPulseRef.current - creationPulseVisualRef.current) * 0.18;
        reactionBurstVisualRef.current += (reactionBurstRef.current - reactionBurstVisualRef.current) * 0.14;

        const creationChannel = Math.pow(creationChannelVisualRef.current, 1.05);
        const creationPulse = Math.pow(creationPulseVisualRef.current, 0.72);
        const reactionBurst = reactionBurstVisualRef.current * reactionStrengthRef.current;
        const channelCompression = creationChannel * 0.22;
        const pulseExpansion = creationPulse * 0.28;
        const scaleKick = impulse * 0.05;
        const reactionExpansion = reactionBurst * 0.5;
        const drawCompress = drawIntensity * 0.12;
        const finalScale = 1 + basePulse + activityPulse - channelCompression + pulseExpansion + scaleKick + reactionExpansion - drawCompress;

        if (pointLightRef.current) {
            pointLightRef.current.intensity = 0.2 + visualActivity * 3.2 + creationChannel * 3.6 + impulse * 0.5 + creationPulse * 5.8 - drawIntensity * 1.2;
        }
        if (reactionLightRef.current) {
            reactionLightRef.current.intensity = reactionBurst * 18.0;
        }
        if (drawLightRef.current) {
            drawLightRef.current.intensity = drawIntensity * 7.0;
        }
        if (materialRef.current) {
            if (reactionBurst > 0.01) {
                _tmpColor.copy(COLOR_VIOLET).lerp(COLOR_WHITE, Math.min(reactionBurst * 1.5, 1.0));
            } else if (drawIntensity > 0) {
                _tmpColor.copy(COLOR_ORANGE).lerp(COLOR_VIOLET, drawIntensity);
            } else if (visualActivity > 0.01) {
                _tmpColor.copy(COLOR_ORANGE).multiplyScalar(visualActivity * 0.12);
            } else {
                _tmpColor.set(0, 0, 0);
            }
            materialRef.current.emissive.lerp(_tmpColor, 0.12);
        }
        if (coreRef.current) {
            // Primary spin in local Y — stays in core's own frame regardless of wobble orientation
            coreRef.current.rotateOnAxis(RING_ORBITAL, 0.009 + speedActivity * 0.21 - creationChannel * 0.018 + creationPulse * 0.06);
            // Organic world-space wobble via sine-delta — never accumulates, no swaddling
            const cw = coreWobbleRef.current;
            const ct = Math.sin(time * 0.37) * 0.35 + Math.sin(time * 0.91 + 1.3) * 0.13 + Math.sin(time * 1.67 + 0.8) * 0.05;
            const cr = Math.sin(time * 0.53 + 2.1) * 0.35 + Math.sin(time * 1.07 + 0.6) * 0.13 + Math.sin(time * 1.83 + 1.7) * 0.05;
            coreRef.current.rotateOnWorldAxis(RING_WORLD_TILT, ct - cw.t);
            coreRef.current.rotateOnWorldAxis(RING_WORLD_ROLL, cr - cw.r);
            cw.t = ct; cw.r = cr;
            coreRef.current.scale.set(finalScale, finalScale, finalScale);
        }
        if (materialRef.current) {
            materialRef.current.emissiveIntensity = 0.0 + visualActivity * 1.8 + impulse * 0.15 + creationChannel * 8.4 + creationPulse * 7.2 + glowKick * 0.1 + drawIntensity * 4.0 + reactionBurst * 14.0;
        }
        const ringContract = drawIntensity * 0.1;
        const ringBurst1 = breath1 - ringContract + reactionBurst * 0.55;
        const ringBurst2 = breath2 - ringContract + reactionBurst * 0.70;
        const ringBurst3 = breath3 - ringContract + reactionBurst * 0.85;

        const ringBoost = ringBoostRef.current;
        const wd = ringWobbleRef.current;
        if (ringRef.current) {
            // Gyroscopic precession: sin/cos pair → axis traces a cone. Period = 2π/ω seconds.
            const t1 = Math.sin(time * 0.45) * 1.2;        // ~14s cycle, ±69°
            const r1 = Math.cos(time * 0.45) * 1.2;
            ringRef.current.rotateOnWorldAxis(RING_WORLD_TILT, t1 - wd.t1);
            ringRef.current.rotateOnWorldAxis(RING_WORLD_ROLL, r1 - wd.r1);
            wd.t1 = t1; wd.r1 = r1;
            ringRef.current.rotateOnAxis(RING_ORBITAL, 0.0025 + speedActivity * 0.06 + ringBoost * 0.05);
        }
        if (ring2Ref.current) {
            const t2 = Math.sin(time * 0.35 + Math.PI * 0.5) * 1.1;  // ~18s cycle, ±63°
            const r2 = Math.cos(time * 0.35 + Math.PI * 0.5) * 1.1;
            ring2Ref.current.rotateOnWorldAxis(RING_WORLD_TILT, t2 - wd.t2);
            ring2Ref.current.rotateOnWorldAxis(RING_WORLD_ROLL, r2 - wd.r2);
            wd.t2 = t2; wd.r2 = r2;
            ring2Ref.current.rotateOnAxis(RING_ORBITAL, -(0.003 + speedActivity * 0.07 + ringBoost * 0.06));
        }
        if (ring3Ref.current) {
            const t3 = Math.sin(time * 0.55 + Math.PI * 1.5) * 1.0;  // ~11s cycle, ±57°, opposite ring 2
            const r3 = Math.cos(time * 0.55 + Math.PI * 1.5) * 1.0;
            ring3Ref.current.rotateOnWorldAxis(RING_WORLD_TILT, t3 - wd.t3);
            ring3Ref.current.rotateOnWorldAxis(RING_WORLD_ROLL, r3 - wd.r3);
            wd.t3 = t3; wd.r3 = r3;
            ring3Ref.current.rotateOnAxis(RING_ORBITAL, 0.0035 + speedActivity * 0.08 + ringBoost * 0.07);
        }
        if (assemblyRef.current) {
            const rawBurst = reactionBurstRef.current * reactionStrengthRef.current;
            const drawTremor = Math.sin(time * 28) * drawIntensity * 0.04;
            assemblyRef.current.rotation.z = kick * 0.035 + creationPulse * 0.048 + drawTremor + rawBurst * 0.18;
            assemblyRef.current.rotation.x = kick * 0.012 + creationPulse * 0.022 - drawTremor * 0.7 + rawBurst * 0.10;
            assemblyRef.current.position.y = kick * 0.008 - creationChannel * 0.13 + creationPulse * 0.024 - drawIntensity * 0.18 + rawBurst * 0.09;
        }

        if (motesRef.current) {
            motesRef.current.children.forEach((mote, index) => {
                const moteData = motesDataRef.current[index];
                if (!moteData) return;

                const bbAnim = bigBangAnimRef.current;
                const orbitRadiusTarget =
                    bigBangPhase === 'collapse'
                        ? Math.max(0, moteData.baseRadius * (1 - bbAnim.collapseProgress * 1.05))
                    : bigBangPhase === 'singularity' || bigBangPhase === 'flash'
                        ? 0
                    : bigBangPhase === 'expansion'
                        ? moteData.baseRadius * (0.2 + bbAnim.expansionProgress * 1.8)
                    : bigBangPhase === 'rebirth'
                        ? moteData.baseRadius * (bbAnim.rebirthProgress + Math.sin(bbAnim.rebirthProgress * Math.PI) * 0.45)
                    : creationPulse > 0
                        ? moteData.baseRadius + creationPulse * 1.8
                    : drawIntensity > 0
                        ? Math.max(1.15, moteData.baseRadius - drawIntensity * moteData.baseRadius * 0.97)
                    : reactionBurst > 0.05
                        ? moteData.baseRadius + reactionBurst * 2.4
                    : creationChannel > 0
                        ? Math.max(0.05, moteData.baseRadius - creationChannel * 2.35)
                    : moteData.baseRadius;

                const radiusLerpSpeed = bigBangPhase ? 0.12 : drawIntensity > 0 ? 0.22 : creationPulse > 0 ? 0.22 : creationChannel > 0 ? 0.14 : 0.08;
                moteData.currentRadius += (orbitRadiusTarget - moteData.currentRadius) * radiusLerpSpeed;
                const orbitSpeedMultiplier =
                    bigBangPhase === 'collapse'
                        ? 1 + bbAnim.collapseProgress * 5
                    : bigBangPhase === 'singularity' || bigBangPhase === 'flash'
                        ? 0
                    : bigBangPhase === 'expansion'
                        ? 2 + (1 - bbAnim.expansionProgress) * 2
                    : bigBangPhase === 'rebirth'
                        ? bbAnim.rebirthProgress
                    : creationPulse > 0
                        ? 2.5
                    : drawIntensity > 0
                        ? Math.max(0.02, 1 - drawIntensity * 0.85)
                    : creationChannel > 0
                        ? Math.max(0.02, 1 - creationChannel * 1.55)
                    : 1;
                moteData.angle += (moteData.speed + visualActivity * 0.0015) * orbitSpeedMultiplier;

                const x = Math.cos(moteData.angle) * moteData.currentRadius;
                const z = Math.sin(moteData.angle) * moteData.currentRadius;
                const y = moteData.verticalOffset + Math.sin(time * 1.2 + index) * (creationPulse > 0 ? 0.02 : 0.05);

                mote.position.set(x, y, z);

                // Orient crystal: long axis (+Y) points in direction of travel (tangent to orbit)
                _tmpVec3.set(-Math.sin(moteData.angle), 0, Math.cos(moteData.angle));
                _tmpQuat.setFromUnitVectors(_MOTE_UP, _tmpVec3);
                mote.quaternion.copy(_tmpQuat);

                // Trail: shift history back, write current position at end
                const trailGeo = trailGeosRef.current[index];
                if (trailGeo && trailGeo.attributes.position) {
                    const tArr = trailArraysRef.current[index];
                    tArr.copyWithin(0, 3);
                    tArr[(TRAIL_LENGTH - 1) * 3]     = x;
                    tArr[(TRAIL_LENGTH - 1) * 3 + 1] = y;
                    tArr[(TRAIL_LENGTH - 1) * 3 + 2] = z;
                    trailGeo.attributes.position.needsUpdate = true;
                }
                const trailMat = trailMatsRef.current[index];
                if (trailMat) {
                    trailMat.opacity = Math.min(0.07 + visualActivity * 0.3 + reactionBurst * 0.45 + drawIntensity * 0.22, 0.7);
                }

                // Fade + shrink as mote enters the core (surface at radius 1.0)
                const submersionT = creationChannel > 0 ? Math.max(0, Math.min(1, (1.1 - moteData.currentRadius) / 1.1)) : 0;
                const channelOpacityTarget = creationChannel > 0 ? (0.34 + creationChannel * 1.0) * (1 - submersionT) : 0.22 + visualActivity * 0.1;
                const pulseOpacityTarget = creationPulse > 0 ? Math.max(0, 0.95 - creationPulse * 0.42) : 0;
                const opacityTarget = Math.max(channelOpacityTarget, pulseOpacityTarget);
                moteData.opacity += (opacityTarget - moteData.opacity) * 0.16;

                const scaleTarget = creationChannel > 0
                    ? moteData.scale + creationChannel * 0.65
                    : moteData.scale;
                const submersionScale = 1 - submersionT * 0.85;
                const finalMoteScale = scaleTarget * (creationPulse > 0 ? Math.max(0.22, 1 - creationPulse * 0.72) : 1) * submersionScale;
                mote.scale.set(finalMoteScale * 0.9, finalMoteScale * 0.9, finalMoteScale * (1.0 + creationChannel * 0.9));

                if (mote.material) {
                    mote.material.opacity = moteData.opacity;
                    mote.material.emissiveIntensity = 0.9 + visualActivity * 0.55 + creationChannel * 3.8 + creationPulse * 2.6 + drawIntensity * 3.5 + reactionBurst * 4.0;
                }

                // Arc line: jagged lightning from mote → core
                const arcGeo = arcGeosRef.current[index];
                if (arcGeo && arcGeo.attributes.position) {
                    const arr = arcArraysRef.current[index];
                    const intensity = drawIntensity > 0 ? drawIntensity : reactionBurst > 0 ? reactionBurst : creationChannel;
                    const jitterScale = moteData.currentRadius * 0.22 * intensity;
                    for (let s = 0; s < ARC_SEGMENTS; s++) {
                        const t = s / (ARC_SEGMENTS - 1);
                        const base0 = x * (1 - t);
                        const base1 = y * (1 - t);
                        const base2 = z * (1 - t);
                        const envelope = Math.sin(t * Math.PI);
                        const j = s > 0 && s < ARC_SEGMENTS - 1 ? jitterScale * envelope : 0;
                        arr[s * 3 + 0] = base0 + (Math.random() - 0.5) * 2 * j;
                        arr[s * 3 + 1] = base1 + (Math.random() - 0.5) * 2 * j;
                        arr[s * 3 + 2] = base2 + (Math.random() - 0.5) * 2 * j;
                    }
                    arcGeo.attributes.position.needsUpdate = true;
                }
                const arcMat = arcMatsRef.current[index];
                if (arcMat) {
                    const bbAnim2 = bigBangAnimRef.current;
                    arcMat.opacity =
                        bigBangPhase === 'collapse'
                            ? bbAnim2.collapseProgress * 0.85
                        : bigBangPhase === 'expansion'
                            ? (1 - bbAnim2.expansionProgress) * 0.5
                        : bigBangPhase === 'singularity' || bigBangPhase === 'flash' || bigBangPhase === 'rebirth'
                            ? 0
                        : drawIntensity > 0
                            ? drawIntensity * 0.65
                        : reactionBurst > 0.05
                            ? reactionBurst * 0.4
                        : creationChannel > 0.05
                            ? Math.min(creationChannel, 1) * 0.5
                        : creationPulse > 0.05
                            ? creationPulse * 0.3
                        : 0;
                }
            });
        }

        // Materialization dust particles
        if (particleActiveRef.current && particleGeoRef.current && particleMatRef.current) {
            const arr = particleArrayRef.current;
            const pullSpeed = 2.4 * Math.max(creationChannel, 0.1);
            let anyAlive = false;
            particleDataRef.current.forEach((p, i) => {
                if (p.currentR > 1.05) {
                    // Accelerate as they approach the core (gravity-like)
                    const proximity = 1 - (p.currentR - 1.05) / 3.0;
                    p.currentR = Math.max(1.05, p.currentR - delta * pullSpeed * (1 + proximity * 1.5));
                    anyAlive = true;
                }
                arr[i * 3]     = p.dx * p.currentR;
                arr[i * 3 + 1] = p.dy * p.currentR;
                arr[i * 3 + 2] = p.dz * p.currentR;
            });
            particleGeoRef.current.attributes.position.needsUpdate = true;
            const targetOpacity = creationChannel > 0.05 ? Math.min(creationChannel * 0.85, 0.7) : 0;
            particleMatRef.current.opacity += (targetOpacity - particleMatRef.current.opacity) * 0.12;
            if (!anyAlive && creationChannel < 0.05) {
                particleActiveRef.current = false;
                particleMatRef.current.opacity = 0;
            }
        }

        // Reaction burst sparks
        if (burstActiveRef.current && burstGeoRef.current && burstMatRef.current) {
            const arr = burstArrayRef.current;
            const drag = Math.pow(0.992, delta * 60);
            let anyAlive = false;
            burstDataRef.current.forEach((p, i) => {
                p.life += delta;
                if (p.life < p.maxLife) {
                    p.vx *= drag; p.vy *= drag; p.vz *= drag;
                    p.x += p.vx * delta;
                    p.y += p.vy * delta;
                    p.z += p.vz * delta;
                    anyAlive = true;
                }
                arr[i * 3]     = p.x;
                arr[i * 3 + 1] = p.y;
                arr[i * 3 + 2] = p.z;
            });
            burstGeoRef.current.attributes.position.needsUpdate = true;
            const lifeFrac = anyAlive ? Math.min(reactionBurst * 3, 1) : 0;
            burstMatRef.current.opacity = lifeFrac;
            _tmpColor.copy(COLOR_WHITE).lerp(COLOR_ORANGE, 1 - lifeFrac);
            burstMatRef.current.color.copy(_tmpColor);
            if (!anyAlive) { burstActiveRef.current = false; burstMatRef.current.opacity = 0; }
        }

        // Reaction embers
        if (emberGeoRef.current && emberMatRef.current) {
            const arr = emberArrayRef.current;
            const drag = Math.pow(0.978, delta * 60);
            let anyAlive = false;
            emberDataRef.current.forEach((p, i) => {
                p.life += delta;
                if (p.life < p.maxLife) {
                    p.vx *= drag; p.vy *= drag; p.vz *= drag;
                    p.x += p.vx * delta;
                    p.y += p.vy * delta;
                    p.z += p.vz * delta;
                    anyAlive = true;
                }
                arr[i * 3]     = p.x;
                arr[i * 3 + 1] = p.y;
                arr[i * 3 + 2] = p.z;
            });
            emberGeoRef.current.attributes.position.needsUpdate = true;
            const emberFrac = anyAlive ? Math.min(reactionBurst * 2, 1) : 0;
            emberMatRef.current.opacity = emberFrac * 0.85;
            _tmpColor.copy(COLOR_ORANGE).lerp(COLOR_VIOLET, 1 - emberFrac);
            emberMatRef.current.color.copy(_tmpColor);
            if (!anyAlive) emberMatRef.current.opacity = 0;
        }

        if (!creationPulseFiredRef.current && creationChannelRef.current > 0 && creationChannelRef.current < 0.26) {
            creationPulseRef.current = 1;
            creationPulseFiredRef.current = true;
        }

        // Shockwave ring animation
        const sw = shockwaveStateRef.current;
        if (sw.active && shockwaveRef.current && shockwaveMaterialRef.current) {
            sw.progress += delta * (1 / 1.4); // 1.4s duration
            if (sw.progress >= 1) {
                sw.active = false;
                sw.progress = 1;
                shockwaveRef.current.scale.set(0, 0, 0);
                shockwaveMaterialRef.current.opacity = 0;
            } else {
                const maxScale = 2.5 + sw.strength * 4.5;
                const s = sw.progress * maxScale;
                shockwaveRef.current.scale.set(s, s, s);
                shockwaveMaterialRef.current.opacity = (1 - sw.progress) * 0.85 * sw.strength;
            }
        }

        // === BIGBANG OVERRIDE ===
        if (bigBangPhase) {
            const a = bigBangAnimRef.current;

            if (bigBangPhase === 'collapse') {
                a.collapseProgress = Math.min(a.collapseProgress + delta / 2.0, 1);
                const cp = a.collapseProgress;
                const cpE = cp * cp; // ease in — slow start, rapid finish

                if (coreRef.current) coreRef.current.scale.setScalar(Math.max(0, 1 - cpE));
                if (materialRef.current) {
                    _tmpColor.copy(COLOR_ORANGE).lerp(COLOR_WHITE, Math.min(cp * 1.4, 1));
                    materialRef.current.emissive.copy(_tmpColor);
                    materialRef.current.emissiveIntensity = 2.2 + cpE * 38;
                }
                const ringScale = Math.max(0, 1 - cpE);
                if (ringRef.current)  { ringRef.current.scale.setScalar(ringScale);  ringRef.current.rotateOnAxis(RING_ORBITAL,  0.06 * cp); }
                if (ring2Ref.current) { ring2Ref.current.scale.setScalar(ringScale); ring2Ref.current.rotateOnAxis(RING_ORBITAL, -0.09 * cp); }
                if (ring3Ref.current) { ring3Ref.current.scale.setScalar(ringScale); ring3Ref.current.rotateOnAxis(RING_ORBITAL,  0.12 * cp); }
                if (pointLightRef.current)    pointLightRef.current.intensity    = Math.max(0, 1.3 - cp * 1.3);
                if (reactionLightRef.current) reactionLightRef.current.intensity = cpE * 32;
                if (drawLightRef.current)     drawLightRef.current.intensity     = cp * 14;

                // Warp streaks — stars sucked inward in the final 50% of collapse
                const warpT = Math.max(0, (cp - 0.5) / 0.5);
                if (warpT > 0 && warpGeoRef.current && warpMatRef.current) {
                    const arr = warpArrayRef.current;
                    for (let i = 0; i < WARP_COUNT; i++) {
                        const d = WARP_DATA[i];
                        const innerEnd = d.innerR * (1 - warpT * 0.97);
                        // outer point
                        arr[i * 6 + 0] = d.dx * d.outerR;
                        arr[i * 6 + 1] = d.dy * d.outerR;
                        arr[i * 6 + 2] = d.dz * d.outerR;
                        // inner point (rushes toward center)
                        arr[i * 6 + 3] = d.dx * innerEnd;
                        arr[i * 6 + 4] = d.dy * innerEnd;
                        arr[i * 6 + 5] = d.dz * innerEnd;
                    }
                    warpGeoRef.current.attributes.position.needsUpdate = true;
                    warpMatRef.current.opacity = warpT * 0.72;
                }

                // Suction ring — event horizon closing in the final 35% of collapse
                if (suctionRingRef.current && suctionRingMatRef.current) {
                    const sT = Math.max(0, (cp - 0.65) / 0.35); // 0→1 over last 35%
                    suctionRingRef.current.scale.setScalar(sT > 0 ? (1 - sT) * 5.5 : 0);
                    suctionRingMatRef.current.opacity = sT * (1 - sT * 0.6) * 1.2;
                    suctionRingRef.current.rotation.z += delta * (2 + sT * 6); // spins faster as it tightens
                }

            } else if (bigBangPhase === 'singularity' || bigBangPhase === 'flash') {
                if (coreRef.current)  coreRef.current.scale.setScalar(0);
                if (ringRef.current)  ringRef.current.scale.setScalar(0);
                if (ring2Ref.current) ring2Ref.current.scale.setScalar(0);
                if (ring3Ref.current) ring3Ref.current.scale.setScalar(0);
                if (suctionRingRef.current)   suctionRingRef.current.scale.setScalar(0);
                if (warpMatRef.current)       warpMatRef.current.opacity = 0;
                if (pointLightRef.current)    pointLightRef.current.intensity    = 0;
                if (reactionLightRef.current) reactionLightRef.current.intensity = 0;
                if (drawLightRef.current)     drawLightRef.current.intensity     = 0;

            } else if (bigBangPhase === 'expansion') {
                a.expansionProgress = Math.min(a.expansionProgress + delta / 1.0, 1);
                const ep = a.expansionProgress;
                const epE = 1 - Math.pow(1 - ep, 3); // ease out — fast start, smooth finish

                if (coreRef.current) coreRef.current.scale.setScalar(epE * 1.3);
                if (materialRef.current) {
                    _tmpColor.copy(COLOR_WHITE).lerp(COLOR_ORANGE, ep);
                    materialRef.current.emissive.copy(_tmpColor);
                    materialRef.current.emissiveIntensity = 2.2 + (1 - ep) * 22;
                }
                if (reactionLightRef.current) reactionLightRef.current.intensity = (1 - ep) * 38;
                if (drawLightRef.current)     drawLightRef.current.intensity     = 0;
                if (warpMatRef.current)       warpMatRef.current.opacity         = 0;
                if (pointLightRef.current)    pointLightRef.current.intensity    = epE * 1.3;

                // Rings emerge with stagger
                if (ringRef.current)  ringRef.current.scale.setScalar(Math.min(epE * 1.6, 1));
                if (ring2Ref.current) ring2Ref.current.scale.setScalar(Math.min(epE * 1.3, 1));
                if (ring3Ref.current) ring3Ref.current.scale.setScalar(Math.min(epE * 1.1, 1));

                // BigBang shockwaves
                bigBangSWStatesRef.current.forEach((sw, i) => {
                    if (!sw.active) return;
                    const localT = (ep - sw.delay) / 0.6;
                    if (localT < 0) return;
                    sw.progress = Math.min(localT, 1);
                    const mesh = bigBangSWMeshesRef.current[i];
                    const mat  = bigBangSWMatsRef.current[i];
                    if (mesh && mat) {
                        mesh.scale.setScalar(sw.progress * 12);
                        mat.opacity = (1 - sw.progress) * 0.85;
                        if (sw.progress >= 1) { sw.active = false; mesh.scale.setScalar(0); mat.opacity = 0; }
                    }
                });

            } else if (bigBangPhase === 'rebirth') {
                a.rebirthProgress = Math.min(a.rebirthProgress + delta / 2.0, 1);
                const rp = a.rebirthProgress;
                // Heartbeat pulse — peaks at rp≈0.25, fades by rp=0.8
                const heartbeat = Math.max(0, Math.sin(rp * Math.PI * 1.2)) * (1 - rp);

                if (coreRef.current) {
                    // Brief overshoot then settle to 1
                    const coreScale = 1 + heartbeat * 0.35;
                    coreRef.current.scale.setScalar(coreScale);
                }
                if (materialRef.current) {
                    _tmpColor.copy(COLOR_WHITE).lerp(COLOR_ORANGE, Math.min(rp * 1.4, 1));
                    materialRef.current.emissive.copy(_tmpColor);
                    materialRef.current.emissiveIntensity = 2.2 + (1 - rp) * 9 + heartbeat * 7;
                }
                if (ringRef.current)  ringRef.current.scale.setScalar(1);
                if (ring2Ref.current) ring2Ref.current.scale.setScalar(1);
                if (ring3Ref.current) ring3Ref.current.scale.setScalar(1);
                // Extra ring spin speed that fades over rebirth — use local axis to avoid Euler jitter on tilted rings
                const ringBurst = (1 - rp) * 0.06;
                if (ringRef.current)  ringRef.current.rotateOnAxis(RING_ORBITAL,  ringBurst);
                if (ring2Ref.current) ring2Ref.current.rotateOnAxis(RING_ORBITAL, -ringBurst * 1.4);
                if (ring3Ref.current) ring3Ref.current.rotateOnAxis(RING_ORBITAL,  ringBurst * 1.8);
                // Point light pulses with heartbeat then normalizes
                if (pointLightRef.current)    pointLightRef.current.intensity    = rp * 1.3 + heartbeat * 4;
                if (reactionLightRef.current) reactionLightRef.current.intensity = heartbeat * 6;
                if (drawLightRef.current)     drawLightRef.current.intensity     = 0;
                // Hide suction ring
                if (suctionRingRef.current)   suctionRingRef.current.scale.setScalar(0);
            }
        }

        impulseRef.current *= 0.88;
        kickRef.current *= 0.82;
        glowKickRef.current *= 0.72;
        ringBoostRef.current *= 0.94;
        creationPulseRef.current *= 0.84;
        creationChannelRef.current *= 0.972;
        reactionBurstRef.current *= 0.97;

        if (creationPulseRef.current < 0.01) creationPulseRef.current = 0;
        if (creationChannelRef.current < 0.01) creationChannelRef.current = 0;
        if (creationChannelVisualRef.current < 0.01) creationChannelVisualRef.current = 0;
        if (creationPulseVisualRef.current < 0.01) creationPulseVisualRef.current = 0;
        if (reactionBurstRef.current < 0.01) reactionBurstRef.current = 0;
        if (reactionBurstVisualRef.current < 0.01) reactionBurstVisualRef.current = 0;
    });

    return (
        <>
            <Stars radius={80} depth={60} count={4000} factor={3} saturation={0.4} fade speed={0.6} />
            <fog attach="fog" args={['#060a14', 12, 30]} />
            <Environment preset="warehouse" background={false} environmentIntensity={0.35} />
            <ambientLight intensity={0.25} />
            <pointLight ref={pointLightRef} position={[0, 0, 0]} color="#ff8833" />
            <pointLight ref={reactionLightRef} position={[0, 0, 0]} color="#ffffff" intensity={0} />
            <pointLight ref={drawLightRef} position={[0, 0, 0]} color="#9933ff" intensity={0} />
            <pointLight position={[6, 4, 4]}  color="#c8eeff" intensity={1.2} />
            <pointLight position={[-5, 2, -2]} color="#ffffff" intensity={0.7} />
            <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
            <group ref={assemblyRef}>
                <group>
                    {MOTE_CONFIGS.map((_, i) => (
                        <line key={`arc-${i}`}>
                            <bufferGeometry ref={el => { arcGeosRef.current[i] = el; }}>
                                <bufferAttribute
                                    attach="attributes-position"
                                    array={arcArraysRef.current[i]}
                                    count={ARC_SEGMENTS}
                                    itemSize={3}
                                />
                            </bufferGeometry>
                            <lineBasicMaterial
                                ref={el => { arcMatsRef.current[i] = el; }}
                                color="#cc77ff"
                                transparent
                                opacity={0}
                                depthWrite={false}
                            />
                        </line>
                    ))}
                </group>
                <group>
                    {MOTE_CONFIGS.map((_, i) => (
                        <line key={`trail-${i}`}>
                            <bufferGeometry ref={el => { trailGeosRef.current[i] = el; }}>
                                <bufferAttribute
                                    attach="attributes-position"
                                    array={trailArraysRef.current[i]}
                                    count={TRAIL_LENGTH}
                                    itemSize={3}
                                />
                            </bufferGeometry>
                            <lineBasicMaterial
                                ref={el => { trailMatsRef.current[i] = el; }}
                                color="#b8f5ff"
                                transparent
                                opacity={0}
                                depthWrite={false}
                            />
                        </line>
                    ))}
                </group>
                <group ref={motesRef}>
                    {MOTE_CONFIGS.map((mote, i) => (
                        <mesh
                            key={i}
                            position={[Math.cos(mote.angle) * mote.baseRadius, mote.verticalOffset, Math.sin(mote.angle) * mote.baseRadius]}
                            geometry={moonstoneGeometry}
                            material={moonstoneMaterials[i]}
                        />
                    ))}
                </group>
                <mesh
                    ref={coreRef}
                    geometry={coreGeometry}
                    onClick={() => {
                        impulseRef.current = Math.min(impulseRef.current + 0.22, 0.8);
                        kickRef.current = Math.min(kickRef.current + 0.16, 0.35);
                        glowKickRef.current = Math.min(glowKickRef.current + 0.4, 1.0);
                        ringBoostRef.current = Math.min(ringBoostRef.current + 0.4, 2.5);
                        onCoreClick && onCoreClick();
                    }}
                >
                    <meshStandardMaterial
                        ref={materialRef}
                        color="#ffffff"
                        emissive="#000000"
                        emissiveIntensity={0}
                        metalness={0.30}
                        roughness={0.70}
                        envMapIntensity={0.25}
                        map={coreTexMaps.map}
                        normalMap={coreTexMaps.normalMap}
                    />
                </mesh>
                <group ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                    {ring1Segs.map((seg, i) => (
                        <group key={i} position={[seg.x, 0, seg.z]} rotation={[0, -seg.angle, 0]}>
                            <mesh><boxGeometry args={[seg.arcLen, seg.segH, seg.segD]} /><meshStandardMaterial color="#111827" metalness={0.65} roughness={0.35} envMapIntensity={0.6} /></mesh>
                            <mesh position={[0, 0,  seg.segD * 0.5 + 0.003]}><boxGeometry args={[seg.arcLen * 0.68, 0.009, 0.007]} /><meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[0, 0, -seg.segD * 0.5 - 0.003]}><boxGeometry args={[seg.arcLen * 0.68, 0.009, 0.007]} /><meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[0,  seg.segH * 0.5 + 0.003, 0]}><boxGeometry args={[seg.arcLen * 0.68, 0.007, 0.009]} /><meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[0, -seg.segH * 0.5 - 0.003, 0]}><boxGeometry args={[seg.arcLen * 0.68, 0.007, 0.009]} /><meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[ seg.arcLen * 0.5 + 0.003, 0, 0]}><boxGeometry args={[0.007, 0.009, 0.009]} /><meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[-seg.arcLen * 0.5 - 0.003, 0, 0]}><boxGeometry args={[0.007, 0.009, 0.009]} /><meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                        </group>
                    ))}
                </group>
                <group ref={ring2Ref} rotation={[Math.PI / 2, Math.PI / 3, 0]}>
                    {ring2Segs.map((seg, i) => (
                        <group key={i} position={[seg.x, 0, seg.z]} rotation={[0, -seg.angle, 0]}>
                            <mesh><boxGeometry args={[seg.arcLen, seg.segH, seg.segD]} /><meshStandardMaterial color="#111827" metalness={0.65} roughness={0.35} envMapIntensity={0.6} /></mesh>
                            <mesh position={[0, 0,  seg.segD * 0.5 + 0.003]}><boxGeometry args={[seg.arcLen * 0.68, 0.009, 0.007]} /><meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[0, 0, -seg.segD * 0.5 - 0.003]}><boxGeometry args={[seg.arcLen * 0.68, 0.009, 0.007]} /><meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[0,  seg.segH * 0.5 + 0.003, 0]}><boxGeometry args={[seg.arcLen * 0.68, 0.007, 0.009]} /><meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[0, -seg.segH * 0.5 - 0.003, 0]}><boxGeometry args={[seg.arcLen * 0.68, 0.007, 0.009]} /><meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[ seg.arcLen * 0.5 + 0.003, 0, 0]}><boxGeometry args={[0.007, 0.009, 0.009]} /><meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[-seg.arcLen * 0.5 - 0.003, 0, 0]}><boxGeometry args={[0.007, 0.009, 0.009]} /><meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                        </group>
                    ))}
                </group>
                <group ref={ring3Ref} rotation={[Math.PI / 2, Math.PI * 2 / 3, 0]}>
                    {ring3Segs.map((seg, i) => (
                        <group key={i} position={[seg.x, 0, seg.z]} rotation={[0, -seg.angle, 0]}>
                            <mesh><boxGeometry args={[seg.arcLen, seg.segH, seg.segD]} /><meshStandardMaterial color="#111827" metalness={0.65} roughness={0.35} envMapIntensity={0.6} /></mesh>
                            <mesh position={[0, 0,  seg.segD * 0.5 + 0.003]}><boxGeometry args={[seg.arcLen * 0.68, 0.009, 0.007]} /><meshStandardMaterial color="#e0f0ff" emissive="#e0f0ff" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[0, 0, -seg.segD * 0.5 - 0.003]}><boxGeometry args={[seg.arcLen * 0.68, 0.009, 0.007]} /><meshStandardMaterial color="#e0f0ff" emissive="#e0f0ff" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[0,  seg.segH * 0.5 + 0.003, 0]}><boxGeometry args={[seg.arcLen * 0.68, 0.007, 0.009]} /><meshStandardMaterial color="#e0f0ff" emissive="#e0f0ff" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[0, -seg.segH * 0.5 - 0.003, 0]}><boxGeometry args={[seg.arcLen * 0.68, 0.007, 0.009]} /><meshStandardMaterial color="#e0f0ff" emissive="#e0f0ff" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[ seg.arcLen * 0.5 + 0.003, 0, 0]}><boxGeometry args={[0.007, 0.009, 0.009]} /><meshStandardMaterial color="#e0f0ff" emissive="#e0f0ff" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                            <mesh position={[-seg.arcLen * 0.5 - 0.003, 0, 0]}><boxGeometry args={[0.007, 0.009, 0.009]} /><meshStandardMaterial color="#e0f0ff" emissive="#e0f0ff" emissiveIntensity={0.7} roughness={0.3} metalness={0.1} /></mesh>
                        </group>
                    ))}
                </group>
            </group>
            <mesh ref={shockwaveRef} rotation={[Math.PI / 2, 0, 0]} scale={[0, 0, 0]}>
                <torusGeometry args={[1, 0.018, 8, 128]} />
                <meshBasicMaterial
                    ref={shockwaveMaterialRef}
                    color="#ffaa44"
                    transparent
                    opacity={0}
                    depthWrite={false}
                />
            </mesh>
            <points>
                <bufferGeometry ref={particleGeoRef}>
                    <bufferAttribute
                        attach="attributes-position"
                        array={particleArrayRef.current}
                        count={PARTICLE_COUNT}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    ref={particleMatRef}
                    color="#c8eeff"
                    size={0.07}
                    transparent
                    opacity={0}
                    depthWrite={false}
                    sizeAttenuation
                />
            </points>
            <points>
                <bufferGeometry ref={burstGeoRef}>
                    <bufferAttribute
                        attach="attributes-position"
                        array={burstArrayRef.current}
                        count={BURST_COUNT}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    ref={burstMatRef}
                    color="#ffffff"
                    size={0.09}
                    transparent
                    opacity={0}
                    depthWrite={false}
                    sizeAttenuation
                    blending={AdditiveBlending}
                />
            </points>
            <points>
                <bufferGeometry ref={emberGeoRef}>
                    <bufferAttribute
                        attach="attributes-position"
                        array={emberArrayRef.current}
                        count={EMBER_COUNT}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    ref={emberMatRef}
                    color="#ff5500"
                    size={0.18}
                    transparent
                    opacity={0}
                    depthWrite={false}
                    sizeAttenuation
                    blending={AdditiveBlending}
                />
            </points>
            <lineSegments>
                <bufferGeometry ref={warpGeoRef}>
                    <bufferAttribute
                        attach="attributes-position"
                        array={warpArrayRef.current}
                        count={WARP_COUNT * 2}
                        itemSize={3}
                    />
                </bufferGeometry>
                <lineBasicMaterial ref={warpMatRef} color="#88ccff" transparent opacity={0} depthWrite={false} />
            </lineSegments>
            <mesh ref={suctionRingRef} rotation={[Math.PI / 2, 0, 0]} scale={[0, 0, 0]}>
                <torusGeometry args={[1, 0.035, 8, 128]} />
                <meshBasicMaterial ref={suctionRingMatRef} color="#5500bb" transparent opacity={0} depthWrite={false} />
            </mesh>
            {[0, 1, 2].map(i => (
                <mesh key={`bb-sw-${i}`} ref={el => { bigBangSWMeshesRef.current[i] = el; }} rotation={[Math.PI / 2, 0, 0]} scale={[0, 0, 0]}>
                    <torusGeometry args={[1, 0.03, 8, 128]} />
                    <meshBasicMaterial
                        ref={el => { bigBangSWMatsRef.current[i] = el; }}
                        color="#ffffff"
                        transparent
                        opacity={0}
                        depthWrite={false}
                    />
                </mesh>
            ))}
        </>
    );
}

function GenesisScene({ onCoreClick, activityLevel, creationEvent, reactionEvent, bigBangPhase }) {
    return (
        <CanvasErrorBoundary>
            <Canvas
                camera={{ position: [0, 1.5, 6], fov: 55 }}
                onCreated={({ gl }) => {
                    gl.toneMapping = ACESFilmicToneMapping;
                    gl.toneMappingExposure = 1.1;
                }}
            >
                <Suspense fallback={null}>
                    <SceneContent onCoreClick={onCoreClick} activityLevel={activityLevel} creationEvent={creationEvent} reactionEvent={reactionEvent} bigBangPhase={bigBangPhase} />
                </Suspense>
                <EffectComposer>
                    <Bloom
                        luminanceThreshold={0.65}
                        luminanceSmoothing={0.1}
                        intensity={0.4}
                        mipmapBlur
                        radius={0.65}
                    />
                </EffectComposer>
            </Canvas>
        </CanvasErrorBoundary>
    );
}

export default GenesisScene;
