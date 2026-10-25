"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { useExperience } from "./ExperienceContext";

export function CTCamera() {
  const { camera, size } = useThree();
  const { motion, activeScene } = useExperience();
  const target = useMemo(() => new Vector3(), []);
  const monitor = useRef({ frames: 0, last: 0 });
  const explorerReady = useRef(false);
  const mobile = size.width <= 800;

  useEffect(() => {
    explorerReady.current = false;
  }, [activeScene, size.width, size.height]);

  useFrame((state) => {
    const m = motion.current;
    const machineX = mobile ? m.machineX * 0.15 : m.machineX;
    target.set(machineX + m.lookX, m.machineY - 0.25, 0.4);
    if (camera instanceof PerspectiveCamera) {
      // Reserve a stable visual lane without changing the model's world coordinates.
      camera.setViewOffset(size.width, size.height, mobile ? 0 : size.width * -0.21, 0, size.width, size.height);
    }
    if (activeScene !== "EXPLORER" || !explorerReady.current) {
      const framing = Math.max(1, (mobile ? 0.95 : 1.6) / (size.width / size.height)) * 1.2;
      camera.position.set(machineX + m.lookX + m.cameraX * framing, m.cameraY * framing, m.cameraZ * framing);
      camera.lookAt(target);
      explorerReady.current = true;
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
      target={[(mobile ? motion.current.machineX * 0.15 : motion.current.machineX) + motion.current.lookX, motion.current.machineY - 0.25, 0.4]}
      makeDefault
    />
  );
}
