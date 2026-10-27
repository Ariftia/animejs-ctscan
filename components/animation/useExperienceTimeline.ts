"use client";

import anime from "animejs";
import { MutableRefObject, useEffect } from "react";
import { createMotionState, MotionState } from "./motion";

export function useExperienceTimeline(
  progressRef: MutableRefObject<number>,
  motion: MutableRefObject<MotionState>,
  reducedMotion: boolean,
) {
  useEffect(() => {
    const distance = reducedMotion ? 0.18 : 0.55;
    const m = motion.current;
    // Rebuild from the same origin when motion preferences change mid-story.
    Object.assign(m, createMotionState());
    const timeline = anime.timeline({ autoplay: false, easing: "easeInOutCubic" });

    timeline
      .add({ targets: m, outlineAlpha: 0.34, surfaceAlpha: 1, duration: 91 }, 0)
      .add({ targets: m, outlineAlpha: 0.22, surfaceAlpha: 1, tableFeed: 1, duration: 91 }, 45)
      .add({ targets: m, explode: 1 * distance, housingAlpha: 0.34, tableFeed: 0, duration: 91 }, 136)
      .add({ targets: m, housingAlpha: 0.18, ringRotation: Math.PI * 1.35 * distance, duration: 91 }, 227)
      .add({ targets: m, explode: 0, housingAlpha: 0, beamAlpha: 0.9, ringRotation: Math.PI * 2.1 * distance, duration: 91 }, 318)
      .add({ targets: m, patientAlpha: 0.54, ringRotation: Math.PI * 2.75 * distance, duration: 91 }, 409)
      .add({ targets: m, detectorPulse: 1, beamAlpha: 0.7, ringRotation: Math.PI * 3.35 * distance, duration: 91 }, 500)
      .add({ targets: m, dataAlpha: 1, patientAlpha: 0.3, beamAlpha: 0.5, ringRotation: Math.PI * 4.4 * distance, duration: 91 }, 591)
      .add({ targets: m, sinogramAlpha: 1, dataAlpha: 0.15, beamAlpha: 0, detectorPulse: 0, housingAlpha: 0, ringRotation: Math.PI * 5.2 * distance, duration: 91 }, 682)
      .add({ targets: m, reconstructionAlpha: 1, sliceAlpha: 1, patientAlpha: 0, dataAlpha: 0, sinogramAlpha: 0.1, ringRotation: Math.PI * 5.6 * distance, duration: 91 }, 773)
      .add({ targets: m, reconstructionAlpha: 0, sliceAlpha: 0, dataAlpha: 0, sinogramAlpha: 0, housingAlpha: 1, patientAlpha: 0, explode: 0, outlineAlpha: 0.2, surfaceAlpha: 1, duration: 91 }, 864)
      .add({ targets: m, surfaceAlpha: 1, duration: 45 }, 955);

    timeline.seek(progressRef.current * 1000);
    let raf = 0;
    const update = () => {
      timeline.seek(progressRef.current * 1000);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      timeline.pause();
    };
  }, [motion, progressRef, reducedMotion]);
}
