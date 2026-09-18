"use client";

import { useProgress } from "@react-three/drei";

export function LoadingScreen() {
  const { progress, total } = useProgress();
  const visible = total === 0 || progress < 99.5;
  const displayedProgress = total > 0 ? progress : 74;
  return (
    <div className={visible ? "loader active" : "loader"} aria-hidden={!visible}>
      <div className="loader-mark">CT</div>
      <p>INITIALIZING SCANNER</p>
      <div className="loader-track"><span style={{ transform: `scaleX(${displayedProgress / 100})` }} /></div>
      <output>{Math.round(displayedProgress)}%</output>
    </div>
  );
}
