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
    const distance = reducedMotion ? 0.28 : 1;
    const m = motion.current;
    const timeline = anime.timeline({ autoplay: false, easing: "easeInOutCubic" });

    timeline
      .add({ targets: m, cameraX: 3.7, cameraY: 1.9, cameraZ: 6.9, machineRotY: 0.08, outlineAlpha: 0.34, surfaceAlpha: 1, duration: 91 }, 0)
      .add({ targets: m, cameraX: 2.25, cameraY: 1.25, cameraZ: 6.2, machineRotY: 0.28, outlineAlpha: 0.22, surfaceAlpha: 1, duration: 91 }, 45)
      .add({ targets: m, explode: 1 * distance, housingAlpha: 0.34, cameraX: 2.6, cameraZ: 6.7, duration: 91 }, 136)
      .add({ targets: m, housingAlpha: 0.18, ringRotation: Math.PI * 1.35 * distance, machineX: 0.8, cameraX: 1.7, cameraY: 0.7, cameraZ: 6.1, duration: 91 }, 227)
      .add({ targets: m, explode: 0, housingAlpha: 0, beamAlpha: 0.9, ringRotation: Math.PI * 2.1 * distance, machineX: -0.55, cameraX: 1.1, cameraY: 0.35, cameraZ: 5.9, duration: 91 }, 318)
      .add({ targets: m, patientAlpha: 0.54, ringRotation: Math.PI * 2.75 * distance, machineX: 0.65, duration: 91 }, 409)
      .add({ targets: m, detectorPulse: 1, beamAlpha: 0.7, machineX: 0.8, cameraX: -0.4, cameraZ: 5.5, ringRotation: Math.PI * 3.35 * distance, duration: 91 }, 500)
      .add({ targets: m, dataAlpha: 1, lookX: 0.7, patientAlpha: 0.3, beamAlpha: 0.45, machineX: -0.45, cameraX: 0, cameraZ: 6.3, ringRotation: Math.PI * 4.4 * distance, duration: 91 }, 591)
      .add({ targets: m, sinogramAlpha: 1, beamAlpha: 0, detectorPulse: 0, housingAlpha: 0, machineX: 0.65, duration: 45 }, 682)
      .add({ targets: m, reconstructionAlpha: 1, sliceAlpha: 1, patientAlpha: 0, lookX: 0, dataAlpha: 0.08, sinogramAlpha: 0.04, cameraZ: 6.8, duration: 45 }, 773)
      .add({ targets: m, reconstructionAlpha: 0, sliceAlpha: 0, dataAlpha: 0, sinogramAlpha: 0, housingAlpha: 1, patientAlpha: 0, explode: 0, outlineAlpha: 0.2, surfaceAlpha: 1, machineX: 0.8, cameraX: 3.7, cameraY: 2, cameraZ: 7.5, machineRotY: 0.06, duration: 91 }, 864)
      .add({ targets: m, machineX: 0.8, cameraX: 3.7, cameraY: 2, cameraZ: 7.5, duration: 45 }, 955);

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
