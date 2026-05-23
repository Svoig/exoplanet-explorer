import type { NasaPlanetRow } from "../../types";

const NASA_TAP_URL = "https://exoplanetarchive.ipac.caltech.edu/TAP/sync";

// NOTE: Copy/pasted into packages/web/server/db/systemCatalog.ts
// TODO: Move to a shared space
export const MINIMAL_DEV_SYSTEMS = [
  // Famous systems
  "TRAPPIST-1",
  "Proxima Cen",
  "Barnard's Star",
  "Kepler-186",
  "TOI-700",
  "K2-18",
  // Systems with at least one displayable gaseous planet
  "TOI-1408"
];


export const FAMOUS_SEED_SYSTEMS = [
  ...MINIMAL_DEV_SYSTEMS,
  "Kepler-452",
  "Kepler-22",
  "LHS 1140",
  "GJ 1214",
  "55 Cnc",
  "HD 209458",
  "HD 189733",
  "WASP-12",
  "HR 8799",
  "Beta Pic",
  "Tau Ceti",
  "Gliese 667 C",
  "GJ 357",
  "GJ 486",
] as const;

const PLANET_VISUALIZATION_COLUMNS = [
    "pl_name",
    "hostname",

    "sy_snum",
    "sy_pnum",
    "sy_dist",

    "disc_year",
    "discoverymethod",

    "pl_orbper",
    "pl_orbsmax",
    "pl_orbeccen",
    "pl_orbincl",

    "pl_rade",
    "pl_bmasse",
    "pl_dens",
    "pl_eqt",
    "pl_insol",

    "pl_trandep",
    "pl_trandur",
    "pl_ratror",

    "st_teff",
    "st_rad",
    "st_mass",
    "st_lum",
    "st_met",
    "st_logg",
    "st_age",
    "st_spectype",

    "rastr",
    "decstr",

    "sy_vmag",
    "sy_kmag",
    "sy_gaiamag",
];

const COLUMN_DELIMITER = ",\n     ";

/**
 * 
 * @returns A list of all Nasa exoplanet systems
 */
export async function fetchNasaExoplanets(): Promise<NasaPlanetRow[]> {
    return queryNasa<NasaPlanetRow>(`
        SELECT ${PLANET_VISUALIZATION_COLUMNS.join(COLUMN_DELIMITER)}    
        FROM pscomppars
        WHERE pl_name IS NOT NULL
    `);
}

/**
 * 
 * @returns A list of data for famous star systems
 */
export async function fetchFamousSeedExoplanets(): Promise<NasaPlanetRow[]> {
    const hostList = FAMOUS_SEED_SYSTEMS.map(formatSqlString).join(", ");

    return queryNasa<NasaPlanetRow>(`
        SELECT ${PLANET_VISUALIZATION_COLUMNS.join(COLUMN_DELIMITER)}
        FROM pscomppars
        WHERE hostname IN (${hostList})
        ORDER BY hostname, pl_orbsmax
    `);
}

export async function fetchDevSeedExoplanets(): Promise<NasaPlanetRow[]> {
    const hostList = MINIMAL_DEV_SYSTEMS.map(formatSqlString).join(", ");

    return queryNasa<NasaPlanetRow>(`
        SELECT ${PLANET_VISUALIZATION_COLUMNS.join(COLUMN_DELIMITER)}
        FROM pscomppars
        WHERE hostname IN (${hostList})
        ORDER BY hostname, pl_orbsmax
    `);

}

/**
 * Fetches famous systems plus `additionalSystemCount` nearby systems
 * @returns List of data for famous systems and additional nearby systems
 */
export async function fetchSeedExoplanets(options?: {
    additionalSystemCount?: number;
    candidatePlanetRowLimit?: number;
}): Promise<NasaPlanetRow[]> {
    const additionalSystemCount = options?.additionalSystemCount ?? 100;
    const candidatePlanetRowLimit = options?.candidatePlanetRowLimit ?? 800;

    const famousRows = await fetchFamousSeedExoplanets();

    const candidateRows = await queryNasa<NasaPlanetRow>(`
       SELECT TOP ${candidatePlanetRowLimit} ${PLANET_VISUALIZATION_COLUMNS.join(COLUMN_DELIMITER)}
       FROM pscomppars
       WHERE
        pl_name IS NOT NULL
        AND hostname IS NOT NULL
        AND sy_dist IS NOT NULL
        AND pl_rade IS NOT NULL
        AND (
            pl_eqt IS NOT NULL
            OR pl_insol IS NOT NULL
            OR pl_orbsmax IS NOT NULL
        )
        ORDER BY sy_dist ASC
    `);

    const famousHosts = new Set(
        famousRows.map(row => normalizeName(row.hostname ?? ''))
        .filter(row => !!row)
    );

    const selectedAdditionalHosts = new Set<string>();

    for (const candidateRow of candidateRows) {
        const host = normalizeName(candidateRow.hostname ?? '');
        if (!host || famousHosts.has(host)) continue;

        selectedAdditionalHosts.add(host);

        if (selectedAdditionalHosts.size >= additionalSystemCount) {
            break;
        }
    }

    const additionalRows = candidateRows.filter(additionalRow => {
        const host = normalizeName(additionalRow.hostname ?? '');
        return host && selectedAdditionalHosts.has(host);
    });

    return dedupePlanetRows([...famousRows, ...additionalRows]);
}

async function queryNasa<T>(query: string): Promise<T[]> {
    const url = new URL(NASA_TAP_URL);
    url.searchParams.set("query", formatAdqlQuery(query));
    url.searchParams.set("format", "json");

    const res = await fetch(url);
    
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`NASA TAP request failed: ${res.status} ${body}`);
    }

    // TODO: Validate response
    return res.json() as Promise<T[]>;
}

function formatSqlString(value: string) {
    // Escape apostrophes (single quote) by adding another single quote
    // Handles names like "Barnard's Star".
    return `'${value.replaceAll("'", "''")}'`;
}

function formatAdqlQuery(query: string) {
    return query.replace(/\s+/g, " ").trim();
}

function normalizeName(name: string): string | null {
    return name?.trim().toLowerCase() || null;
}

function dedupePlanetRows(rows: NasaPlanetRow[]): NasaPlanetRow[] {
    const seen = new Set<string>();
    const result: NasaPlanetRow[] = [];

    for (const row of rows) {
        const key = normalizeName(row.pl_name);
        if (!key || seen.has(key)) continue;

        seen.add(key);
        result.push(row);
    }

    return result;
}

