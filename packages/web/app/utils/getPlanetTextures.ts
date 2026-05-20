// import { FBM } from "ts-noise";
import { createNoise3D } from "simplex-noise";
import { CanvasTexture, Color, MathUtils, RepeatWrapping } from "three";
import { PlanetMaterialPalette } from "../../../types";

interface PlanetTextureOptions {
    numericSeed: () => number;
    noiseScale: number;
    size: number;
    colorPalette: PlanetMaterialPalette
};

export function getPlanetColor(noiseValue: number, colorPalette: PlanetMaterialPalette): Color {
    const deep = new Color(colorPalette.deep);
    const mid = new Color(colorPalette.mid);
    const high = new Color(colorPalette.high);

    // Blend between colors based on actual height value

    if (noiseValue < 0.55) {
        return deep.clone().lerp(mid, noiseValue / 0.55);
    }

    return mid.clone().lerp(high, (noiseValue - 0.55) / 0.45);
}

export function getPlanetTextures({ numericSeed, noiseScale,  size = 512, colorPalette }: PlanetTextureOptions) {
    // const fbm = new FBM({
    //     seed: numericSeed,
    //     scale: noiseScale,
    //     persistance: 0.25,
    //     lacunarity: 0.25,
    //     octaves: 2,
    //     redistribution: 0.25
    // });

    const noise = createNoise3D(numericSeed);

    const heightMapCanvas = document.createElement("canvas");
    const colorMapCanvas = document.createElement("canvas");

    heightMapCanvas.width = size;
    heightMapCanvas.height = size;
    colorMapCanvas.width = size;
    colorMapCanvas.height = size;

    // ! because 2d is always supported and we haven't used a different context
    const heightMapCtx = heightMapCanvas.getContext("2d")!;
    const colorMapCtx = colorMapCanvas.getContext("2d")!;

    const heightImage = heightMapCtx.createImageData(size, size);
    const colorImage = colorMapCtx.createImageData(size, size);

    for (let y = 0; y < size; y++) {
        // Normalize Y coordinate into UV space (new `v` ranges from 0 to 1)
        const v = y / size;

        // Convert V coordinate into spherical latitude
        const theta = v * Math.PI;

        for (let x = 0; x < size; x++) {
            // Normalize X coordinate into UV space (new `u` ranges from 0 to 1)
            const u = x / size;

            // Convert U coordinate into spherical longitude
            const phi = u *  Math.PI * 2;

            // Convert spherical coordinates into a 3D direction vector to avoid visible seams, UV distortion, stretching near poles
            const nx = Math.sin(theta) * Math.cos(phi);
            const ny = Math.cos(theta);
            const nz = Math.sin(theta) * Math.sin(phi);

            // Generate layered procedural noise ("fractal Brownian motion")
            // low frequency for continents
            // medium for terrain
            // high for detail
            // Weights determine how much influece each layer has
            const n =
                0.55 * noise(nx * 2.0, ny * 2.0, nz * 2.0) +
                0.30 * noise(nx * 5.0, ny * 5.0, nz * 5.0) +
                0.15 * noise(nx * 14.0, ny * 14.0, nz * 14.0);

            // Convert from simplex-noise's -1 - 1 to 0 - 1
            const normalized = n * 0.5 + 0.5;

            const clamped = MathUtils.clamp(normalized, 0, 1);

            // Calculate pixel index (based on current position in loop)
            const i = (y * size + x) * 4;

            // Convert normalized height into greyscale byte, 0 = black, 255 = white
            const grey = Math.floor(clamped * 255);

            /**
             * HEIGHT MAP
             */

            // Write greyscale height data to image. black = low, white = high
            heightImage.data[i] = grey; // R
            heightImage.data[i + 1] = grey; // G
            heightImage.data[i + 2] = grey; // B
            heightImage.data[i + 3] = 255; // A

            /**
             * COLOR MAP
             */
            
            // Use same noise that drives height map
            const color = getPlanetColor(n, colorPalette);

            colorImage.data[i] = color.r * 255; // R
            colorImage.data[i + 1] = color.g * 255; // G
            colorImage.data[i + 2] = color.b * 255; // B
            colorImage.data[i + 3] = 255; // A
        }
    }

    heightMapCtx.putImageData(heightImage, 0, 0);
    colorMapCtx.putImageData(colorImage, 0, 0);

    // Convert canvases into Three.js textures
    const heightTexture = new CanvasTexture(heightMapCanvas);
    const colorTexture = new CanvasTexture(colorMapCanvas);

    // Allow textures to wrap horizontally
    heightTexture.wrapT = RepeatWrapping;
    heightTexture.wrapS = RepeatWrapping;

    colorTexture.wrapT = RepeatWrapping;
    colorTexture.wrapS = RepeatWrapping;

    return {heightTexture, colorTexture};
}