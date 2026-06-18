import { PlanetClass, PlanetMaterialPalette, PlanetMaterialPaletteRanges } from "../../../types";

// TODO: Differentiate fresnel between different planet classes

export const rockyRanges: PlanetMaterialPaletteRanges = {
    deep: {
        r: [28, 68],
        g: [24, 58],
        b: [20, 50]
    },
    mid: {
        r: [85, 155],
        g: [70, 130],
        b: [48, 92]
    },
    high: {
        r: [165, 230],
        g: [150, 210],
        b: [125, 185]
    },
    atmosphere: {
        r: [85, 155],
        g: [130, 205],
        b: [185, 245]
    },
    cloudDeep: {
        r: [110, 170],
        g: [120, 180],
        b: [130, 200]
    },
    cloudMid: {
        r: [170, 230],
        g: [180, 240],
        b: [190, 255]
    },
    cloudHigh: {
        r: [230, 255],
        g: [235, 255],
        b: [240, 255]
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
    r: [12, 45],
    g: [32, 78],
    b: [48, 112],
  },

  mid: {
    r: [58, 125],
    g: [95, 165],
    b: [105, 185],
  },

  high: {
    r: [135, 210],
    g: [165, 225],
    b: [170, 235],
  },

  atmosphere: {
    r: [95, 170],
    g: [145, 215],
    b: [180, 245],
  },

  cloudDeep: {
    r: [105, 150],
    g: [125, 170],
    b: [135, 185],
  },

  cloudMid: {
    r: [165, 215],
    g: [180, 225],
    b: [185, 235],
  },

  cloudHigh: {
    r: [220, 248],
    g: [225, 250],
    b: [225, 255],
  },

  fresnel: {
    r: [190, 235],
    g: [215, 250],
    b: [225, 255],
  },
};

export const icyRanges: PlanetMaterialPaletteRanges = {
    deep: {
        r: [20, 55],
        g: [35, 75],
        b: [60, 115]
    },
    mid: {
        r: [120, 180],
        g: [155, 210],
        b: [185, 235]
    },
    high: {
        r: [220, 255],
        g: [230, 255],
        b: [235, 255]
    },
    atmosphere: {
        r: [140, 205],
        g: [185, 235],
        b: [210, 255]
    },
    cloudDeep: {
        r: [135, 180],
        g: [155, 205],
        b: [175, 225]
    },
    cloudMid: {
        r: [190, 235],
        g: [205, 245],
        b: [215, 255]
    },
    cloudHigh: {
        r: [240, 255],
        g: [245, 255],
        b: [250, 255]
    },
    fresnel: {
        r: [200, 255],
        g: [200, 255],
        b: [200, 255]
    }
};

export const lavaRanges: PlanetMaterialPaletteRanges = {
    deep: {
        r: [18, 48],
        g: [12, 30],
        b: [10, 24]
    },
    mid: {
        r: [105, 185],
        g: [35, 85],
        b: [18, 45]
    },
    high: {
        r: [210, 255],
        g: [85, 175],
        b: [8, 45]
    },
    atmosphere: {
        r: [120, 205],
        g: [70, 140],
        b: [45, 95]
    },
    cloudDeep: {
        r: [58, 85],
        g: [52, 72],
        b: [48, 64]
    },
    cloudMid: {
        r: [115, 160],
        g: [88, 120],
        b: [70, 95]
    },
    cloudHigh: {
        r: [190, 240],
        g: [145, 195],
        b: [95, 135]
    },
    fresnel: {
        r: [210, 255],
        g: [170, 220],
        b: [130, 180]
    }

}

export const iceGiantRanges: PlanetMaterialPaletteRanges = {
    deep: {
        r: [20, 55],
        g: [55, 105],
        b: [95, 165]
    },
    mid: {
        r: [65, 135],
        g: [145, 205],
        b: [175, 235],
    },
    high: {
        r: [155, 215],
        g: [215, 245],
        b: [225, 255]
    },
    atmosphere: {
        r: [95, 165],
        g: [185, 235],
        b: [215, 255],
    },
    cloudDeep: {
        r: [95, 145],
        g: [145, 195],
        b: [180, 235]
    },
    cloudMid: {
        r: [150, 210],
        g: [195, 235],
        b: [215, 255]
    },
    cloudHigh: {
        r: [215, 250],
        g: [230, 255],
        b: [235, 255]
    },
    fresnel: {
        r: [200, 255],
        g: [200, 255],
        b: [200, 255]
    }
};

export const gasGiantRanges: PlanetMaterialPaletteRanges = {
    deep: {
        r: [70, 130],
        g: [45, 95],
        b: [35, 75]
    },
    mid: {
        r: [145, 210],
        g: [110, 175],
        b: [80, 130]
    },
    high: {
        r: [210, 250],
        g: [190, 230],
        b: [150, 205]
    },
    atmosphere: {
        r: [175, 235],
        g: [160, 215],
        b: [130, 185]
    },
    cloudDeep: {
        r: [115, 165],
        g: [90, 135],
        b: [70, 110]
    },
    cloudMid: {
        r: [175, 225],
        g: [145, 195],
        b: [110, 160]
    },
    cloudHigh: {
        r: [225, 255],
        g: [205, 240],
        b: [170, 220]
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
        "cloudDeep",
        "cloudMid",
        "cloudHigh",
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
