import { Color, AdditiveBlending, BackSide } from "three";
import { Depth, Fresnel, LayerMaterial } from "lamina";
import type { PlanetMaterialRecipe } from "../../../types";
import { shaderMaterial } from "@react-three/drei";
import { extend } from '@react-three/fiber';

declare module "@react-three/fiber" {
    interface ThreeElements {
        planetAtmosphereMaterial: unknown;
    }
}

export const PlanetAtmosphereMaterial = shaderMaterial(
    {
        uColor: new Color("#a8c2ff"),
        uIntensity: 1.8,
        uPower: 3.0,
        uOpacity: 0.45,
        uSunDirection: [10, 3, 8]
    },
    // vertex shader
    `
        varying vec3 vNormal;
        varying vec3 vViewDir;

        void main() {
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);

            vNormal = normalize(mat3(modelMatrix) * normal);
            vViewDir = normalize(cameraPosition - worldPosition.xyz);

            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `,
    // fragment shader
    `
        uniform vec3 uColor;
        uniform float uIntensity;
        uniform float uPower;
        uniform float uOpacity;
        uniform vec3 uSunDirection;

        varying vec3 vNormal;
        varying vec3 vViewDir;

        void main() {
            vec3 normal = normalize(vNormal);
            vec3 viewDir = normalize(vViewDir);
            vec3 sunDir = normalize(uSunDirection);

            float viewDot = dot(normalize(vNormal), normalize(vViewDir));
            float fresnel = pow(1.0 - abs(viewDot), uPower);

            float sunFacing = dot(normal, sunDir);
            float dayAmount = smoothstep(-0.15, 0.7, sunFacing);
            float terminatorAmount = smoothstep(-0.45, 0.15, sunFacing);

            float atmosphereLight = max(dayAmount, terminatorAmount * 0.35);

            float alpha = fresnel * uOpacity * atmosphereLight;

            if (alpha < 0.0001) {
                discard;
            }

            gl_FragColor = vec4(uColor * fresnel * uIntensity * atmosphereLight, alpha);
            
            // Premultiplied alpha version for subtler glow
            // vec3 color = uColor * fresnel * uIntensity * atmosphereLight;
            // gl_FragColor = vec4(color * alpha, alpha);
        }
    `
);

extend({ PlanetAtmosphereMaterial });