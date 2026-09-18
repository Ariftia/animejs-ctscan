"use client";

import { SCENE_ORDER } from "@/components/animation/ranges";
import { useExperience } from "@/components/experience/ExperienceContext";

export function Navigation() {
  const { activeScene } = useExperience();
  const index = SCENE_ORDER.indexOf(activeScene);
  return (
    <header className="navigation">
      <a className="wordmark" href="#top" aria-label="Inside CT home">CT <span>/ INSIDE</span></a>
      <span className="nav-kicker">ANATOMY OF IMAGING</span>
      <div className="nav-status" aria-live="polite">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span className="nav-line" />
        <span>{String(SCENE_ORDER.length).padStart(2, "0")}</span>
      </div>
    </header>
  );
}
