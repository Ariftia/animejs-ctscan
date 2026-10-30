"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExperienceProvider } from "./ExperienceContext";
import { CTCanvas } from "./CTCanvas";
import { StorySections } from "@/components/scenes/StorySections";
import { Navigation } from "@/components/ui/Navigation";
import { ProgressRail } from "@/components/ui/ProgressRail";
import { DebugPanel } from "@/components/ui/DebugPanel";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { EngineeringOverlay } from "@/components/ui/EngineeringOverlay";

export function CTExperience() {
  const [ready, setReady] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const handleReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const finish = (event: AnimationEvent) => {
      if (event.animationName === "opening-land" || event.animationName === "opening-still") node.dataset.opening = "complete";
    };
    node.addEventListener("animationend", finish);
    return () => node.removeEventListener("animationend", finish);
  }, []);

  return (
    <ExperienceProvider>
      <div ref={container} className="experience" data-opening={ready ? "ready" : "loading"}>
        <noscript><style>{`.experience[data-opening="loading"] :is(.canvas-stage, #hero .story-copy) { opacity: 1; } .loader { display: none; }`}</style></noscript>
        <Navigation />
        <ProgressRail />
        <div className="canvas-stage" aria-label="Interactive CT scanner model"><CTCanvas onReady={handleReady} /></div>
        <EngineeringOverlay />
        <StorySections />
        <LoadingScreen ready={ready} />
        <DebugPanel />
      </div>
    </ExperienceProvider>
  );
}
