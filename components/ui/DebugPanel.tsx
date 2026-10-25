"use client";

import { useExperience } from "@/components/experience/ExperienceContext";
import { useEffect, useState } from "react";

export function DebugPanel() {
  const { activeScene, motion, selected } = useExperience();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(new URLSearchParams(window.location.search).get("debug") === "1");
  }, []);
  if (process.env.NODE_ENV === "production") return null;

  return (
    <aside className="debug-panel" hidden={!visible}>
      <div><span>PROGRESS</span><output data-progress-readout>0.000</output></div>
      <div><span>SCENE</span><output>{activeScene}</output></div>
      <div><span>CAMERA P/R</span><output data-camera>{motion.current.cameraX.toFixed(1)} / {motion.current.cameraZ.toFixed(1)}</output></div>
      <div><span>FPS</span><output data-fps>—</output></div>
      <div><span>SELECTED</span><output>{selected ?? "NONE"}</output></div>
      <input
        data-progress-scrubber
        aria-label="Experience progress"
        type="range"
        min="0"
        max="1"
        step="0.001"
        defaultValue="0"
        onInput={(event) => {
          const progress = Number(event.currentTarget.value);
          const max = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: max * progress, behavior: "auto" });
        }}
      />
    </aside>
  );
}
