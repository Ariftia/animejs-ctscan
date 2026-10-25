"use client";

import anime from "animejs";
import { MutableRefObject, useEffect, useRef } from "react";
import { MotionState } from "./motion";

export function useExperienceTimeline(
  progressRef: MutableRefObject<number>,
  motion: MutableRefObject<MotionState>,
  reducedMotion: boolean,
) {
  const timelineRef = useRef<anime.AnimeTimelineInstance | null>(null);

  useEffect(() => {
    const distance = reducedMotion ? 0.18 : 0.55;
    const m = motion.current;
    const timeline = anime.timeline({ autoplay: false, easing: "easeInOutCubic" });

    timeline
      .add({ targets: m, outlineAlpha: 0.34, surfaceAlpha: 1, duration: 91 }, 0)
      .add({ targets: m, outlineAlpha: 0.22, surfaceAlpha: 1, duration: 91 }, 45)
      .add({ targets: m, explode: 1 * distance, housingAlpha: 0.34, duration: 91 }, 136)
      .add({ targets: m, housingAlpha: 0.18, ringRotation: Math.PI * 1.35 * distance, duration: 91 }, 227)
      .add({ targets: m, explode: 0, housingAlpha: 0, beamAlpha: 0.9, ringRotation: Math.PI * 2.1 * distance, duration: 91 }, 318)
      .add({ targets: m, patientAlpha: 0.54, ringRotation: Math.PI * 2.75 * distance, duration: 91 }, 409)
      .add({ targets: m, detectorPulse: 1, beamAlpha: 0.7, ringRotation: Math.PI * 3.35 * distance, duration: 91 }, 500)
      .add({ targets: m, dataAlpha: 1, patientAlpha: 0.3, beamAlpha: 0.45, ringRotation: Math.PI * 4.4 * distance, duration: 91 }, 591)
      .add({ targets: m, sinogramAlpha: 1, beamAlpha: 0, detectorPulse: 0, housingAlpha: 0, duration: 45 }, 682)
      .add({ targets: m, reconstructionAlpha: 1, sliceAlpha: 1, patientAlpha: 0, dataAlpha: 0.08, sinogramAlpha: 0.04, duration: 45 }, 773)
      .add({ targets: m, reconstructionAlpha: 0, sliceAlpha: 0, dataAlpha: 0, sinogramAlpha: 0, housingAlpha: 1, patientAlpha: 0, explode: 0, outlineAlpha: 0.2, surfaceAlpha: 1, duration: 91 }, 864)
      .add({ targets: m, surfaceAlpha: 1, duration: 45 }, 955);

    timelineRef.current = timeline;
    let raf = 0;
    const update = () => {
      timeline.seek(progressRef.current * 1000);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      timeline.pause();
      timelineRef.current = null;
    };
  }, [motion, progressRef, reducedMotion]);
}
