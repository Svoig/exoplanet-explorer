import { BackSide, NormalBlending } from "three";
import type { CanvasTexture } from "three";
import type { Planet, PlanetMaterialRecipe } from "../../../types";
import { PlanetSurfaceMaterial } from "./planetSurfaceMaterial";
import { getPlanetDisplayRadius } from "../utils/getPlanetDisplayRadius";
import "./planetCloudMaterial";
import "./planetAtmosphereMaterial";

export function PlanetMesh({
  planet,
  recipe,
  surfaceHeightTexture,
  surfaceColorTexture,
  cloudHeightTexture,
  cloudColorTexture,
}: {
  planet: Planet;
  recipe: PlanetMaterialRecipe | null;
  surfaceHeightTexture: CanvasTexture | undefined;
  surfaceColorTexture: CanvasTexture | undefined;
  cloudHeightTexture: CanvasTexture | undefined;
  cloudColorTexture: CanvasTexture | undefined;

}) {
  const radius = planet?.planet?.radiusEarth ?? 0;

  const scaledRadius = getPlanetDisplayRadius(radius);

  return (
    recipe &&
    radius && (
      <group>
        <mesh>
          <sphereGeometry args={[scaledRadius, 256, 256]} />
          <PlanetSurfaceMaterial
            recipe={recipe}
            surfaceHeightTexture={surfaceHeightTexture}
            surfaceColorTexture={surfaceColorTexture}
          />
        </mesh>

        <mesh scale={recipe.atmosphere.scale * 0.988}>
            <sphereGeometry args={[scaledRadius, 128, 128]} />
            <planetCloudMaterial
                cloudHeightTexture={cloudHeightTexture}
                cloudColorTexture={cloudColorTexture}
                uOpacity={0.65}
                uAlphaLow={0.12}
                uAlphaHigh={0.62}
                transparent
                depthWrite={false}
                depthTest
            />
        </mesh>
        <mesh scale={recipe.atmosphere.scale}>
          <sphereGeometry args={[scaledRadius, 128, 128]} />
          <planetAtmosphereMaterial
            side={BackSide}
            transparent
            depthWrite={false}
            depthTest={true}
            blending={NormalBlending}
            premultipliedAlpha={true}
            uColor={recipe.palette.atmosphere}
            uOpacity={recipe.atmosphere.opacity}
            uPower={recipe.atmosphere.fresnelPower}
            uIntensity={3.0}
            cloudHeightTexture={cloudHeightTexture}
            cloudColorTexture={cloudColorTexture}
          />
        </mesh>
      </group>
    )
  );
}
