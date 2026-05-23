import { useMemo } from "react";
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
