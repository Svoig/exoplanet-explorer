import { useMemo } from "react";
import { Color, Depth, Displace, Fresnel, LayerMaterial, Noise } from "lamina";
import MurmurHash3 from "imurmurhash";
import type { PlanetMaterialRecipe } from "../../../types";
import { getPlanetTextures } from "../utils/getPlanetTextures";

export function PlanetSurfaceMaterial({
  seed,
  recipe,
}: {
  seed: string;
  recipe: PlanetMaterialRecipe;
}) {
  const numericSeed = MurmurHash3(seed).result;

  const { heightTexture, colorTexture } = useMemo(() =>
    getPlanetTextures(
      {
        numericSeed,
        noiseScale: recipe.surface.noiseScale,
        size: 512,
        colorPalette: recipe.palette,
      }, 
    ),
    [numericSeed, recipe],
  );

  const oldMaterial = (
    <LayerMaterial
      lighting="physical"
      roughness={recipe.surface.roughness}
      metalness={recipe.surface.metalness}
    >

      {/* Macro terrain */}
      {/* <Displace
                strength={recipe.surface.displacementStrength}
                scale={recipe.surface.noiseScale}
                type="simplex"
                mapping="local"
                offset={recipe.surface.noiseOffset}
            />

            <Color color={recipe.palette.deep} alpha={1} mode="normal" />

            <Depth 
                colorA={recipe.palette.mid}
                colorB={recipe.palette.high}
                alpha={recipe.surface.depthAlpha}
                mode="softlight"
                near={0.15}
                far={1.8}
                origin={[0.4, 0.8, 1.2]}
            /> */}

      {/* Macro terrain */}
      {/* <Noise
                colorA={recipe.palette.deep}
                colorB={recipe.palette.high}
                alpha={recipe.surface.noiseAlpha}
                scale={recipe.surface.noiseScale}
                mode={recipe.isGaseous ? "softlight" : "overlay"}
                offset={recipe.surface.noiseOffset}
            /> */}

      <Fresnel
        color={recipe.palette.atmosphere}
        alpha={recipe.planetClass === "icy" ? 0.8 : 0.7}
        mode="screen"
        power={recipe.atmosphere.fresnelPower}
        intensity={0.8}
      />
    </LayerMaterial>
  )
  return (
      <meshStandardMaterial
        // Main color texture
        map={colorTexture}
        displacementMap={heightTexture}
        displacementScale={recipe.surface.displacementStrength}
        roughness={recipe.surface.roughness}
        metalness={recipe.surface.metalness}
      />
  );
}
