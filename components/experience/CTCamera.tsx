"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Vector3 } from "three";
import { useExperience } from "./ExperienceContext";

export function CTCamera() {
  const { camera } = useThree();
  const { motion, activeScene } = useExperience();
  const target = useMemo(() => new Vector3(), []);
  const monitor = useRef({ frames: 0, last: 0 });

  useFrame((state) => {
    const m = motion.current;
    if (activeScene !== "EXPLORER") {
      camera.position.set(m.cameraX, m.cameraY, m.cameraZ);
      target.set(m.lookX, 0, 0);
      camera.lookAt(target);
    }
    if (process.env.NODE_ENV !== "production") {
      monitor.current.frames += 1;
      const now = state.clock.elapsedTime;
      if (now - monitor.current.last >= 0.5) {
        const fps = Math.round(monitor.current.frames / (now - monitor.current.last));
        monitor.current.frames = 0;
        monitor.current.last = now;
        const fpsNode = document.querySelector("[data-fps]");
        const cameraNode = document.querySelector("[data-camera]");
        if (fpsNode) fpsNode.textContent = String(fps);
        if (cameraNode) cameraNode.textContent = `${camera.position.x.toFixed(1)}, ${camera.position.y.toFixed(1)}, ${camera.position.z.toFixed(1)} / ${camera.rotation.x.toFixed(2)}, ${camera.rotation.y.toFixed(2)}`;
      }
    }
  });

  return (
    <OrbitControls
      enabled={activeScene === "EXPLORER"}
      enablePan={false}
      minDistance={4.5}
      maxDistance={10}
      target={[0.5, 0, 0]}
      makeDefault
    />
  );
}
