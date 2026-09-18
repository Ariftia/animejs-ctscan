"use client";

import { MutableRefObject, useEffect } from "react";

type Options = {
  progressRef: MutableRefObject<number>;
  onSceneChange: (progress: number) => void;
};

export function useScrollProgress({ progressRef, onSceneChange }: Options) {
  useEffect(() => {
    let raf = 0;
    let last = -1;

    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const next = Math.min(1, Math.max(0, window.scrollY / max));
      progressRef.current = next;
      document.documentElement.style.setProperty("--experience-progress", String(next));

      const sceneIndex = Math.min(11, Math.floor(next * 12));
      if (sceneIndex !== last) {
        last = sceneIndex;
        onSceneChange(next);
      }

      document.querySelectorAll<HTMLElement>("[data-progress-readout]").forEach((node) => {
        node.textContent = next.toFixed(3);
      });
      document.querySelectorAll<HTMLInputElement>("[data-progress-scrubber]").forEach((node) => {
        if (document.activeElement !== node) node.value = String(next);
      });
      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [onSceneChange, progressRef]);
}
