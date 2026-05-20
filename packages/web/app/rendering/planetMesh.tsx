import { useEffect, useMemo } from "react";
import type { Planet } from "../../../types";
import { PlanetSurfaceMaterial } from "./planetSurfaceMaterial";
import { derivePlanetMaterialRecipe } from "../utils/derivePlanetMaterialRecipe";
import { getPlanetDisplayRadius } from "../utils/getPlanetDisplayRadius";
import { AdditiveBlending, BackSide } from "three";
// import { PlanetAtmosphereMaterial } from "./planetAtmosphereMaterial";
import "./planetAtmosphereMaterial";

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
                    <PlanetSurfaceMaterial seed={recipe.seed} recipe={recipe} />
                </mesh>

                <mesh scale={recipe.atmosphere.scale}>
                    <sphereGeometry args={[scaledRadius, 128, 128]} />
                    {/* <PlanetAtmosphereMaterial recipe={recipe} /> */}
                    <planetAtmosphereMaterial
                        side={BackSide}
                        transparent
                        depthWrite={false}
                        depthTest={true}
                        blending={AdditiveBlending}
                        uColor={recipe.palette.atmosphere}
                        uOpacity={recipe.atmosphere.opacity}
                        uPower={recipe.atmosphere.fresnelPower}
                        uIntensity={4.0}
                    />
                </mesh>
            </group>
        );
    }