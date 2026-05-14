import { listStarSystems } from "../server/db/systemCatalog";

export default async function PlanetsList() {
  const starSystems = await listStarSystems();

  console.log(starSystems);

  return (
    <div>
        <h1>Star Systems</h1>
        <pre>{JSON.stringify(starSystems)}</pre>
    </div>
  );
}
