import type { PlanetMaterialRecipe } from "../../../../types";
import styles from "./planetIcon.module.css";

export function PlanetIcon({ recipe }: { recipe: PlanetMaterialRecipe}) {
    return <div className={styles.planetIconContainer}>
        <div className={styles.planetIconPlanet}>
            <div className={styles.planetIconPlanetAtmosphere} style={{backgroundColor: recipe.palette.atmosphere}} />
            <div className={styles.planetIconPlanetSurface} style={{backgroundColor: recipe.palette.deep}} />
        </div>
        <p className={styles.planetIconComposition}>{recipe.planetClass}</p>
    </div>
}
