import Link from "next/link";
import type { PlanetRecord, SystemRecord } from "../../../types";
import {
  listPlanetsInSystem,
  listSeedSystems,
} from "../server/db/systemCatalog";

export default async function StarSystemsPage() {
  const systems = (await listSeedSystems()) as SystemRecord[];
  const systemsWithPlanets = await Promise.all(
    systems.map(async (system) => ({
      system,
      planets: (await listPlanetsInSystem(system.id)) as PlanetRecord[],
    })),
  );

  return (
    <main className="app-shell">
      <nav className="top-nav" aria-label="Main navigation">
        <Link href="/" className="brand-lockup">
          <span className="brand-mark" aria-hidden="true" />
          Exoplanet Explorer
        </Link>
        <div className="nav-links">
          <Link href="/starSystems">Star systems</Link>
        </div>
      </nav>

      <header className="page-heading">
        <div>
          <p className="eyebrow">Observable systems</p>
          <h1>Star Systems</h1>
        </div>
        <p>
          A compact survey board for famous and interesting stars and their known planets.
          Open a planet to inspect its measured parameters and generated visual
          model.
        </p>
      </header>

      {systemsWithPlanets.length === 0 ? (
        <div className="empty-state">No system data available.</div>
      ) : (
        <section className="system-grid" aria-label="Star system catalogue">
          {systemsWithPlanets.map(({ system, planets }) => (
            <article className="system-card" key={system.id}>
              <div>
                <span className="stat-label">Host star</span>
                <h2>{formatName(system.name)}</h2>
              </div>

              <div className="system-meta">
                <span>{formatCount(system.starCount, "star")}</span>
                <span>{formatCount(system.planetCount, "planet")}</span>
                <span>{formatDistance(system.distanceLy)}</span>
              </div>

              <div className="system-facts">
                <div className="system-fact">
                  <span className="stat-label">Temp</span>
                  <strong>
                    {formatNumber(system.primaryStar?.tempK, "K")}
                  </strong>
                </div>
                <div className="system-fact">
                  <span className="stat-label">Mass</span>
                  <strong>
                    {formatNumber(system.primaryStar?.massSolar, "M☉")}
                  </strong>
                </div>
                <div className="system-fact">
                  <span className="stat-label">Radius</span>
                  <strong>
                    {formatNumber(system.primaryStar?.radiusSolar, "R☉")}
                  </strong>
                </div>
              </div>

              <div className="planet-links" aria-label={`${system.name} planets`}>
                {planets.length === 0 ? (
                  <p className="planet-meta">No planet records available.</p>
                ) : (
                  planets.map((planet) => (
                    <Link
                      className="planet-link"
                      href={`/planets/${planet.id}`}
                      key={planet.id}
                    >
                      <span>{formatName(planet.name)}</span>
                      <span className="planet-meta">
                        {formatNumber(planet.planet.radiusEarth, "R⊕")}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

function formatName(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCount(value: number | null, label: string) {
  if (value == null) return `Unknown ${label}s`;
  return `${value} ${label}${value === 1 ? "" : "s"}`;
}

function formatDistance(value: number | null) {
  if (value == null) return "Distance unknown";
  return `${value.toFixed(1)} ly`;
}

function formatNumber(value: number | null | undefined, unit: string) {
  if (value == null || Number.isNaN(value)) return "Unknown";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
}
