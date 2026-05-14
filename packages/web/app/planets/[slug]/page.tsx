import { getPlanet } from "@/app/server/db/systemCatalog";

export default async function PlanetPage({ params }: { params: Promise<{slug: string}>}) {
    const { slug } = await params;
    const data = await getPlanet(slug);

    return (
        <div>
            <h1>{data?.name}</h1>
            <pre>{JSON.stringify(data)}</pre>
        </div>
    );
}