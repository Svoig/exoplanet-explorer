import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { Color } from "three";

declare module "@react-three/fiber" {
    interface ThreeElements {
        planetCloudMaterial: unknown;
    }
}

const PlanetCloudMaterial = shaderMaterial({
  cloudHeightTexture: null,
  cloudColorTexture: null,
  uOpacity: 0.65,
  uAlphaLow: 0.12,
  uAlphaHigh: 0.72,
  uLightColor: new Color("#ffffff")
},
// Vertex shader
`
    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`,
// Fragment shader
`
    uniform sampler2D cloudHeightTexture;
    uniform sampler2D cloudColorTexture;
    uniform float uOpacity;
    uniform float uAlphaLow;
    uniform float uAlphaHigh;
    uniform vec3 uLightColor;

    varying vec2 vUv;

    void main() {
        float cloudMask = texture2D(cloudHeightTexture, vUv).r;
        vec3 cloudColor = texture2D(cloudColorTexture, vUv).rgb;

        float alpha = smoothstep(uAlphaLow, uAlphaHigh, cloudMask) * uOpacity;

        if (alpha < 0.01) {
            discard;
        }

        gl_FragColor = vec4(cloudColor * uLightColor, alpha);
    }
`
);

extend({ PlanetCloudMaterial });
