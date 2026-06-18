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
    normalCanvas: HTMLCanvasElement;
    roughnessCanvas: HTMLCanvasElement;
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
    normalTexture: CanvasTexture;
    roughnessTexture: CanvasTexture;
}

function getNormalImageFromHeight(heightImage: ImageData, size: number, strength = 14): ImageData {
    const normalImage = new ImageData(size, size);

    function heightAt(x: number, y: number): number {
      const wrappedX = (x + size) % size;
      const clampedY = MathUtils.clamp(y, 0, size - 1);
      return heightImage.data[(clampedY * size + wrappedX) * 4] / 255;
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const left = heightAt(x - 1, y);
        const right = heightAt(x + 1, y);
        const up = heightAt(x, y + 1);
        const down = heightAt(x, y - 1);

        const dx = (right - left) * strength;
        const dy = (up - down) * strength;

        const length = Math.sqrt(dx * dx + dy * dy + 1);
        const nx = -dx / length;
        const ny = -dy / length;
        const nz = 1 / length;

        const i = (y * size + x) * 4;
        normalImage.data[i] = (nx * 0.5 + 0.5) * 255;
        normalImage.data[i + 1] = (ny * 0.5 + 0.5) * 255;
        normalImage.data[i + 2] = (nz * 0.5 + 0.5) * 255;
        normalImage.data[i + 3] = 255;
      }
    }

    return normalImage;
}

function getRoughnessImageFromHeight(heightImage: ImageData, size: number): ImageData {
  const roughnessImage = new ImageData(size, size);

  function heightAt(x: number, y: number): number {
    const wrappedX = (x + size) % size;
    const clampedY = MathUtils.clamp(y, 0, size - 1);
    return heightImage.data[(clampedY * size + wrappedX) * 4] / 255;
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const height = heightAt(x, y);
      const slope =
        Math.abs(heightAt(x + 1, y) - heightAt(x - 1, y)) +
        Math.abs(heightAt(x, y + 1) - heightAt(x, y - 1));

      const roughness = MathUtils.clamp(0.38 + height * 0.24 + slope * 5.5, 0.32, 0.86);
      const value = Math.floor(roughness * 255);
      const i = (y * size + x) * 4;

      roughnessImage.data[i] = value;
      roughnessImage.data[i + 1] = value;
      roughnessImage.data[i + 2] = value;
      roughnessImage.data[i + 3] = 255;
    }
  }

  return roughnessImage;
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
  normalCanvas,
  roughnessCanvas,
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
  normalCanvas.width = size;
  normalCanvas.height = size;
  roughnessCanvas.width = size;
  roughnessCanvas.height = size;

  // ! because 2d is always supported and we haven't used a different context
  const surfaceHeightMapCTX = greyscaleCanvas.getContext("2d")!;
  const surfaceColorMapCTX = colorCanvas.getContext("2d")!;
  const surfaceNormalMapCTX = normalCanvas.getContext("2d")!;
  const surfaceRoughnessMapCTX = roughnessCanvas.getContext("2d")!;

  const surfaceHeightImage = surfaceHeightMapCTX.createImageData(size, size);
  const surfaceColorImage = surfaceColorMapCTX.createImageData(size, size);

  // Mutate passed image data to get height and color maps
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

  const normalImage = getNormalImageFromHeight(surfaceHeightImage, size);
  const roughnessImage = getRoughnessImageFromHeight(surfaceHeightImage, size);

  surfaceHeightMapCTX.putImageData(surfaceHeightImage, 0, 0);
  surfaceColorMapCTX.putImageData(surfaceColorImage, 0, 0);

  surfaceNormalMapCTX.putImageData(normalImage, 0, 0);
  surfaceRoughnessMapCTX.putImageData(roughnessImage, 0, 0);

  // Convert canvases into Three.js textures
  const greyscaleTexture = new CanvasTexture(greyscaleCanvas);
  const colorTexture = new CanvasTexture(colorCanvas);
  const normalTexture = new CanvasTexture(normalCanvas);
  const roughnessTexture = new CanvasTexture(roughnessCanvas);

  // Allow textures to wrap horizontally
  greyscaleTexture.wrapT = RepeatWrapping;
  greyscaleTexture.wrapS = RepeatWrapping;

  colorTexture.wrapT = RepeatWrapping;
  colorTexture.wrapS = RepeatWrapping;

  normalTexture.wrapT = RepeatWrapping;
  normalTexture.wrapS = RepeatWrapping;

  roughnessTexture.wrapT = RepeatWrapping;
  roughnessTexture.wrapS = RepeatWrapping;

  return {
    greyscaleTexture,
    colorTexture,
    normalTexture,
    roughnessTexture
  };
}

export function getPlanetTextures({ seed, noiseScale,  size = 512, colorPalette }: PlanetTextureOptions) {
    const noiseFunction = createNoise3D(seedrandom(seed));

    /**
     * CREATE SURFACE TEXTURES
     */
    const surfaceHeightMapCanvas = document.createElement("canvas");
    const surfaceColorMapCanvas = document.createElement("canvas");
    const surfaceNormalCanvas = document.createElement("canvas");
    const surfaceRoughnessCanvas = document.createElement("canvas");

    const {
      greyscaleTexture: surfaceHeightTexture,
      colorTexture: surfaceColorTexture,
      normalTexture: surfaceNormalTexture,
      roughnessTexture: surfaceRoughnessTexture
    } = createNoiseTexture({
      greyscaleCanvas: surfaceHeightMapCanvas,
      colorCanvas: surfaceColorMapCanvas,
      normalCanvas: surfaceNormalCanvas,
      roughnessCanvas: surfaceRoughnessCanvas,
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
    const normalCloudCanvas = document.createElement("canvas");
    const roughnessCloudCanvas = document.createElement("canvas");

    const {
        greyscaleTexture: cloudHeightTexture,
        colorTexture: cloudColorTexture,
        normalTexture: cloudNormalTexture,
        roughnessTexture: cloudRoughnessTexture,
    } = createNoiseTexture({
        greyscaleCanvas: greyscaleCloudCanvas,
        colorCanvas: colorCloudCanvas,
        normalCanvas: normalCloudCanvas,
        roughnessCanvas: roughnessCloudCanvas,
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

    return {
      surfaceHeightTexture,
      surfaceColorTexture,
      surfaceNormalTexture,
      surfaceRoughnessTexture,
      cloudHeightTexture,
      cloudColorTexture,
      cloudNormalTexture,
      cloudRoughnessTexture,
    };
}
