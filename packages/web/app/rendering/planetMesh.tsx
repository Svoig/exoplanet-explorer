"use client"

import { useEffect, useMemo } from "react";
import type { Planet } from "../../../types";
import { PlanetSurfaceMaterial } from "./planetSurfaceMaterial";
import { derivePlanetMaterialRecipe } from "../utils/derivePlanetMaterialRecipe";
import { getPlanetDisplayRadius } from "../utils/getPlanetDisplayRadius";
import { PlanetAtmosphereMaterial } from "./planetAtmosphereMaterial";

export function PlanetMesh({ planet }: 
    { planet: Planet }) {
        const recipe = useMemo(() => derivePlanetMaterialRecipe(planet), [planet]);
        const radius = planet?.planet?.radiusEarth ?? 0;

        const scaledRadius = getPlanetDisplayRadius(radius);


        useEffect(() => {
            console.log(radius);
            console.log(recipe);
        }, [radius, recipe]);

        return recipe && radius && (
            <group>
                <mesh>
                    <sphereGeometry args={[scaledRadius, 256, 256]} />
                    <PlanetSurfaceMaterial recipe={recipe} />
                </mesh>

                <mesh scale={recipe.atmosphere.scale}>
                    <sphereGeometry args={[scaledRadius, 128, 128]} />
                    <PlanetAtmosphereMaterial recipe={recipe} />
                </mesh>
            </group>
        );
    }