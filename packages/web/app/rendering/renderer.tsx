"use client"

import { Canvas } from '@react-three/fiber';
import { Planet } from '../../../types';
import { PlanetMesh } from './planetMesh';
import { CameraControls } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';

export function Renderer({ type, data }:
    { type: "planet" | "star", data: Planet }
) {
    return (
        <div style={{width: '100%', height: '500px'}}>
            <Canvas>
                <EffectComposer>
                    <Bloom />
                </EffectComposer>
                <CameraControls />
                <directionalLight position={[10, 3, 8]} intensity={12} />
                <PlanetMesh planet={data} />
            </Canvas>
        </div>
    );
}
