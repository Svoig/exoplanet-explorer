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
        uOpacity: 0.45
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

        varying vec3 vNormal;
        varying vec3 vViewDir;

        void main() {
            float viewDot = dot(normalize(vNormal), normalize(vViewDir));

            float fresnel = pow(1.0 - abs(viewDot), uPower);

            float alpha = fresnel * uOpacity;

            if (alpha < 0.01) {
                discard;
            }

            gl_FragColor = vec4(uColor * fresnel * uIntensity, alpha);
        }
    `
);

extend({ PlanetAtmosphereMaterial });