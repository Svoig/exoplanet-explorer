import { useMemo } from "react";
import { BackSide, NormalBlending } from "three";
import type { Planet } from "../../../types";
import { PlanetSurfaceMaterial } from "./planetSurfaceMaterial";
import { derivePlanetMaterialRecipe } from "../utils/derivePlanetMaterialRecipe";
import { getPlanetDisplayRadius } from "../utils/getPlanetDisplayRadius";
import "./planetAtmosphereMaterial";

export function PlanetMesh({ planet }: 
    { planet: Planet }) {
        const recipe = useMemo(() => derivePlanetMaterialRecipe(planet), [planet]);
        const radius = planet?.planet?.radiusEarth ?? 0;

        const scaledRadius = getPlanetDisplayRadius(radius);


        return recipe && radius && (
            <group>
                <mesh>
                    <sphereGeometry args={[scaledRadius, 256, 256]} />
                    <PlanetSurfaceMaterial seed={recipe.seed} recipe={recipe} />
                </mesh>

                <mesh scale={recipe.atmosphere.scale}>
                    <sphereGeometry args={[scaledRadius, 128, 128]} />
                    <planetAtmosphereMaterial
                        side={BackSide}
                        transparent
                        depthWrite={false}
                        depthTest={true}
                        blending={NormalBlending}
                        premultipliedAlpha={true}
                        uColor={recipe.palette.atmosphere}
                        uOpacity={recipe.atmosphere.opacity}
                        uPower={recipe.atmosphere.fresnelPower}
                        uIntensity={3.0}
                    />
                </mesh>
            </group>
        );
    }
