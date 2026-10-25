"use client";

import { useExperience } from "@/components/experience/ExperienceContext";
import { SceneKey } from "@/components/animation/ranges";

const LABELS: Partial<Record<SceneKey, string[]>> = {
  INTRO: ["GANTRY HOUSING", "ROTATION SYSTEM", "PATIENT TABLE"],
  EXPLODE: ["OUTER SHELL", "SOURCE + DETECTOR", "MOTORIZED TABLE"],
  GANTRY: ["ROTATION AXIS", "SOURCE CARRIAGE", "DETECTOR CARRIAGE"],
  DETECTOR: ["25 CELLS", "SCINTILLATOR", "SIGNAL OUT"],
};

export function EngineeringOverlay() {
  const { activeScene } = useExperience();
  const labels = LABELS[activeScene] ?? [];
  const reconstructing = activeScene === "RECONSTRUCTION";

  return (
    <>
      <aside className="stage-caption" aria-hidden="true">
        <span>{reconstructing ? "CT—01 / RECONSTRUCTION" : "CT—01 / ENGINEERED ASSEMBLY"}</span>
        <span className="stage-caption-line" />
        <span>{reconstructing ? "AXIAL SLICE / SIMULATED" : "OUTLINE → MATERIAL"}</span>
      </aside>
      <aside className={`engineering-labels ${labels.length ? "active" : ""}`} aria-hidden="true">
        {labels.map((label, index) => (
          <div key={label} className={`engineering-label label-${index + 1}`}>
            <i />
            <span>{label}</span>
          </div>
        ))}
      </aside>
    </>
  );
}
