import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { useParams } from "react-router";
import type { Mesh } from "three";

import "./Planet.css";

function hashPlanetId(id: string): number {
    return id.split("").reduce((hash, character) => {
        return (hash * 31 + character.charCodeAt(0)) % 360;
    }, 0);
}

function PlanetBody({ planetId }: { planetId: string }) {
    const meshRef = useRef<Mesh>(null);
    const hue = useMemo(() => hashPlanetId(planetId), [planetId]);

    useFrame((_state, delta) => {
        if (!meshRef.current) {
            return;
        }

        meshRef.current.rotation.y += delta * 0.3;
        meshRef.current.rotation.x = Math.sin(meshRef.current.rotation.y) * 0.12;
    });

    return (
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[1.35, 64, 64]} />
                <meshStandardMaterial
                    color={`hsl(${hue}, 58%, 52%)`}
                    roughness={0.72}
                    metalness={0.08}
                />
            </mesh>
            <mesh rotation={[Math.PI / 2.6, 0, 0]}>
                <torusGeometry args={[1.85, 0.035, 16, 128]} />
                <meshStandardMaterial
                    color={`hsl(${(hue + 45) % 360}, 72%, 72%)`}
                    roughness={0.45}
                    metalness={0.25}
                />
            </mesh>
        </group>
    );
}

export const Planet = () => {
    const { planet: planetId } = useParams();
    const displayPlanetId = planetId ?? "unknown";

    return (
        <main className="planet-page">
            <section className="planet-visualization" aria-label={`3D visualization for ${displayPlanetId}`}>
                <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                    <color attach="background" args={["#05070d"]} />
                    <ambientLight intensity={0.38} />
                    <directionalLight position={[3, 2, 4]} intensity={2.4} />
                    <pointLight position={[-4, -3, 3]} intensity={0.8} color="#8ab4ff" />
                    <PlanetBody planetId={displayPlanetId} />
                </Canvas>
            </section>
            <section className="planet-details">
                <p>Planet ID</p>
                <h1>{displayPlanetId}</h1>
            </section>
        </main>
    );
};
