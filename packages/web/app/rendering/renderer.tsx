"use client"

import { Canvas } from '@react-three/fiber';
import { Planet } from '../../../types';
import { PlanetMesh } from './planetMesh';
import { CameraControls } from '@react-three/drei';

export function Renderer({ type, data }:
    { type: "planet" | "star", data: Planet }
) {
    return (
        <div style={{width: '100%', height: '500px'}}>
            <Canvas>
                <CameraControls />
                <directionalLight position={[3, 3, 5]} intensity={10} />
                <ambientLight />
                <PlanetMesh planet={data} />
            </Canvas>
        </div>
    );
}
