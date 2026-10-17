"use client";

import React, { createContext, MutableRefObject, ReactNode, useCallback, useContext, useMemo, useRef, useState } from "react";
import { createMotionState, MotionState } from "@/components/animation/motion";
import { SceneKey, sceneAt } from "@/components/animation/ranges";
import { useScrollProgress } from "@/components/animation/useScrollProgress";
import { useExperienceTimeline } from "@/components/animation/useExperienceTimeline";

type ExperienceContextValue = {
  progressRef: MutableRefObject<number>;
  motion: MutableRefObject<MotionState>;
  activeScene: SceneKey;
  reducedMotion: boolean;
  selected: string | null;
  setSelected: (id: string | null) => void;
};

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function ExperienceProvider({ children }: { children: ReactNode }) {
  const progressRef = useRef(0);
  const motion = useRef(createMotionState());
  const [activeScene, setActiveScene] = useState<SceneKey>("HERO");
  const [selected, setSelected] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const handleScene = useCallback((progress: number) => setActiveScene(sceneAt(progress)), []);

  useScrollProgress({ progressRef, onSceneChange: handleScene });
  useExperienceTimeline(progressRef, motion, reducedMotion);

  const value = useMemo(
    () => ({ progressRef, motion, activeScene, selected, setSelected, reducedMotion }),
    [activeScene, selected, reducedMotion],
  );

  return <ExperienceContext.Provider value={value}>{children}</ExperienceContext.Provider>;
}

export function useExperience() {
  const value = useContext(ExperienceContext);
  if (!value) throw new Error("useExperience must be used inside ExperienceProvider");
  return value;
}
