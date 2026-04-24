import { useEffect, useRef, Component } from "react";
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { AdditiveBlending, ACESFilmicToneMapping } from 'three'

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
        speed: 0.075,
        verticalOffset: -0.12,
        opacity: 0,
        scale: 0.9,
    },
    {
        angle: (Math.PI * 2) / 5,
        baseRadius: 2.58,
        currentRadius: 2.58,
        speed: 0.09,
        verticalOffset: 0.08,
        opacity: 0,
        scale: 1.05,
    },
    {
        angle: (Math.PI * 4) / 5,
        baseRadius: 2.72,
        currentRadius: 2.72,
        speed: 0.08,
        verticalOffset: -0.04,
        opacity: 0,
        scale: 0.95,
    },
    {
        angle: (Math.PI * 6) / 5,
        baseRadius: 2.52,
        currentRadius: 2.52,
        speed: 0.1,
        verticalOffset: 0.13,
        opacity: 0,
        scale: 1.1,
    },
    {
        angle: (Math.PI * 8) / 5,
        baseRadius: 2.66,
        currentRadius: 2.66,
        speed: 0.085,
        verticalOffset: -0.09,
        opacity: 0,
        scale: 0.98,
    },
];

function SceneContent({ onCoreClick, activityLevel, creationEvent }) {
    const coreRef = useRef();
    const materialRef = useRef();
    const ringRef = useRef();
    const ring2Ref = useRef();
    const ring3Ref = useRef();
    const impulseRef = useRef(0);
    const glowKickRef = useRef(0);
    const pointLightRef = useRef();
    const assemblyRef = useRef();
    const kickRef = useRef(0);
    const lastCreationEventRef = useRef(null);
    const creationPulseRef = useRef(0);
    const creationChannelRef = useRef(0);
    const creationPulseFiredRef = useRef(false);
    const creationChannelVisualRef = useRef(0);
    const creationPulseVisualRef = useRef(0);
    const motesRef = useRef();
    const motesDataRef = useRef(MOTE_CONFIGS.map((mote) => ({ ...mote })));

    useEffect(() => {
        if (creationEvent && (!lastCreationEventRef.current || creationEvent.timestamp !== lastCreationEventRef.current.timestamp)) {
            creationChannelRef.current = 1.6;
            creationPulseRef.current = 0;
            creationPulseFiredRef.current = false;
            lastCreationEventRef.current = creationEvent;
        }
    }, [creationEvent]);

    useFrame((state) => {
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

        creationChannelVisualRef.current += (creationChannelRef.current - creationChannelVisualRef.current) * 0.14;
        creationPulseVisualRef.current += (creationPulseRef.current - creationPulseVisualRef.current) * 0.18;

        const creationChannel = Math.pow(creationChannelVisualRef.current, 1.05);
        const creationPulse = Math.pow(creationPulseVisualRef.current, 0.72);
        const channelCompression = creationChannel * 0.22;
        const pulseExpansion = creationPulse * 0.14;
        const scaleKick = impulse * 0.05;
        const finalScale = 1 + basePulse + activityPulse - channelCompression + pulseExpansion + scaleKick;

        if (pointLightRef.current) {
            pointLightRef.current.intensity = 1.3 + visualActivity * 2.8 + creationChannel * 3.6 + impulse * 0.5 + creationPulse * 5.8 + glowKick * 4.0;
        }
        if (coreRef.current) {
            coreRef.current.rotation.y += 0.005 + speedActivity * 0.42 - creationChannel * 0.018 + creationPulse * 0.06;
            coreRef.current.rotation.x += 0.0025 + speedActivity * 0.18 - creationChannel * 0.008 + creationPulse * 0.025;
            coreRef.current.scale.set(finalScale, finalScale, finalScale);
        }
        if (materialRef.current) {
            materialRef.current.emissiveIntensity = 2.2 + visualActivity * 4.4 + impulse * 0.6 + creationChannel * 8.4 + creationPulse * 7.2 + glowKick * 3.5;
        }
        if (ringRef.current) {
            ringRef.current.rotation.y += 0.002 + speedActivity * 0.18 - creationChannel * 0.14 + creationPulse * 0.09;
            ringRef.current.rotation.x += 0.001 + speedActivity * 0.08 - creationChannel * 0.06 + creationPulse * 0.04;
            ringRef.current.rotation.z += 0.0015 + speedActivity * 0.05 - creationChannel * 0.04 + creationPulse * 0.028;
            ringRef.current.scale.set(breath1, breath1, 1);
        }
        if (ring2Ref.current) {
            ring2Ref.current.rotation.y -= 0.003 + speedActivity * 0.32 + creationChannel * 0.22 + creationPulse * 0.14;
            ring2Ref.current.rotation.x += 0.0015 + speedActivity * 0.12 - creationChannel * 0.08 + creationPulse * 0.055;
            ring2Ref.current.rotation.z += 0.002 + speedActivity * 0.08 - creationChannel * 0.055 + creationPulse * 0.04;
            ring2Ref.current.scale.set(breath2, breath2, 1);
        }
        if (ring3Ref.current) {
            ring3Ref.current.rotation.y += 0.0015 + speedActivity * 0.4 - creationChannel * 0.28 + creationPulse * 0.2;
            ring3Ref.current.rotation.x -= 0.002 + speedActivity * 0.15 + creationChannel * 0.1 + creationPulse * 0.075;
            ring3Ref.current.rotation.z += 0.0025 + speedActivity * 0.1 - creationChannel * 0.075 + creationPulse * 0.05;
            ring3Ref.current.scale.set(breath3, breath3, 1);
        }
        if (assemblyRef.current) {
            assemblyRef.current.rotation.z = kick * 0.035 + creationPulse * 0.025;
            assemblyRef.current.rotation.x = kick * 0.012 + creationPulse * 0.01;
            assemblyRef.current.position.y = kick * 0.008 - creationChannel * 0.13 + creationPulse * 0.024;
        }

        if (motesRef.current) {
            motesRef.current.children.forEach((mote, index) => {
                const moteData = motesDataRef.current[index];
                if (!moteData) return;

                const orbitRadiusTarget = creationPulse > 0
                    ? 0.12
                    : creationChannel > 0
                        ? Math.max(0.22, moteData.baseRadius - creationChannel * 2.35)
                        : moteData.baseRadius;

                moteData.currentRadius += (orbitRadiusTarget - moteData.currentRadius) * (creationPulse > 0 ? 0.22 : creationChannel > 0 ? 0.14 : 0.08);
                const orbitSpeedMultiplier = creationPulse > 0
                    ? 0.015
                    : creationChannel > 0
                        ? Math.max(0.02, 1 - creationChannel * 1.55)
                        : 1;
                moteData.angle += (moteData.speed + visualActivity * 0.003) * orbitSpeedMultiplier;

                const x = Math.cos(moteData.angle) * moteData.currentRadius;
                const z = Math.sin(moteData.angle) * moteData.currentRadius;
                const y = moteData.verticalOffset + Math.sin(time * 1.2 + index) * (creationPulse > 0 ? 0.02 : 0.05);

                mote.position.set(x, y, z);
                mote.lookAt(0, 0, 0);

                const channelOpacityTarget = creationChannel > 0 ? 0.34 + creationChannel * 0.82 : 0.12 + visualActivity * 0.08;
                const pulseOpacityTarget = creationPulse > 0 ? Math.max(0, 0.95 - creationPulse * 0.42) : 0;
                const opacityTarget = Math.max(channelOpacityTarget, pulseOpacityTarget);
                moteData.opacity += (opacityTarget - moteData.opacity) * 0.16;

                const scaleTarget = creationChannel > 0
                    ? moteData.scale + creationChannel * 0.42
                    : moteData.scale;
                const finalMoteScale = scaleTarget * (creationPulse > 0 ? Math.max(0.22, 1 - creationPulse * 0.72) : 1);
                mote.scale.set(finalMoteScale * 0.32, finalMoteScale * 0.32, finalMoteScale * (1.05 + creationChannel * 1.9));

                if (mote.material) {
                    mote.material.opacity = moteData.opacity;
                    mote.material.emissiveIntensity = 0.9 + visualActivity * 0.55 + creationChannel * 3.8 + creationPulse * 2.6;
                }
            });
        }

        if (!creationPulseFiredRef.current && creationChannelRef.current > 0 && creationChannelRef.current < 0.26) {
            creationPulseRef.current = 1;
            creationPulseFiredRef.current = true;
        }

        impulseRef.current *= 0.88;
        kickRef.current *= 0.82;
        glowKickRef.current *= 0.72; // fast decay — bright flash, then gone
        creationPulseRef.current *= 0.76;
        creationChannelRef.current *= 0.968;

        if (creationPulseRef.current < 0.01) creationPulseRef.current = 0;
        if (creationChannelRef.current < 0.01) creationChannelRef.current = 0;
        if (creationChannelVisualRef.current < 0.01) creationChannelVisualRef.current = 0;
        if (creationPulseVisualRef.current < 0.01) creationPulseVisualRef.current = 0;
    });

    return (
        <>
            <Stars radius={80} depth={60} count={4000} factor={3} saturation={0.4} fade speed={0.6} />
            <fog attach="fog" args={['#060a14', 12, 30]} />
            <ambientLight intensity={0.18} />
            <pointLight ref={pointLightRef} position={[0, 0, 0]} color="#ff8833" />
            <pointLight position={[6, 4, 4]} color="#00d4ff" intensity={0.4} />
            <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
            <group ref={assemblyRef}>
                <group ref={motesRef}>
                    {MOTE_CONFIGS.map((mote, i) => {
                        const angle = mote.angle;
                        const radius = mote.baseRadius;
                        return (
                            <mesh key={i} position={[Math.cos(angle) * radius, mote.verticalOffset, Math.sin(angle) * radius]}>
                                <sphereGeometry args={[0.07, 14, 14]} />
                                <meshStandardMaterial
                                    color="#b8f5ff"
                                    emissive="#b8f5ff"
                                    emissiveIntensity={1.2}
                                    transparent
                                    opacity={0.12}
                                    depthWrite={false}
                                />
                            </mesh>
                        );
                    })}
                </group>
                <mesh
                    ref={coreRef}
                    onClick={() => {
                        impulseRef.current = Math.min(impulseRef.current + 0.22, 0.8);
                        kickRef.current = Math.min(kickRef.current + 0.16, 0.35);
                        glowKickRef.current = Math.min(glowKickRef.current + 1.0, 3.0);
                        onCoreClick && onCoreClick();
                    }}
                >
                    <sphereGeometry args={[1, 48, 48]} />
                    <meshStandardMaterial ref={materialRef} color="#ff4400" emissive="#ff5500" emissiveIntensity={2.2} roughness={0.3} metalness={0.4} />
                </mesh>
                {/* Additive glow layers — simulate bloom without postprocessing */}
                <mesh>
                    <sphereGeometry args={[1.18, 32, 32]} />
                    <meshBasicMaterial color="#ff6600" transparent opacity={0.18} blending={AdditiveBlending} depthWrite={false} />
                </mesh>
                <mesh>
                    <sphereGeometry args={[1.5, 24, 24]} />
                    <meshBasicMaterial color="#ff4400" transparent opacity={0.07} blending={AdditiveBlending} depthWrite={false} />
                </mesh>
                <mesh>
                    <sphereGeometry args={[2.2, 18, 18]} />
                    <meshBasicMaterial color="#ff3300" transparent opacity={0.03} blending={AdditiveBlending} depthWrite={false} />
                </mesh>
                <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1.5, 0.07, 16, 120]} />
                    <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2.5} />
                </mesh>
                <mesh ref={ring2Ref} rotation={[0, Math.PI / 4, 0]}>
                    <torusGeometry args={[1.7, 0.07, 16, 120]} />
                    <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={2.5} />
                </mesh>
                <mesh ref={ring3Ref} rotation={[0, 0, Math.PI / 8]}>
                    <torusGeometry args={[1.9, 0.06, 16, 120]} />
                    <meshStandardMaterial color="#e0f0ff" emissive="#e0f0ff" emissiveIntensity={2.0} />
                </mesh>
            </group>
        </>
    );
}

function GenesisScene({ onCoreClick, activityLevel, creationEvent }) {
    return (
        <CanvasErrorBoundary>
            <Canvas
                camera={{ position: [0, 1.5, 6], fov: 55 }}
                onCreated={({ gl }) => {
                    gl.toneMapping = ACESFilmicToneMapping;
                    gl.toneMappingExposure = 1.1;
                }}
            >
                <SceneContent onCoreClick={onCoreClick} activityLevel={activityLevel} creationEvent={creationEvent} />
            </Canvas>
        </CanvasErrorBoundary>
    );
}

export default GenesisScene;
