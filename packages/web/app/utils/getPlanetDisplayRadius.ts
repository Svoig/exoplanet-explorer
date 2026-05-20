/**
 * Scale a planet's radius for display to ensure it fits on the screen.
 * Using a logarithmic scale to ensure tiny and huge planets all fit adequately
 * @param radiusEarth 
 */
export function getPlanetDisplayRadius(radiusEarth: number) {
    // Min and max observed are from queries to the exoplanet API
    const minObservedRadiusEarth = 0.31;
    // const maxObservedRadiusEarth = 87.21;
    const maxObservedRadiusEarth = 87.21;

    const minSceneRadius = 0.55;
    const maxSceneRadius = 2.4;

    // TODO: Move clamp function out of derivePlanetMaterialRecipe.ts into utils/index to share here
    const clamped = Math.min(maxObservedRadiusEarth, Math.max(minObservedRadiusEarth, radiusEarth));

    const t =
        (Math.log(clamped) - Math.log(minObservedRadiusEarth)) / 
        (Math.log(maxObservedRadiusEarth) - Math.log(minObservedRadiusEarth));

        return minSceneRadius + t * (maxSceneRadius - minSceneRadius);
}