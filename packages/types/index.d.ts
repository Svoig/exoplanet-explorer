import type { Texture } from "three";

export type NasaPlanetRow = {
    pl_name: string;
    hostname: string | null;

    sy_snum: number | null;
    sy_pnum: number | null;
    sy_dist: number | null;

    disc_year: number | null;
    discoverymethod: string | null;

    pl_orbper: number | null;
    pl_orbsmax: number | null;
    pl_orbeccen: number | null;
    pl_orbincl: number | null;

    pl_rade: number | null;
    pl_bmasse: number | null;
    pl_dens: number | null;
    pl_eqt: number | null;
    pl_insol: number | null;

    pl_trandep: number | null;
    pl_trandur: number | null;
    pl_ratror: number | null;

    st_teff: number | null;
    st_rad: number | null;
    st_mass: number | null;
    st_lum: number | null;
    st_met: number | null;
    st_logg: number | null;
    st_age: number | null;
    st_spectype: string | null;

    rastr: string | null;
    decstr: string | null;

    sy_vmag: number | null;
    sy_kmag: number | null;
    sy_gaiamag: number | null;
}

export interface Star {
    tempK: number | null;
    radiusSolar: number | null;
    massSolar: number | null;
    luminosityLogSolar: number | null;
    specType: string | null;
}

export interface System {
    entityType: "system";

    id: string;
    name: string;

    starCount: number | null;
    planetCount: number | null;
    distancePc: number | null;
    distanceLy: number | null;
    primaryStar: Star;
}

export interface FormattedPlanet {
    radius: string;
    mass: string;
    temperature: string;
    orbitalPeriod: string;
    distance: string;
}

export interface Planet {
    entityType: "planet";

    id: string;
    name: string;
    hostStarName: string;

    discovery: {
        year: number | null;
        method: string | null;
    }

    system: System;

    orbit: {
        periodDays: number | null;
        semiMajorAxisAu: number | null;
    }

    planet: {
        radiusEarth: number | null;
        massEarth: number | null;
        equilibriumTempK: number | null;
    }

    star: {
        tempK: number | null;
        radiusSolar: number | null;
        massSolar: number | null;
        luminosityLogSolar: number | null;
        specType: string | null;
    }

    formatted: FormattedPlanet;

    // TODO: Should this only be on `PlanetRecord`?
    source: {
        provider: string;
        table: string;
        fetchedAt: string;
    }
}

export interface Record {
    pk: string;
    sk: string;
    gsi1pk?: string;
    gsi1sk?: string;
    source: {
        provider: string;
        table: string;
        fetchedAt: string;
    }
}

export type PlanetClass = 
    "rocky" |
    "volatile" |
    "icy" |
    "lava" |
    "ice-giant" |
    "gas-giant";

export interface PlanetMaterialPaletteRange {
    r: [number, number];
    g: [number, number];
    b: [number, number];
}

export interface PlanetMaterialPaletteRanges {
    deep: PlanetMaterialPaletteRange;
    mid: PlanetMaterialPaletteRange;
    high: PlanetMaterialPaletteRange;
    atmosphere: PlanetMaterialPaletteRange;
    fresnel: PlanetMaterialPaletteRange;
}

export interface PlanetMaterialPalette {
    deep: string;
    mid: string;
    high: string;
    atmosphere: string;
    fresnel: string;
}

export interface PlanetMaterialRecipe {
    derivationVersion: "v1";
    seed: string;
    planetClass: PlanetClass;
    isGaseous: boolean;
    palette: PlanetMaterialPalette;

    surface: {
        noiseScale: number;
        noiseOffset: [number, number, number];
        noiseAlpha: number;
        depthAlpha: number;
        displacementStrength: number;
        roughness: number;
        metalness: number;
    }

    atmosphere: {
        fresnelPower: number;
        opacity: number;
        scale: number;
    }
}

export type PlanetRecord = Planet & Record;
export type SystemRecord = System & Record;