import { PlanetClass, PlanetMaterialPalette, PlanetMaterialPaletteRange, PlanetMaterialPaletteRanges } from "../../../types";

// TODO: Differentiate fresnel between different planet classes

export const rockyRanges: PlanetMaterialPaletteRanges = {
    deep: {
        r: [25, 70],
        g: [20, 60],
        b: [15, 45]
    },
    mid: {
        r: [90, 160],
        g: [70, 140],
        b: [15, 45]
    },
    high: {
        r: [180, 240],
        g: [160, 220],
        b: [120, 190]
    },
    atmosphere: {
        r: [90, 170],
        g: [140, 220],
        b: [200, 255]
    },
    fresnel: {
        r: [200, 255],
        g: [200, 255],
        b: [200, 255]
    }
};

// Ranges from mini-Neptunes to ocean worlds to volatile-envelope planets
// TODO: Use one color range (deep?) for oceans, others for land?
const volatileRanges: PlanetMaterialPaletteRanges = {
  deep: {
    r: [20, 60],
    g: [40, 90],
    b: [60, 130],
  },

  mid: {
    r: [70, 150],
    g: [120, 200],
    b: [140, 220],
  },

  high: {
    r: [160, 230],
    g: [210, 255],
    b: [220, 255],
  },

  atmosphere: {
    r: [120, 210],
    g: [180, 255],
    b: [220, 255],
  },

  fresnel: {
    r: [220, 255],
    g: [235, 255],
    b: [240, 255],
  },
};

export const icyRanges: PlanetMaterialPaletteRanges = {
    deep: {
        r: [5, 35],
        g: [20, 60],
        b: [60, 120]
    },
    mid: {
        r: [80, 160],
        g: [140, 220],
        b: [200, 255]
    },
    high: {
        r: [220, 255],
        g: [235, 255],
        b: [240, 255]
    },
    atmosphere: {
        r: [150, 220],
        g: [220, 255],
        b: [240, 255]
    },
    fresnel: {
        r: [200, 255],
        g: [200, 255],
        b: [200, 255]
    }
};

export const lavaRanges: PlanetMaterialPaletteRanges = {
    deep: {
        r: [20, 50],
        g: [0, 20],
        b: [0, 15]
    },
    mid: {
        r: [120, 200],
        g: [20, 80],
        b: [0, 30]
    },
    high: {
        r: [255, 140],
        g: [120, 220],
        b: [0, 40]
    },
    atmosphere: {
        r: [255, 120],
        g: [60, 160],
        b: [20, 80]
    },
    fresnel: {
        r: [200, 255],
        g: [200, 255],
        b: [200, 255]
    }

}

export const iceGiantRanges: PlanetMaterialPaletteRanges = {
    deep: {
        r: [10, 40],
        g: [40, 90],
        b: [90, 170]
    },
    mid: {
        r: [40, 120],
        g: [120, 220],
        b: [180, 255],
    },
    high: {
        r: [140, 220],
        g: [220, 255],
        b: [240, 255]
    },
    atmosphere: {
        r: [80, 180],
        g: [220, 255],
        b: [240, 255],
    },
    fresnel: {
        r: [200, 255],
        g: [200, 255],
        b: [200, 255]
    }
};

export const gasGiantRanges: PlanetMaterialPaletteRanges = {
    deep: {
        r: [60, 120],
        g: [40, 90],
        b: [30, 70]
    },
    mid: {
        r: [160, 210],
        g: [120, 280],
        b: [80, 140]
    },
    high: {
        r: [220, 255],
        g: [200, 245],
        b: [160, 220]
    },
    atmosphere: {
        r: [180, 255],
        g: [170, 240],
        b: [140, 210]
    },
    fresnel: {
        r: [200, 255],
        g: [200, 255],
        b: [200, 255]
    }
};

/**
 * 
 * @param rng A seeded (deterministic) random number generator
 * @param [min, max] Minimum and maximum values in the range
 * @returns A seeded random number (deterministic)
 */
const getSeededValueFromRange = (rng: () => number, [min, max]: [number, number]) => Math.round(min + rng() * (max - min));

const getSeededPalette = (rng: () => number, paletteRanges: PlanetMaterialPaletteRanges) => {
    const rangeNames: Array<keyof PlanetMaterialPaletteRanges> = [
        "deep",
        "mid",
        "high",
        "atmosphere",
        "fresnel"
    ];

    const result: Partial<PlanetMaterialPalette> = {};

    rangeNames.forEach((rangeName: keyof PlanetMaterialPaletteRanges) => {
        const range = paletteRanges[rangeName];

        const r = getSeededValueFromRange(rng, range.r);
        const g = getSeededValueFromRange(rng, range.g);
        const b = getSeededValueFromRange(rng, range.b);

        result[rangeName] = `rgb(${r}, ${g}, ${b})`;
    });

    return result as PlanetMaterialPalette;
}

export const getSeededColorPaletteByPlanetComposition = (rng: () => number, composition: PlanetClass) => {
    let paletteRanges: PlanetMaterialPaletteRanges;

    switch (composition) {
        case "rocky":
            paletteRanges = rockyRanges;
            break;
        case "icy":
            paletteRanges = icyRanges;
            break;
        case "volatile":
            paletteRanges = volatileRanges;
            break;
        case "ice-giant":
            paletteRanges = iceGiantRanges;
            break;
        case "gas-giant":
            paletteRanges = gasGiantRanges;
            break;
        default:
            paletteRanges = rockyRanges;
        
    }

    return getSeededPalette(rng, paletteRanges);
};
