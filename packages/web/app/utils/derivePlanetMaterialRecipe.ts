import seedrandom from "seedrandom";
import type {
    Planet,
    PlanetMaterialRecipe,
    PlanetMaterialPalette,
    PlanetClass
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

function getDisplacementStrengthByPlanetComposition(composition: PlanetClass): number {
    const displacementByClass = {
        rocky: 0.015,
        icy: 0.025,
        volatile: 0.012,
        lava: 0.035,
        "ice-giant": 0.003,
        "gas-giant": 0.0
    };

    return displacementByClass[composition] ?? 0;
}

export function derivePlanetMaterialRecipe(planet: Planet): PlanetMaterialRecipe | null {
    // Can't visualize planet without required fields
    if (!planet?.planet || !planet.planet.radiusEarth || !planet.planet.massEarth || !planet.planet.equilibriumTempK) {
        return null;
    }


    const radiusEarth = planet.planet.radiusEarth;

    const densityGCM3 = 5.51 * (
        planet.planet.massEarth / Math.pow(planet.planet.radiusEarth, 3)
    );

    const insolation = planet.planet.insolationEarth;
    const tempFromInsolation = insolation === null ? null : 278 * Math.pow(insolation, 0.25);
    
    const tempK = planet.planet.equilibriumTempK ?? tempFromInsolation;

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

    // Normalize orbital eccentricity (ovalness) and start proximity to 0 - 1 value
    const eccentricityNormalized = clamp((planet.orbit.eccentricity ?? 0) / 0.6, 0, 1);
    const starProximityNormalized = clamp(1 - ((planet.orbit.semiMajorAxisAu ?? 1) / 1.5), 0, 1);

    // TODO: Confirm all values using this are correct for ice giants, not just gas giants
    const isGaseous = ["gas-giant", "ice-giant"].indexOf(composition) > -1;

    const roughness = isGaseous ? clamp(lerp(0.95, 1.0, densityNormalized),  0, 1) : clamp(lerp(0.65, 0.95, densityNormalized), 0, 1);

    // Noise based on temp for gas and ice giants, density for rocky planets
    // const noiseScale = (0.9 * rng() * 0.2)
    //     * (isGaseous ? lerp(2, 5, tempNormalized) : lerp(3, 8, densityNormalized));
    const noiseScale = (isGaseous ? lerp(2, 5, tempNormalized) : lerp(0.5, 2, densityNormalized));

    // Offset to use for multiple material inputs, like displacement and color to make them feel related
    const noiseOffset: [number, number, number] = [
        rng() * 100,
        rng() * 100,
        rng() * 100,
    ];

    const atmosphereMassProxy = isGaseous
        ? clamp(radiusEarth / 8, 0.35, 1)
        : clamp(radiusEarth / Math.max(densityGCM3, 0.2) / Math.max(tempK / 300, 0.4), 0, 1);

    const atmosphericActivity = clamp(
        tempNormalized + eccentricityNormalized * 0.4 + starProximityNormalized * 0.25,
        0,
        1
    );

    const cloudCoverage = isGaseous
        ? clamp(0.55 + atmosphereMassProxy * 0.25 + eccentricityNormalized * 0.1, 0.45, 0.9)
        : clamp(0.32 + atmosphereMassProxy * 0.45 - tempNormalized * 0.25, 0.02, 0.65);

    const cloudOpacity = isGaseous
         ? lerp(0.10, 0.22, cloudCoverage)
         : lerp(0.18, 0.52, cloudCoverage);
        
    const cloudAlphaHigh = isGaseous
        ? lerp(0.62, 0.52, cloudCoverage)
        : lerp(0.76, 0.52, cloudCoverage);

    const cloudWarpAmount = isGaseous
        ? lerp(0.32, 0.62, atmosphericActivity)
        : lerp(0.16, 0.36, atmosphericActivity);
    
    const cloudBaseScale = isGaseous
        ? lerp(0.85, 1.55, atmosphericActivity)
        : lerp(1.1, 2.0, atmosphericActivity);
    
    const cloudDetailScale = isGaseous
        ? lerp(5.5, 10.0, atmosphericActivity)
        : lerp(4.5, 8.0, atmosphericActivity);
    
    const cloudErosionStrength = lerp(0.42, 0.18, cloudCoverage);
    
    const surfaceWarpAmount = isGaseous
        ? lerp(0.08, 0.28, starProximityNormalized + eccentricityNormalized * 0.5)
        : lerp(0.08, 0.22, densityNormalized);
    
    const ridgeStrength = isGaseous ? 0.05 : lerp(0.12, 0.35, densityNormalized);
    const detailStrength = isGaseous ? 0.08 : lerp(0.04, 0.12, densityNormalized);

    const continentScale = isGaseous
        ? lerp(0.9, 1.8, atmosphericActivity)
        : lerp(0.45, 1.15, 1 - densityNormalized);

    const mountainScale = isGaseous
        ? lerp(1.8, 3.8, atmosphericActivity)
        : lerp(1.8, 3.4, densityNormalized);

    const detailScale = isGaseous
        ? lerp(5.0, 9.0, atmosphericActivity)
        : lerp(6.0, 11.0, densityNormalized);

    // Used to communicate atmosphere thickness
    const atmosphereOpacity = isGaseous ? 0.45 : clamp(radiusEarth / densityGCM3 / (tempK / 300), 0.04, 0.22);

    const displacementStrength = getDisplacementStrengthByPlanetComposition(composition);

    // Affects contrast - makes gaseous planets more uniform, temperate rocky worlds moderate, lava worlds very dramatic
    const redistribution = isGaseous
        ? lerp(0.9, 1.2, atmosphericActivity)
        : clamp(
            lerp(1.35, 0.95, densityNormalized) + lerp(-0.05, 0.25, tempNormalized),
            0.85,
            1.65
        );

    return {
        derivationVersion: "v1",
        seed,
        planetClass: composition,
        isGaseous,
        palette: colorPalette,
        surface: {
            noiseScale,
            noiseOffset,
            warpAmount: surfaceWarpAmount,
            continentScale,
            mountainScale,
            detailScale,
            ridgeStrength,
            detailStrength,
            redistribution,
            displacementStrength,
            roughness: isGaseous ? 1.0 : roughness,
            metalness: isGaseous ? 0.0 : densityGCM3 > 7 ? 0.08 : 0,
        },
        clouds: {
            coverage: cloudCoverage,
            opacity: cloudOpacity,
            alphaLow: 0.10,
            alphaHigh: cloudAlphaHigh,
            warpAmount: cloudWarpAmount,
            baseScale: cloudBaseScale,
            detailScale: cloudDetailScale,
            erosionStrength: cloudErosionStrength
        },
        atmosphere: {
            fresnelPower: isGaseous ? 2.7 : 4.8,
            opacity: atmosphereOpacity,
            // AI said 1.1 for gaseous, but 1.02 looks better to me (see toi-1408-b)
            thickness: isGaseous ? 0.0125 : 0.0135,
            activity: atmosphericActivity,
        }
    };

}

