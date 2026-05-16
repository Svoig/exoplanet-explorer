import seedrandom from "seedrandom";
import type {
    Planet,
    PlanetMaterialRecipe,
    PlanetMaterialPalette
} from '../../../types';
import { getSeededColorPaletteByPlanetComposition } from './colorPalettes';

/**
 * Tracking the version in case I change the algorithm later.
 * Since seed is based on version + planet name, this will allow
 * showing the old version of a planet if the derivation changes.
 */
const MATERIAL_DERIVATION_VERSION = "v1";


function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
}

function createSeed(planet: Planet) {
    return `${MATERIAL_DERIVATION_VERSION}|${planet.name}`;
}

function classifyComposition(radiusEarth: number, tempK: number) {
    if (radiusEarth < 1.6) {
        // TODO: icyFactor and lavaFactor for transitional worlds
        if (tempK < 180) {
            return "icy";
        } else if (tempK > 850) {
            return "lava";
        } else {
            return "rocky";
        }
    };
    if (radiusEarth < 3.5) return "volatile";
    if (radiusEarth < 8) return "ice-giant";
    return "gas-giant";
}

export function derivePlanetMaterialRecipe(planet: Planet): PlanetMaterialRecipe | null {
    // Can't visualize planet without required fields
    if (!planet?.planet || !planet.planet.radiusEarth || !planet.planet.massEarth || !planet.planet.equilibriumTempK) {
        return null;
    }

    const radius = planet.planet.radiusEarth;
    // Density in g/cm^3. 5.51 is appx Earth's mass in g/cm^3.
    const densityGCM3 = 5.51 * (planet.planet.massEarth / Math.pow(planet.planet.radiusEarth, 3));
    const tempK = planet.planet.equilibriumTempK;

    const composition = classifyComposition(planet.planet.radiusEarth, planet.planet.equilibriumTempK);

    const seed = createSeed(planet);
    const rng = seedrandom(seed);

    const colorPalette: PlanetMaterialPalette = getSeededColorPaletteByPlanetComposition(rng, composition);

    /**
     * Temp and density normalized to a 0.0 - 1.0 range,
     * based on observed ranges in density and temperature of exoplanets.
     * Coldest = 0.0 - Hottest = 1.0
     * Least dense = 0.0 - Most dense = 1.0
     */
    const minTempK = 50;
    const maxTempK = 2500;
    const tempNormalized = clamp((tempK - minTempK) / (maxTempK - minTempK), 0, 1);

    // In g/cm^3
    const minDensity = 0.1;
    const maxDensity = 13;
    const densityNormalized = clamp((densityGCM3 - minDensity) / (maxDensity - minDensity), 0, 1);

    // TODO: Confirm all values using this are correct for ice giants, not just gas giants
    const isGaseous = ["gas-giant", "ice-giant"].indexOf(composition) > -1;

    const roughness = clamp(lerp(0.25, 0.95, densityNormalized),  0, 1);
    // Noise based on temp for gas and ice giants, density for rocky planets
    // const noiseScale = (0.9 * rng() * 0.2)
    //     * (isGaseous ? lerp(2, 5, tempNormalized) : lerp(3, 8, densityNormalized));
    const noiseScale = (isGaseous ? lerp(2, 5, tempNormalized) : lerp(3, 8, densityNormalized));

    // Used to communicate atmosphere thickness
    const atmosphereOpacity = isGaseous ? 0.45 : clamp(radius / densityGCM3 / (tempK / 300), 0.04, 0.22);

    return {
        derivationVersion: "v1",
        seed,
        planetClass: composition,
        isGaseous,
        palette: colorPalette,
        surface: {
            noiseScale,
            noiseAlpha: isGaseous ? 0.18 : 0.28,
            depthAlpha: 0.45,
            roughness,
            metalness: densityGCM3 > 7 ? 0.08 : 0
        },
        atmosphere: {
            fresnelPower: isGaseous ? 1.7 : 2.8,
            opacity: atmosphereOpacity,
            scale: isGaseous ? 1.05 : 1.03
        }
    };

}

