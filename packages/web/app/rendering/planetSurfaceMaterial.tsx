import { useCallback } from "react";
import type { PlanetMaterialRecipe } from "../../../types";
import { CanvasTexture, Vector2 } from "three";
import type { WebGLProgramParametersWithUniforms } from "three";

export function PlanetSurfaceMaterial({
  recipe,
  displacementScale,
  surfaceHeightTexture,
  surfaceColorTexture,
  surfaceNormalTexture,
  surfaceRoughnessTexture,
  cloudHeightTexture
}: {
  recipe: PlanetMaterialRecipe;
  displacementScale: number;
  surfaceHeightTexture: CanvasTexture | undefined;
  surfaceColorTexture: CanvasTexture | undefined;
  surfaceNormalTexture: CanvasTexture | undefined;
  surfaceRoughnessTexture: CanvasTexture | undefined;
  cloudHeightTexture: CanvasTexture | undefined;
}) {
  const patchCloudShadows = useCallback((shader: WebGLProgramParametersWithUniforms) => {
    shader.uniforms.cloudShadowTexture = { value: cloudHeightTexture };
    shader.uniforms.uCloudShadowOffset = { value: new Vector2(0.00625, -0.0018) };
    shader.uniforms.uCloudShadowLow = { value: 0.12 };
    shader.uniforms.uCloudShadowHigh = { value: 0.62 };
    shader.uniforms.uCloudShadowStrength = { value: 0.45 };

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <common>",
      `
        #include <common>

        uniform sampler2D cloudShadowTexture;
        uniform vec2 uCloudShadowOffset;
        uniform float uCloudShadowLow;
        uniform float uCloudShadowHigh;
        uniform float uCloudShadowStrength;
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <map_fragment>",
      `
        #include <map_fragment>

        float cloudShadow = 0.0;

        #ifdef USE_MAP
          vec2 cloudShadowUv = fract(vMapUv + uCloudShadowOffset);
          float cloudMask = texture2D(cloudShadowTexture, cloudShadowUv).r;
          cloudShadow = smoothstep(uCloudShadowLow, uCloudShadowHigh, cloudMask) * uCloudShadowStrength;
        #endif
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <lights_fragment_end>",
      `
        #include <lights_fragment_end>

        reflectedLight.directDiffuse *= 1.0 - cloudShadow;
        reflectedLight.directSpecular *= 1.0 - cloudShadow;
      `
    );
  }, [cloudHeightTexture]);

  return (
      <meshStandardMaterial
        // Main color texture
        map={surfaceColorTexture}
        displacementMap={surfaceHeightTexture}
        displacementScale={displacementScale}
        normalMap={surfaceNormalTexture}
        normalScale={new Vector2(0.35, 0.35)}
        roughness={1}
        roughnessMap={surfaceRoughnessTexture}
        metalness={recipe.surface.metalness}
        onBeforeCompile={cloudHeightTexture ? patchCloudShadows : undefined}
        customProgramCacheKey={() => "planet-surface-cloud-shadows-v1"}
      />
  );
}
