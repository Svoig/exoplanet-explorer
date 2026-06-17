import { createNoise3D, NoiseFunction3D } from "simplex-noise";
import { CanvasTexture, Color, MathUtils, RepeatWrapping } from "three";
import { NoiseFunction, FBMOptions, PlanetMaterialPalette } from "../../../types";
import seedrandom from "seedrandom";

interface PlanetTextureOptions {
    seed: string;
    noiseScale: number;
    size: number;
    colorPalette: PlanetMaterialPalette;
};

interface NoiseImageOptions {
    size: number;
    greyscaleImage: ImageData;
    colorImage: ImageData;
    colorPalette: PlanetMaterialPalette;
    isSurface?: boolean;
    noiseFunction: NoiseFunction3D;
    noiseScale: number;
    noiseOctaves: number,
    noisePersistence: number,
    noiseLacunarity: number,
    noiseRedistribution: number,
};

interface NoiseTextureOptions {
    size: number;
    greyscaleCanvas: HTMLCanvasElement;
    colorCanvas: HTMLCanvasElement;
    colorPalette: PlanetMaterialPalette;
    isSurface?: boolean;
    noiseFunction: NoiseFunction3D;
    noiseScale: number;
    noiseOctaves: number,
    noisePersistence: number,
    noiseLacunarity: number,
    noiseRedistribution: number,
}

interface NoiseTextures {
    greyscaleTexture: CanvasTexture;
    colorTexture: CanvasTexture;
}

export function getPlanetColor(noiseValue: number, colorPalette: PlanetMaterialPalette, isSurface = true): Color {
    let deep;
    let mid;
    let high;

    if (isSurface) {
      deep = new Color(colorPalette.deep);
      mid = new Color(colorPalette.mid);
      high = new Color(colorPalette.high);
    } else {
        deep = new Color(colorPalette.cloudDeep);
        mid = new Color(colorPalette.cloudMid);
        high = new Color(colorPalette.cloudHigh);
    }

    // Blend between colors based on actual height value

    if (noiseValue < 0.55) {
        return deep.clone().lerp(mid, noiseValue / 0.55);
    }

    return mid.clone().lerp(high, (noiseValue - 0.55) / 0.45);
}

export function fbm3(noise: NoiseFunction, x: number, y: number, z: number, options: FBMOptions): number {

    const { scale, octaves, persistence, lacunarity, redistribution } = options;

    let value = 0;
    let amplitude = 1;
    let frequency = scale;
    let maxAmplitude = 0;

    for (let octave = 0; octave < octaves; octave++) {
        value += noise(x * frequency, y * frequency, z * frequency) * amplitude;
        maxAmplitude += amplitude;

        amplitude *= persistence;
        frequency *= lacunarity;
    }

    const normalized = value / maxAmplitude; // roughly -1..1
    const positive = normalized * 0.5 + 0.5 // roughly 0..1

    return Math.pow(MathUtils.clamp(positive, 0, 1), redistribution);

}

/**
 * Mutates given image data to fill in greyscale noise and colorized noise
 */
export function applyNoise({
  size,
  noiseFunction,
  noiseScale,
  noiseOctaves,
  noisePersistence,
  noiseLacunarity,
  noiseRedistribution,
  greyscaleImage,
  colorImage,
  colorPalette,
  isSurface = true,
}: NoiseImageOptions): void {
  for (let y = 0; y < size; y++) {
    // Normalize Y coordinate into UV space (new `v` ranges from 0 to 1)
    const v = y / size;

    // Convert V coordinate into spherical latitude
    const theta = v * Math.PI;

    for (let x = 0; x < size; x++) {
      // Normalize X coordinate into UV space (new `u` ranges from 0 to 1)
      const u = x / size;

      // Convert U coordinate into spherical longitude
      const phi = u * Math.PI * 2;

      // Convert spherical coordinates into a 3D direction vector to avoid visible seams, UV distortion, stretching near poles
      const nx = Math.sin(theta) * Math.cos(phi);
      const ny = Math.cos(theta);
      const nz = Math.sin(theta) * Math.sin(phi);

      // Generate layered procedural noise ("fractal Brownian motion")
      // low frequency for continents
      // medium for terrain
      // high for detail
      // Weights determine how much influece each layer has
      const n = fbm3(noiseFunction, nx, ny, nz, {
        scale: noiseScale,
        octaves: noiseOctaves,
        persistence: noisePersistence,
        lacunarity: noiseLacunarity,
        redistribution: noiseRedistribution,
      });

      const clamped = MathUtils.clamp(n, 0, 1);

      // Calculate pixel index (based on current position in loop)
      const i = (y * size + x) * 4;

      // Convert normalized height into greyscale byte, 0 = black, 255 = white
      const grey = Math.floor(clamped * 255);

      /**
       * HEIGHT MAP
       */

      // Write greyscale height data to image. black = low, white = high
      greyscaleImage.data[i] = grey; // R
      greyscaleImage.data[i + 1] = grey; // G
      greyscaleImage.data[i + 2] = grey; // B
      greyscaleImage.data[i + 3] = 255; // A

      /**
       * COLOR MAP
       */

      // Use same noise that drives height map
      const color = getPlanetColor(n, colorPalette, isSurface);

      colorImage.data[i] = color.r * 255; // R
      colorImage.data[i + 1] = color.g * 255; // G
      colorImage.data[i + 2] = color.b * 255; // B
      colorImage.data[i + 3] = 255; // A
    }
  }
}

