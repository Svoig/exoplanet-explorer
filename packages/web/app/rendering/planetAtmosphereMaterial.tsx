import { BackSide } from "three";
import { Color, Fresnel, LayerMaterial } from "lamina";
import type { PlanetMaterialRecipe } from "../../../types";

export function PlanetAtmosphereMaterial({ recipe }:
    { recipe: PlanetMaterialRecipe}) {
        return (
            <LayerMaterial
                side={BackSide}
                transparent
                depthWrite={false}
                lighting="basic"
            >
                <Color color={recipe.palette.atmosphere} alpha={0.025} mode="normal" />

                <Fresnel
                    color={recipe.palette.fresnel}
                    alpha={recipe.atmosphere.opacity}
                    mode="screen"
                    power={recipe.atmosphere.fresnelPower}
                    intensity={1.35}
                />
            </LayerMaterial>
        );
    }