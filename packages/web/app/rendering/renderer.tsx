"use client"

import { useMemo } from "react";
import { Canvas } from '@react-three/fiber';
import { Planet, PlanetMaterialRecipe } from '../../../types';
import { PlanetMesh } from './planetMesh';
import { CameraControls } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { getPlanetTextures } from "../utils/getPlanetTextures";
import { derivePlanetMaterialRecipe } from "../utils/derivePlanetMaterialRecipe";

export function Renderer({ data }:
    { type: "planet" | "star", data: Planet }
) {

  const recipe = useMemo<PlanetMaterialRecipe | null>(() => derivePlanetMaterialRecipe(data), [data]);

  const textures = useMemo(() =>
    recipe ? getPlanetTextures(
      {
        seed: recipe.seed,
        noiseScale: recipe?.surface.noiseScale ?? 0,
        size: 512,
        colorPalette: recipe?.palette,
      }, 
    ) : null,
    [recipe],
  );

  const {
    surfaceHeightTexture,
    surfaceColorTexture,
    surfaceNormalTexture,
    surfaceRoughnessTexture,
    cloudHeightTexture,
    cloudColorTexture,
  } = textures ?? {};


    return (
      <div style={{ width: "100%", height: "500px" }}>
        <Canvas shadows="soft">
          <EffectComposer>
            <Bloom intensity={1.0} luminanceThreshold={1.1} luminanceSmoothing={0.25} />
          </EffectComposer>
          <CameraControls />
          <directionalLight position={[10, 3, 8]} intensity={6} castShadow />
          <hemisphereLight args={["#9fb8ff", "#02030a", 0.08]} />
          <PlanetMesh
            planet={data}
            recipe={recipe}
            surfaceHeightTexture={surfaceHeightTexture}
            surfaceColorTexture={surfaceColorTexture}
            surfaceNormalTexture={surfaceNormalTexture}
            surfaceRoughnessTexture={surfaceRoughnessTexture}
            cloudHeightTexture={cloudHeightTexture}
            cloudColorTexture={cloudColorTexture}
            sunDirection={[10, 3, 8]}
          />
        </Canvas>
      </div>
    );
}