function createNoiseTexture({
  greyscaleCanvas,
  colorCanvas,
  size,
  noiseFunction,
  noiseScale,
  noiseOctaves,
  noiseLacunarity,
  noisePersistence,
  noiseRedistribution,
  colorPalette,
  isSurface = true,
}: NoiseTextureOptions): NoiseTextures {
  greyscaleCanvas.width = size;
  greyscaleCanvas.height = size;
  colorCanvas.width = size;
  colorCanvas.height = size;

  // ! because 2d is always supported and we haven't used a different context
  const surfaceHeightMapCTX = greyscaleCanvas.getContext("2d")!;
  const surfaceColorMapCTX = colorCanvas.getContext("2d")!;

  const surfaceHeightImage = surfaceHeightMapCTX.createImageData(size, size);
  const surfaceColorImage = surfaceColorMapCTX.createImageData(size, size);

  // Mutate passed image data
  applyNoise({
    size,
    greyscaleImage: surfaceHeightImage,
    colorImage: surfaceColorImage,
    colorPalette,
    isSurface,
    noiseFunction,
    noiseScale,
    noiseOctaves,
    noiseLacunarity,
    noisePersistence,
    noiseRedistribution
  });

  surfaceHeightMapCTX.putImageData(surfaceHeightImage, 0, 0);
  surfaceColorMapCTX.putImageData(surfaceColorImage, 0, 0);

  // Convert canvases into Three.js textures
  const greyscaleTexture = new CanvasTexture(greyscaleCanvas);
  const colorTexture = new CanvasTexture(colorCanvas);

  // Allow textures to wrap horizontally
  greyscaleTexture.wrapT = RepeatWrapping;
  greyscaleTexture.wrapS = RepeatWrapping;

  colorTexture.wrapT = RepeatWrapping;
  colorTexture.wrapS = RepeatWrapping;

  return {
    greyscaleTexture,
    colorTexture,
  };
}

export function getPlanetTextures({ seed, noiseScale,  size = 512, colorPalette }: PlanetTextureOptions) {
    const noiseFunction = createNoise3D(seedrandom(seed));

    /**
     * CREATE SURFACE TEXTURES
     */
    const surfaceHeightMapCanvas = document.createElement("canvas");
    const surfaceColorMapCanvas = document.createElement("canvas");

    const {
      greyscaleTexture: surfaceHeightTexture,
      colorTexture: surfaceColorTexture
    } = createNoiseTexture({
      greyscaleCanvas: surfaceHeightMapCanvas,
      colorCanvas: surfaceColorMapCanvas,
      size,
      colorPalette,
      noiseFunction,
      noiseScale,
      noiseOctaves: 4,
      noisePersistence: 0.5,
      noiseLacunarity: 4,
      noiseRedistribution: 1.5
    });

    /**
     * CREATE CLOUD IMAGES
     */
    const greyscaleCloudCanvas = document.createElement("canvas");
    const colorCloudCanvas = document.createElement("canvas");

    const {
        greyscaleTexture: cloudHeightTexture,
        colorTexture: cloudColorTexture
    } = createNoiseTexture({
        greyscaleCanvas: greyscaleCloudCanvas,
        colorCanvas: colorCloudCanvas,
        size,
        colorPalette,
        isSurface: false,
        noiseFunction,
        noiseScale: Math.max(noiseScale * 0.85, 0.9),
        noiseOctaves: 7,
        noisePersistence: 0.65,
        noiseLacunarity: 2.7,
        noiseRedistribution: 2.5
    })

    return { surfaceHeightTexture, surfaceColorTexture, cloudHeightTexture, cloudColorTexture };
}

