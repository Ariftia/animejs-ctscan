"use client";

import { SCENE_ORDER } from "@/components/animation/ranges";
import { useExperience } from "@/components/experience/ExperienceContext";

export function ProgressRail() {
  const { activeScene } = useExperience();
  const activeIndex = SCENE_ORDER.indexOf(activeScene);
  return (
    <aside className="progress-rail" aria-label="Experience progress">
      <span className="progress-line" />
      {SCENE_ORDER.map((scene, index) => (
        <span key={scene} className={index === activeIndex ? "progress-dot active" : "progress-dot"} />
      ))}
    </aside>
  );
}
