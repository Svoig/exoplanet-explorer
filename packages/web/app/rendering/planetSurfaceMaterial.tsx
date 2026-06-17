import type { PlanetMaterialRecipe } from "../../../types";
import { CanvasTexture } from "three";

export function PlanetSurfaceMaterial({
  recipe,
  surfaceHeightTexture,
  surfaceColorTexture
}: {
  recipe: PlanetMaterialRecipe;
  surfaceHeightTexture: CanvasTexture | undefined;
  surfaceColorTexture: CanvasTexture | undefined;
}) {
  return (
      <meshStandardMaterial
        // Main color texture
        map={surfaceColorTexture}
        displacementMap={surfaceHeightTexture}
        displacementScale={recipe.surface.displacementStrength}
        roughness={recipe.surface.roughness}
        metalness={recipe.surface.metalness}
      />
  );
}
