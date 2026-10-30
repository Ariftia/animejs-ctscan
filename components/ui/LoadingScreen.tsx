"use client";

import { useProgress } from "@react-three/drei";

export function LoadingScreen({ ready }: { ready: boolean }) {
  const { progress, total } = useProgress();
  const visible = !ready;
  const displayedProgress = ready ? 100 : total > 0 ? Math.min(progress, 95) : 0;
  return (
    <div className={visible ? "loader active" : "loader"} role="status" aria-label="Initializing scanner" aria-hidden={!visible}>
      <div className="loader-mark">CT</div>
      <p>INITIALIZING SCANNER</p>
      <div className="loader-track"><span style={{ transform: `scaleX(${displayedProgress / 100})` }} /></div>
      <output>{Math.round(displayedProgress)}%</output>
    </div>
  );
}
