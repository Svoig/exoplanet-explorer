import type { Planet } from "../../../../types";
import { getPlanet } from "@/app/server/db/systemCatalog";
import { Renderer } from "@/app/rendering/renderer"; 
import { derivePlanetMaterialRecipe } from "@/app/utils/derivePlanetMaterialRecipe";
import { PlanetIcon } from "@/app/rendering/planetIcon/component";

export default async function PlanetPage({ params }: { params: Promise<{slug: string}>}) {
    const { slug } = await params;
    const data = await getPlanet(slug);
    const materialRecipe = derivePlanetMaterialRecipe(data as Planet);

    return (
        <div>
            <h1>{data?.name}</h1>
            <PlanetIcon recipe={materialRecipe!} />
            <Renderer type="planet" data={data as Planet} />
        </div>
    );
}