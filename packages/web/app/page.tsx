import Link from "next/link";

export default function Home() {
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

      <section className="hero">
        <div>
          <p className="eyebrow">NASA Archive Visual Index</p>
          <h1>Survey distant worlds with instrument-grade clarity.</h1>
          <p className="hero-copy">
            Browse seeded exoplanet systems, inspect orbital and stellar data,
            and open procedural planet views generated from the catalogue.
          </p>
          <div className="button-row">
            <Link className="button-primary" href="/starSystems">
              Open catalogue
            </Link>
            <a
              className="button-secondary"
              href="https://exoplanetarchive.ipac.caltech.edu/"
              rel="noreferrer"
              target="_blank"
            >
              NASA archive
            </a>
          </div>

          <div className="data-grid" aria-label="Catalogue capabilities">
            <div className="stat-tile">
              <span className="stat-label">Mode</span>
              <span className="stat-value">Survey</span>
            </div>
            <div className="stat-tile">
              <span className="stat-label">Render</span>
              <span className="stat-value">Procedural</span>
            </div>
            <div className="stat-tile">
              <span className="stat-label">Source</span>
              <span className="stat-value">NASA</span>
            </div>
          </div>
        </div>

        <div className="orbital-display" aria-hidden="true">
          <div className="orbit-ring" />
          <div className="orbit-ring" />
          <div className="orbit-ring" />
          <div className="display-planet" />
          <div className="probe-panel panel">
            <span className="stat-label">Signal lock</span>
            <strong className="stat-value">Kepler-grade telemetry</strong>
            <p className="hero-copy" style={{ margin: "12px 0 0" }}>
              Star count, planetary mass, radius, temperature, and discovery
              metadata are ready for exploration.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
