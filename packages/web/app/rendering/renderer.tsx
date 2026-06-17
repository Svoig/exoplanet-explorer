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

  const { surfaceHeightTexture, surfaceColorTexture, cloudHeightTexture, cloudColorTexture } = textures ?? {};


    return (
      <div style={{ width: "100%", height: "500px" }}>
        <Canvas>
          <EffectComposer>
            <Bloom />
          </EffectComposer>
          <CameraControls />
          <directionalLight position={[10, 3, 8]} intensity={12} />
          <PlanetMesh
            planet={data}
            recipe={recipe}
            surfaceHeightTexture={surfaceHeightTexture}
            surfaceColorTexture={surfaceColorTexture}
            cloudHeightTexture={cloudHeightTexture}
            cloudColorTexture={cloudColorTexture}
          />
        </Canvas>
      </div>
    );
}
