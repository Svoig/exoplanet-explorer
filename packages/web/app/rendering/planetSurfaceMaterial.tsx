import { Color, Depth, Fresnel, LayerMaterial, Noise } from "lamina";
import type { PlanetMaterialRecipe } from "../../../types";

export function PlanetSurfaceMaterial({recipe}: {recipe: PlanetMaterialRecipe}) {
    return (
        <LayerMaterial
            lighting="physical"
            roughness={recipe.surface.roughness}
            metalness={recipe.surface.metalness}
        >
            <Color color={recipe.palette.deep} alpha={1} mode="normal" />

            <Depth 
                colorA={recipe.palette.mid}
                colorB={recipe.palette.high}
                alpha={recipe.surface.depthAlpha}
                mode="softlight"
                near={0.15}
                far={1.8}
                origin={[0.4, 0.8, 1.2]}
            />

            <Noise
                colorA={recipe.palette.deep}
                colorB={recipe.palette.high}
                alpha={recipe.surface.noiseAlpha}
                scale={recipe.surface.noiseScale}
                mode={recipe.isGaseous ? "softlight" : "overlay"}
            />

            <Fresnel
                color={recipe.palette.fresnel}
                alpha={recipe.planetClass === "icy" ? 0.28 : 0.16}
                mode="screen"
                power={recipe.atmosphere.fresnelPower}
                intensity={0.8}
            />
        </LayerMaterial>
    )
}