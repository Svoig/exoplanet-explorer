"use client"
import { useState } from "react";
import type { Planet, PlanetMaterialRecipe } from "../../../types";
import { RenderDetailLevels } from "../types";
import { PlanetIcon } from "@/app/rendering/planetIcon/component";
import { Renderer } from "@/app/rendering/renderer";
import Radio from "../uiComponents/radio/component";

export default function VisualStage({ materialRecipe, data }: {materialRecipe: PlanetMaterialRecipe | null, data: Planet}) {
  const [detailLevel, setDetailLevel] = useState<RenderDetailLevels>(RenderDetailLevels.low);

  const handleDetailLevelChange = (value: RenderDetailLevels) => {
    if (!value) {
        return;
    }

    if (Object.values(RenderDetailLevels).includes(value as RenderDetailLevels)) {
        setDetailLevel(value as RenderDetailLevels);
    }
  };

    return (
        <div className="panel visual-stage">
            <fieldset id="detail-level" name="detail-level" className="radio-group">
                <legend>Detail Level *</legend>

                <Radio id="low" name="low" value={RenderDetailLevels.low} label="Low" checked={detailLevel === RenderDetailLevels.low} onChange={handleDetailLevelChange} />
                <Radio id="medium" name="medium" value={RenderDetailLevels.medium} label="Medium" checked={detailLevel === RenderDetailLevels.medium} onChange={handleDetailLevelChange} />
                <Radio id="high" name="high" value={RenderDetailLevels.high} label="High" checked={detailLevel === RenderDetailLevels.high} onChange={handleDetailLevelChange} />
                <Radio id="veryHigh" name="veryHigh" value={RenderDetailLevels.veryHigh} label="Very High" checked={detailLevel === RenderDetailLevels.veryHigh} onChange={handleDetailLevelChange} />
            </fieldset>
        
           <aside className="performance-warning">* Note: Increasing detail level may take several seconds and may degrade performance.</aside>

          {materialRecipe ? (
            <>
              <div className="planet-meta" style={{ justifyContent: "space-between" }}>
                <span>Class: {materialRecipe.planetClass}</span>
                <span>{materialRecipe.isGaseous ? "Gaseous" : "Terrestrial"}</span>
              </div>
              <Renderer type="planet" data={data} detailLevel={detailLevel} />
              <PlanetIcon recipe={materialRecipe} />
            </>
          ) : (
            <div className="empty-state">
              This planet is missing the radius, mass, or temperature data
              needed for a generated visual model.
            </div>
          )}
        </div>
    );
}