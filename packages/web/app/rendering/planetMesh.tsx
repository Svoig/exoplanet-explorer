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
  surfaceNormalTexture,
  surfaceRoughnessTexture,
  cloudHeightTexture,
  cloudColorTexture,
  sunDirection
}: {
  planet: Planet;
  recipe: PlanetMaterialRecipe | null;
  surfaceHeightTexture: CanvasTexture | undefined;
  surfaceColorTexture: CanvasTexture | undefined;
  surfaceNormalTexture: CanvasTexture | undefined;
  surfaceRoughnessTexture: CanvasTexture | undefined;
  cloudHeightTexture: CanvasTexture | undefined;
  cloudColorTexture: CanvasTexture | undefined;
  sunDirection: [number, number, number];
}) {
  const radius = planet?.planet?.radiusEarth ?? 0;

  const scaledRadius = getPlanetDisplayRadius(radius);

  // Ensure planet displacement and atmosphere scale together to avoid clipping
  const surfaceDisplacement = scaledRadius * (recipe?.surface.displacementStrength || 0);
  const maxSurfaceRadius = scaledRadius + surfaceDisplacement;
  const visualAtmosphereThickness = scaledRadius * (recipe?.atmosphere.thickness || 0);
  const atmosphereRadius = maxSurfaceRadius + visualAtmosphereThickness;

  const cloudClearance = scaledRadius * 0.01;
  const cloudRadius = maxSurfaceRadius + cloudClearance;

  return (
    recipe &&
    radius && (
      <group>
        <mesh>
          <sphereGeometry args={[scaledRadius, 256, 256]} />
          <PlanetSurfaceMaterial
            recipe={recipe}
            displacementScale={surfaceDisplacement}
            surfaceHeightTexture={surfaceHeightTexture}
            surfaceColorTexture={surfaceColorTexture}
            surfaceNormalTexture={surfaceNormalTexture}
            surfaceRoughnessTexture={surfaceRoughnessTexture}
            cloudHeightTexture={cloudHeightTexture}
          />
        </mesh>

        <mesh>
            <sphereGeometry args={[cloudRadius, 128, 128]} />
            <planetCloudMaterial
                cloudHeightTexture={cloudHeightTexture}
                cloudColorTexture={cloudColorTexture}
                uOpacity={recipe.clouds.opacity}
                uAlphaLow={recipe.clouds.alphaLow}
                uAlphaHigh={recipe.clouds.alphaHigh}
                uCloudTint={recipe.palette.cloudDeep}
                transparent
                depthWrite={false}
                depthTest
            />
        </mesh>
        <mesh>
          <sphereGeometry args={[atmosphereRadius, 128, 128]} />
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
            uSunDirection={sunDirection}
            cloudHeightTexture={cloudHeightTexture}
            cloudColorTexture={cloudColorTexture}
          />
        </mesh>
      </group>
    )
  );
}
