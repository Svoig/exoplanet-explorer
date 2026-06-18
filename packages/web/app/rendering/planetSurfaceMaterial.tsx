import type { PlanetMaterialRecipe } from "../../../types";
import { CanvasTexture, Vector2 } from "three";

export function PlanetSurfaceMaterial({
  recipe,
  displacementScale,
  surfaceHeightTexture,
  surfaceColorTexture,
  surfaceNormalTexture,
  surfaceRoughnessTexture,
}: {
  recipe: PlanetMaterialRecipe;
  displacementScale: number;
  surfaceHeightTexture: CanvasTexture | undefined;
  surfaceColorTexture: CanvasTexture | undefined;
  surfaceNormalTexture: CanvasTexture | undefined;
  surfaceRoughnessTexture: CanvasTexture | undefined;
}) {
  return (
      <meshStandardMaterial
        // Main color texture
        map={surfaceColorTexture}
        displacementMap={surfaceHeightTexture}
        displacementScale={displacementScale}
        normalMap={surfaceNormalTexture}
        normalScale={new Vector2(recipe.surface.displacementStrength, recipe.surface.displacementStrength)}
        roughness={recipe.surface.roughness}
        roughnessMap={surfaceRoughnessTexture}
        metalness={recipe.surface.metalness}
      />
  );
}
