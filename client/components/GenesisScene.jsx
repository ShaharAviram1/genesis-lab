import { useRef } from "react";
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

function SceneContent({ onCoreClick, onActivityChange }) {
    const coreRef = useRef();
    const activityRef = useRef(0);
    const materialRef = useRef();
    const ringRef = useRef();
    const ring2Ref = useRef();
    const ring3Ref = useRef();
    const impulseRef = useRef(0);
    const pointLightRef = useRef();
    const assemblyRef = useRef();
    const kickRef = useRef(0);

    useFrame((state) => {
        const activity = activityRef.current;
        const impulse = impulseRef.current;
        const kick = kickRef.current;
        const time = state.clock.elapsedTime;
        const basePulse = Math.sin(time * 2) * 0.04;
        const scaleKick = impulse * 0.12;
        const finalScale = 1 + basePulse + scaleKick;

        if (pointLightRef.current) {
            pointLightRef.current.intensity = 1 + activity * 0.5 + impulse * 0.8;
        }
        if (coreRef.current) {
            coreRef.current.rotation.y += 0.02 + activity * 0.02;
            coreRef.current.rotation.x += 0.01 + activity * 0.01;
            coreRef.current.scale.set(finalScale, finalScale, finalScale);
        }
        if (materialRef.current) {
            materialRef.current.emissiveIntensity = 2 + activity * 0.5 + impulse * 0.8;
        }
        if (ringRef.current) {
            ringRef.current.rotation.y += 0.01 + activity * 0.02;
            ringRef.current.rotation.x += 0.005 + activity * 0.01;
        }
        if (ring2Ref.current) {
            ring2Ref.current.rotation.y += 0.01 + activity * 0.04;
            ring2Ref.current.rotation.x += 0.005 + activity * 0.02;}
        if(ring3Ref.current) {
            ring3Ref.current.rotation.y += 0.015 + activity * 0.03;
            ring3Ref.current.rotation.x += 0.01 + activity * 0.02;
        }
        if (assemblyRef.current) {
            assemblyRef.current.rotation.z = kick * 0.12;
            assemblyRef.current.rotation.x = kick * 0.04;
            assemblyRef.current.position.y = kick * 0.03;
        }

        onActivityChange(activity); // Notify parent of activity level changes

        activityRef.current *= 0.98; // Decay activity over time
        impulseRef.current *= 0.82; // Fast decay for click impact
        kickRef.current *= 0.72; // Decay kick effect over time
    });

    return (
        <>
            <ambientLight intensity={0.5} />
            <pointLight ref={pointLightRef} position={[10, 10, 10]} />
            <OrbitControls />
            <group ref={assemblyRef}>
                <mesh
                    ref={coreRef}
                    onClick={() => {
                        activityRef.current = Math.min(activityRef.current + 1, 12);
                        impulseRef.current = Math.min(impulseRef.current + 0.35, 1.2);
                        kickRef.current = Math.min(kickRef.current + 0.45, 1); // Trigger kick effect
                        onCoreClick && onCoreClick(); // Notify parent of the click event
                    }}
                >
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial ref={materialRef} emissive="orange" />
                    
                </mesh>
                <mesh>
                        <sphereGeometry args={[1.1, 32, 32]} />
                        <meshStandardMaterial
                            transparent
                            opacity={0.2}
                            color="orange"
                            emissive="orange"
                        />
                </mesh>
                <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[1.5, 0.1, 16, 100]} />
                        <meshStandardMaterial color="teal" emissive="teal" emissiveIntensity={1} />
                </mesh>
                <mesh ref={ring2Ref} rotation={[0, Math.PI / 4, 0]}>
                        <torusGeometry args={[1.7, 0.1, 16, 100]} />
                        <meshStandardMaterial color="violet" emissive="violet" emissiveIntensity={1} />
                </mesh>
                <mesh ref={ring3Ref} rotation={[0, 0, Math.PI / 8]}>
                        <torusGeometry args={[1.9, 0.1, 16, 100]} />
                        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
                </mesh>
            </group>
            
        </>
    );
}

function GenesisScene({onCoreClick, onActivityChange}) {
    return (
        <Canvas camera={{ position: [3, 3, 3] }}>
            <SceneContent onCoreClick={onCoreClick} onActivityChange={onActivityChange}/>
        </Canvas>
    );
}

export default GenesisScene;