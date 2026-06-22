import { extend } from "@react-three/fiber";
import { Color, ShaderMaterial, Texture, UniformsLib, UniformsUtils  } from "three";

declare module "@react-three/fiber" {
    interface ThreeElements {
        planetCloudMaterial: unknown;
    }
}

class PlanetCloudMaterial extends ShaderMaterial {
    constructor() {
        super({
          lights: true,
          transparent: true,
          depthWrite: false,

          uniforms: UniformsUtils.merge([
            UniformsLib.lights,
            {
              cloudHeightTexture: { value: null },
              cloudColorTexture: { value: null },
              uOpacity: { value: 0.65 },
              uAlphaLow: { value: 0.12 },
              uAlphaHigh: { value: 0.72 },
              uCloudTint: { value: new Color("#ffffff") },
            },
          ]),

          vertexShader: `
            varying vec2 vUv;
            varying vec3 vNormalView;
            varying vec3 vViewPosition;

            void main() {
                vUv = uv;

                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                vNormalView = normalize(normalMatrix * normal);
                vViewPosition = -mvPosition.xyz;

                gl_Position = projectionMatrix * mvPosition;
            }
          `,

          fragmentShader: `
            #include <common>
            #include <lights_pars_begin>

            uniform sampler2D cloudHeightTexture;
            uniform sampler2D cloudColorTexture;
            uniform float uOpacity;
            uniform float uAlphaLow;
            uniform float uAlphaHigh;
            uniform vec3 uCloudTint;

            varying vec2 vUv;
            varying vec3 vNormalView;
            varying vec3 vViewPosition;

            void main() {
                float cloudMask = texture2D(cloudHeightTexture, vUv).r;
                vec3 cloudColor = texture2D(cloudColorTexture, vUv).rgb * uCloudTint;

                float alpha = smoothstep(uAlphaLow, uAlphaHigh, cloudMask) * uOpacity;

                if (alpha < 0.01) {
                    discard;
                }

                vec3 normal = normalize(vNormalView);
                vec3 totalLight = ambientLightColor;

                #if NUM_DIR_LIGHTS > 0
                    for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
                        vec3 lightDir = directionalLights[i].direction;
                        float ndotl = max(dot(normal, lightDir), 0.0);
                        totalLight += directionalLights[i].color * ndotl;
                    }
                #endif

                #if NUM_POINT_LIGHTS > 0
                    IncidentLight pointLight;

                    for (int i = 0; i < NUM_POINT_LIGHTS; i++) {
                        getPointLightInfo(pointLights[i], -vViewPosition, pointLight);

                        float ndotl = max(dot(normal, pointLight.direction), 0.0);
                        totalLight += pointLight.color * ndotl;
                    }
                #endif

                vec3 finalColor = cloudColor * totalLight;

                // Soft HDR compression, avoids harsh clipping
                finalColor = finalColor / (finalColor + vec3(1.0));

                gl_FragColor = vec4(finalColor, alpha);
            }
          `
        });
    }

    // Getters and setters allow React props to update uniforms in the shader
    get cloudHeightTexture(): Texture | null {
        return this.uniforms.cloudHeightTexture.value;
    }

    set cloudHeightTexture(value: Texture | null) {
        this.uniforms.cloudHeightTexture.value = value;
    }

    get cloudColorTexture(): Texture | null {
        return this.uniforms.cloudColorTexture.value;
    }

    set cloudColorTexture(value: Texture | null) {
        this.uniforms.cloudColorTexture.value = value;
    }

    get uOpacity(): number {
        return this.uniforms.uOpacity.value;
    }

    set uOpacity(value: number) {
        this.uniforms.uOpacity.value = value;
    }

    get uAlphaLow(): number {
        return this.uniforms.uAlphaLow.value;
    }

    set uAlphaLow(value: number) {
        this.uniforms.uAlphaLow.value = value;
    }

    get uAlphaHigh(): number {
        return this.uniforms.uAlphaHigh.value;
    }

    set uAlphaHigh(value: number) {
        this.uniforms.uAlphaHigh.value = value;
    }

    get uCloudTint(): Color {
        return this.uniforms.uCloudTint.value;
    }

    set uCloudTint(value: Color | string) {
        this.uniforms.uCloudTint.value = value instanceof Color ? value : new Color(value);
    }

}


extend({ PlanetCloudMaterial });
