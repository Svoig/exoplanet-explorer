type NullableNumber = number | null;
type DetectionFlag = 0 | 1;

export type ExoplanetDataRow = {
  pl_name: string;
  hostname: string;
  pl_letter: string;
  pl_rade: NullableNumber;
  pl_bmasse: NullableNumber;
  pl_dens: NullableNumber;
  pl_orbsmax: NullableNumber;
  pl_orbeccen: NullableNumber;
  pl_orbper: NullableNumber;
  pl_eqt: NullableNumber;
  st_teff: NullableNumber;
  st_rad: NullableNumber;
  st_lum: NullableNumber;
  pl_insol: NullableNumber;
  tran_flag: DetectionFlag;
  rv_flag: DetectionFlag;
  sy_pnum: number;
  disc_year: number;
};

export type NormalizedExoplanetData = {
  planet: {
    id: string;
    name: string;
    letter: string;
    radius_earths: NullableNumber;
    mass_earths: NullableNumber;
    density_g_cm3: NullableNumber;
    equilibrium_temperature_k: NullableNumber;
    insolation_earth_flux: NullableNumber;
  };
  orbit: {
    semi_major_axis_au: NullableNumber;
    eccentricity: NullableNumber;
    orbital_period_days: NullableNumber;
  };
  star: {
    name: string;
    temperature_k: NullableNumber;
    radius_solar: NullableNumber;
    luminosity_log_solar: NullableNumber;
  };
  system: {
    planet_letter: string;
    planet_count: number;
    discovery_year: number;
  };
  detection: {
    transit_detected: boolean;
    radial_velocity_detected: boolean;
  };
};

export function normalizePlanetId(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "");
}

export function normalizeExoplanetData(
  rows: ExoplanetDataRow[],
): NormalizedExoplanetData[] {
  return rows.map((r) => ({
    planet: {
      id: normalizePlanetId(r.pl_name),
      name: r.pl_name,
      letter: r.pl_letter,

      radius_earths: r.pl_rade,
      mass_earths: r.pl_bmasse,
      density_g_cm3: r.pl_dens,

      equilibrium_temperature_k: r.pl_eqt,
      insolation_earth_flux: r.pl_insol
    },

    orbit: {
      semi_major_axis_au: r.pl_orbsmax,
      eccentricity: r.pl_orbeccen,
      orbital_period_days: r.pl_orbper
    },

    star: {
      name: r.hostname,
      temperature_k: r.st_teff,
      radius_solar: r.st_rad,
      luminosity_log_solar: r.st_lum
    },

    system: {
      planet_letter: r.pl_letter,
      planet_count: r.sy_pnum,
      discovery_year: r.disc_year
    },

    detection: {
      transit_detected: r.tran_flag === 1,
      radial_velocity_detected: r.rv_flag === 1
    }
  }));
}
