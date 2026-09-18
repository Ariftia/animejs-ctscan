"use client";

import { ExperienceProvider } from "./ExperienceContext";
import { CTCanvas } from "./CTCanvas";
import { StorySections } from "@/components/scenes/StorySections";
import { Navigation } from "@/components/ui/Navigation";
import { ProgressRail } from "@/components/ui/ProgressRail";
import { DebugPanel } from "@/components/ui/DebugPanel";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { EngineeringOverlay } from "@/components/ui/EngineeringOverlay";

export function CTExperience() {
  return (
    <ExperienceProvider>
      <Navigation />
      <ProgressRail />
      <div className="canvas-stage" aria-label="Interactive CT scanner model"><CTCanvas /></div>
      <EngineeringOverlay />
      <StorySections />
      <LoadingScreen />
      <DebugPanel />
    </ExperienceProvider>
  );
}
