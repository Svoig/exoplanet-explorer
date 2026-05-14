import type { NasaPlanetRow, System, Planet, PlanetRecord, SystemRecord } from "../../types";

const calculateLightYears = (distance: number): number => distance * 3.26156;

export function normalizeHostName(host: string): string {
    return valueToSlug(host?.trim()) ?? "Unknown";
}

export function normalizeStar(row: NasaPlanetRow) {
    return {
        tempK: row.st_teff,
        radiusSolar: row.st_rad,
        massSolar: row.st_mass,
        luminosityLogSolar: row.st_lum,
        specType: row.st_spectype
    };
}

export function normalizeSystem(row: NasaPlanetRow, asRecord: boolean = false): System | SystemRecord {
    const hostName = normalizeHostName(row.hostname ?? '');
    const system: System = {
        entityType: "system",

        id: hostName,
        name: hostName,

        starCount: row.sy_snum,
        planetCount: row.sy_pnum,

        distancePc: row.sy_dist,
        distanceLy: row.sy_dist == null ? null : calculateLightYears(row.sy_dist),

        primaryStar: normalizeStar(row),
    };

    if (asRecord === true) {
        const systemRecord = system as Partial<SystemRecord>;
        systemRecord.pk = `SYSTEM#${hostName}`;
        systemRecord.sk = "PROFILE";

        systemRecord.gsi1pk = "SYSTEMS";
        systemRecord.gsi1sk = `SYSTEM#${hostName}`;

        systemRecord.source = {
            provider: "NASA Exoplanet Archive",
            table: "pscomppars",
            fetchedAt: new Date().toISOString(),
        }
    }

    return system;
}

export function normalizePlanet(row: NasaPlanetRow): PlanetRecord {
    const planetValue = row.pl_name?.trim();
    const planetName = valueToSlug(planetValue);

    const hostValue = row.hostname?.trim() ?? "Unknown";
    const hostName = valueToSlug(hostValue);

    return {
        pk: `PLANET#${planetName}`,
        sk: `PROFILE`,
        gsi1pk: `SYSTEM#${hostName}`,
        gsi1sk: `PLANET#${planetName}`,

        entityType: "planet",

        id: planetName,
        name: planetName,
        hostStarName: hostName,

        discovery: {
            year: row.disc_year,
            method: row.discoverymethod,
        },

        system: normalizeSystem(row),

        orbit: {
            periodDays: row.pl_orbper,
            semiMajorAxisAu: row.pl_orbsmax,
        },

        planet: {
            radiusEarth: row.pl_rade,
            massEarth: row.pl_bmasse,
            equilibriumTempK: row.pl_eqt
        },

        star: normalizeStar(row),

        formatted: formatPlanet(row),

        source: {
            provider: "NASA Exoplanet Archive",
            table: "pscomppars",
            fetchedAt: new Date().toISOString()
        }
    }
}

function formatPlanet(row: NasaPlanetRow) {
    return {
        radius: formatNumber(row.pl_rade, "Earth radii"),
        mass: formatNumber(row.pl_bmasse, "Earth masses"),
        temperature: formatNumber(row.pl_eqt, "K"),
        orbitalPeriod: formatNumber(row.pl_orbper, "days"),
        distance: row.sy_dist == null ? "Unknown" : `${calculateLightYears(row.sy_dist * 3.26156).toFixed(1)} light-years`
    }
}

function formatNumber(value: number | null, unit: string) {
    if (value == null || Number.isNaN(value)) return "Unknown";
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 2})} ${unit}`;
}

/**
 * 
 * @param value 
 * @returns Value with non-alphanumeric characters replaced with `-`
 * and leading/trailing `-` removed
 */
function valueToSlug(value: string) {
    return value.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "");
}
