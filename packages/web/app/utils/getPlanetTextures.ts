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
    warpNoiseFunction: NoiseFunction3D;
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
    warpNoiseFunction: NoiseFunction3D;
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

interface CloudNoiseOptions {
  size: number;
  greyscaleImage: ImageData;
  colorImage: ImageData;
  noiseFunction: NoiseFunction3D;
  warpNoiseFunction: NoiseFunction3D;
}

interface CloudNoiseTextureOptions {
  size: number;
  greyscaleCanvas: HTMLCanvasElement;
  colorCanvas: HTMLCanvasElement;
  normalCanvas: HTMLCanvasElement;
  roughnessCanvas: HTMLCanvasElement;
  noiseFunction: NoiseFunction3D;
  warpNoiseFunction: NoiseFunction3D;
}

function normalize3(x: number, y: number, z: number): [number, number, number] {
  const length = Math.sqrt(x * x + y * y + z * z) || 1;
  return [x / length, y / length, z / length];
}

function getNormalImageFromHeight(heightImage: ImageData, size: number, strength = 4): ImageData {
    const normalImage = new ImageData(size, size);
    const sampleRadius = 2;

    function heightAt(x: number, y: number): number {
      const wrappedX = (x + size) % size;
      const clampedY = MathUtils.clamp(y, 0, size - 1);
      return heightImage.data[(clampedY * size + wrappedX) * 4] / 255;
    }

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const left = heightAt(x - sampleRadius, y);
        const right = heightAt(x + sampleRadius, y);
        const up = heightAt(x, y + sampleRadius);
        const down = heightAt(x, y - sampleRadius);

        const dx = ((right - left) / sampleRadius) * strength;
        const dy = ((up - down) / sampleRadius) * strength;

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

      const roughness = MathUtils.clamp(0.78 + height * 0.12 + slope * 2.4, 0.72, 0.98);
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
  warpNoiseFunction,
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

      const warpAmount = 0.18;
      const warpNoiseOptions = {
        scale: 1.1,
        octaves: 3,
        persistence: 0.55,
        lacunarity: 2.0,
        redistribution: 1.0
      };

      const wx = fbm3(warpNoiseFunction, nx, ny, nz, warpNoiseOptions) - 0.5;
      const wy = fbm3(warpNoiseFunction, ny, nz, nx, warpNoiseOptions) - 0.5;
      const wz = fbm3(warpNoiseFunction, nz, nx, ny, warpNoiseOptions) - 0.5;

      // Warped noise to layer on more realistic details
      const [tx, ty, tz] = normalize3(
        nx + wx * warpAmount,
        ny + wy * warpAmount,
        nz + wz * warpAmount,
      );

      // Generate layered procedural noise ("fractal Brownian motion")
      // low frequency for continents
      // medium for terrain
      // high for detail
      // Weights determine how much influece each layer has
      const continent = fbm3(noiseFunction, nx, ny, nz, {
        scale: 0.75,
        octaves: 4,
        persistence: 0.55,
        lacunarity: 2.0,
        redistribution: 1.2
      });

      const mountain = fbm3(noiseFunction, tx + 13.7, ty - 4.2, tz + 8.9, {
        scale: 2.4,
        octaves: 5,
        persistence: 0.52,
        lacunarity: 2.25,
        redistribution: 1.0
      });

      // Ridged noise: high where noise is near center, gives mountain range shapes
      const ridges = Math.pow(1.0 - Math.abs(mountain * 2.8 - 1.0), 2.2);

      const detail = fbm3(noiseFunction, tx - 21.3, ty + 5.1, tz + 2.4, {
        scale: 8.0, octaves: 3,
        persistence: 0.45,
        lacunarity: 2.5,
        redistribution: 1.0
      });

      const terrain = continent * 0.72 +
        ridges * 0.22 +
        detail * 0.06;

      const height = MathUtils.clamp(terrain, 0, 1);

      // Calculate pixel index (based on current position in loop)
      const i = (y * size + x) * 4;

      // Convert normalized height into greyscale byte, 0 = black, 255 = white
      const grey = Math.floor(height * 255);

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

      // Extra noise layer for more realistic color
      const mineralNoise = fbm3(noiseFunction, nx + 40.0, ny - 12.0, nz + 6.0, {
        scale: 5.5,
        octaves: 4,
        persistence: 0.5,
        lacunarity: 2.2,
        redistribution: 1.0
      });

      // Use same noise that drives height map
      const colorValue = MathUtils.clamp(height * 0.75 + mineralNoise * 0.25, 0, 1);
      const color = getPlanetColor(colorValue, colorPalette, isSurface);

      colorImage.data[i] = color.r * 255; // R
      colorImage.data[i + 1] = color.g * 255; // G
      colorImage.data[i + 2] = color.b * 255; // B
      colorImage.data[i + 3] = 255; // A
    }
  }
}

