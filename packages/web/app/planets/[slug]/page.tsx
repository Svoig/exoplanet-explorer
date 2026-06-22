import Link from "next/link";
import { notFound } from "next/navigation";
import type { Planet } from "../../../../types";
import { getPlanet } from "@/app/server/db/systemCatalog";
import { derivePlanetMaterialRecipe } from "@/app/utils/derivePlanetMaterialRecipe";
import VisualStage from "@/app/rendering/visualStage";

export default async function PlanetPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = (await getPlanet(slug)) as Planet | null;

  if (!data) {
    notFound();
  }

  const materialRecipe = derivePlanetMaterialRecipe(data);

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

      <section className="planet-layout">
        <div>
          <header className="planet-title">
            <p className="eyebrow">Planet profile</p>
            <h1>{formatName(data.name)}</h1>
            <div className="planet-meta" style={{ marginTop: 14 }}>
              <span>{formatName(data.hostStarName)} system</span>
              <span>{data.discovery.method ?? "Discovery method unknown"}</span>
              <span>{data.discovery.year ?? "Year unknown"}</span>
            </div>
          </header>

          <div className="panel">
            <span className="stat-label">Measured parameters</span>
            <div className="detail-list">
              <DetailRow label="Radius" value={data.formatted.radius} />
              <DetailRow label="Mass" value={data.formatted.mass} />
              <DetailRow label="Temperature" value={data.formatted.temperature} />
              <DetailRow label="Orbital period" value={data.formatted.orbitalPeriod} />
              <DetailRow label="System distance" value={data.formatted.distance} />
              <DetailRow
                label="Semi-major axis"
                value={formatNumber(data.orbit.semiMajorAxisAu, "AU")}
              />
              <DetailRow
                label="Host temp"
                value={formatNumber(data.star.tempK, "K")}
              />
              <DetailRow
                label="Host type"
                value={data.star.specType ?? "Unknown"}
              />
            </div>
          </div>
        </div>

        <VisualStage materialRecipe={materialRecipe} data={data} />
      </section>
    </main>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatName(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatNumber(value: number | null, unit: string) {
  if (value == null || Number.isNaN(value)) return "Unknown";
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${unit}`;
}