function createSurfaceNoiseTexture({
  greyscaleCanvas,
  colorCanvas,
  normalCanvas,
  roughnessCanvas,
  size,
  noiseFunction,
  warpNoiseFunction,
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
    warpNoiseFunction,
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

function createCloudNoise({
  size,
  greyscaleImage,
  colorImage,
  noiseFunction,
  warpNoiseFunction,
}: CloudNoiseOptions): void {
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


      // Generate warped noise for more realistic clouds
      const warpAmount = 0.45;

      const wx = fbm3(warpNoiseFunction, nx, ny, nz, {
        scale: 1.4,
        octaves: 3,
        persistence: 0.58,
        lacunarity: 2.1,
        redistribution: 1.0,
      }) - 0.5;
      const wy = fbm3(warpNoiseFunction, ny, nz, nx, {
        scale: 1.4,
        octaves: 3,
        persistence: 0.58,
        lacunarity: 2.1,
        redistribution: 1.0,
      }) - 0.5;
      const wz = fbm3(warpNoiseFunction, nz, nx, ny, {
        scale: 1.4,
        octaves: 3,
        persistence: 0.58,
        lacunarity: 2.1,
        redistribution: 1.0,
      }) - 0.5;

      const [warpedX, warpedY, warpedZ] = normalize3(
        nx + wx * warpAmount,
        ny + wy * warpAmount,
        nz + wz * warpAmount,
      );

      const base = fbm3(noiseFunction, warpedX, warpedY, warpedZ, {
        scale: 1.25,
        octaves: 5,
        persistence: 0.58,
        lacunarity: 2.2,
        redistribution: 1.15,
      });

      const detail = fbm3(noiseFunction, warpedX + 9.7, warpedY - 3.1, warpedZ + 5.4, {
        scale: 8.0,
        octaves: 4,
        persistence: 0.5,
        lacunarity: 2.6,
        redistribution: 1.0,
      });

      const erode = fbm3(noiseFunction, warpedX + 17.1, warpedY + 4.6, warpedZ - 11.2, {
        scale: 18.0,
        octaves: 3,
        persistence: 0.48,
        lacunarity: 2.3,
        redistribution: 1.0,
      });

      const cloudValue = base * 0.9 + detail * 0.22 - erode * 0.32;
      const cloudMask = MathUtils.smoothstep(cloudValue, 0.46, 0.68);
      const clamped = MathUtils.clamp(cloudMask, 0, 1);

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

      const brightness = MathUtils.clamp(0.68 + detail * 0.22 + base * 0.12, 0.62, 1.0);

      colorImage.data[i] = brightness * 255; // R
      colorImage.data[i + 1] = brightness * 255; // G
      colorImage.data[i + 2] = brightness * 255; // B
      colorImage.data[i + 3] = 255; // A
    }
  }
}

function createCloudNoiseTexture({
  greyscaleCanvas,
  colorCanvas,
  normalCanvas,
  roughnessCanvas,
  size,
  noiseFunction,
  warpNoiseFunction,
}: CloudNoiseTextureOptions): NoiseTextures {
  greyscaleCanvas.width = size;
  greyscaleCanvas.height = size;
  colorCanvas.width = size;
  colorCanvas.height = size;
  normalCanvas.width = size;
  normalCanvas.height = size;
  roughnessCanvas.width = size;
  roughnessCanvas.height = size;

  const greyscaleCTX = greyscaleCanvas.getContext("2d")!;
  const colorCTX = colorCanvas.getContext("2d")!;
  const normalCTX = normalCanvas.getContext("2d")!;
  const roughnessCTX = roughnessCanvas.getContext("2d")!;

  const greyscaleImage = greyscaleCTX.createImageData(size, size);
  const colorImage = colorCTX.createImageData(size, size);

  createCloudNoise({
    size,
    greyscaleImage,
    colorImage,
    noiseFunction,
    warpNoiseFunction,
  });

  const normalImage = getNormalImageFromHeight(greyscaleImage, size, 2);
  const roughnessImage = getRoughnessImageFromHeight(greyscaleImage, size);

  greyscaleCTX.putImageData(greyscaleImage, 0, 0);
  colorCTX.putImageData(colorImage, 0, 0);
  normalCTX.putImageData(normalImage, 0, 0);
  roughnessCTX.putImageData(roughnessImage, 0, 0);

  const greyscaleTexture = new CanvasTexture(greyscaleCanvas);
  const colorTexture = new CanvasTexture(colorCanvas);
  const normalTexture = new CanvasTexture(normalCanvas);
  const roughnessTexture = new CanvasTexture(roughnessCanvas);

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
    roughnessTexture,
  };
}

export function getPlanetTextures({ seed, noiseScale,  size = 512, colorPalette }: PlanetTextureOptions) {
    const noiseFunction = createNoise3D(seedrandom(seed));
    const warpNoiseFunction = createNoise3D(seedrandom(seed + "-warp"));
    // Separate seed for clouds to separate from surface noise values
    const cloudNoiseFunction = createNoise3D(seedrandom(seed + "-clouds"));
    const cloudWarpNoiseFunction = createNoise3D(seedrandom(seed + "-cloud-warp"));

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
    } = createSurfaceNoiseTexture({
      greyscaleCanvas: surfaceHeightMapCanvas,
      colorCanvas: surfaceColorMapCanvas,
      normalCanvas: surfaceNormalCanvas,
      roughnessCanvas: surfaceRoughnessCanvas,
      size,
      colorPalette,
      noiseFunction,
      warpNoiseFunction,
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
    } = createCloudNoiseTexture({
        greyscaleCanvas: greyscaleCloudCanvas,
        colorCanvas: colorCloudCanvas,
        normalCanvas: normalCloudCanvas,
        roughnessCanvas: roughnessCloudCanvas,
        size,
        noiseFunction: cloudNoiseFunction,
        warpNoiseFunction: cloudWarpNoiseFunction,
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
