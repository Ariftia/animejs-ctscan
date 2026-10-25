"use client";

import { OrbitControls } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { ComponentRef, useEffect, useMemo, useRef } from "react";
import { Box3, MathUtils, PerspectiveCamera, Sphere, Vector3 } from "three";
import { useExperience } from "./ExperienceContext";

export function CTCamera() {
  const { camera, scene, size } = useThree();
  const { motion, activeScene, selected, reducedMotion } = useExperience();
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const target = useMemo(() => new Vector3(), []);
  const focus = useMemo(() => ({
    position: new Vector3(), target: new Vector3(), bounds: new Box3(), sphere: new Sphere(),
    pending: true, moving: false,
  }), []);
  const monitor = useRef({ frames: 0, last: 0 });
  const explorerReady = useRef(false);
  const mobile = size.width <= 800;
  const framing = Math.max(mobile ? 1.6 : 1, (mobile ? 0.8 : 1.6) / (size.width / size.height)) * 1.2;

  useEffect(() => {
    explorerReady.current = false;
  }, [activeScene, size.width, size.height]);

  useEffect(() => {
    focus.pending = true;
  }, [activeScene, selected, size.width, size.height, reducedMotion, focus]);

  useFrame((state, delta) => {
    const m = motion.current;
    const orbit = controls.current;
    const machineX = mobile ? 0 : m.machineX;
    target.set(machineX + (mobile ? 0 : m.lookX), m.machineY - (mobile ? 0 : 0.25), 0.4);
    if (camera instanceof PerspectiveCamera) {
      camera.setViewOffset(size.width, size.height, mobile ? 0 : size.width * -0.21, mobile ? size.height * 0.28 : 0, size.width, size.height);
    }
    if (activeScene !== "EXPLORER" || !explorerReady.current) {
      camera.position.set(machineX + (mobile ? 0 : m.lookX) + m.cameraX * framing, (m.cameraY + (mobile ? 0.25 : 0)) * framing, m.cameraZ * framing);
      camera.lookAt(target);
      orbit?.target.copy(target);
      explorerReady.current = true;
      focus.moving = false;
    }
    if (activeScene === "EXPLORER" && orbit && focus.pending && camera instanceof PerspectiveCamera) {
      focus.target.copy(target);
      focus.position.set(machineX + (mobile ? 0 : m.lookX) + m.cameraX * framing, (m.cameraY + (mobile ? 0.25 : 0)) * framing, m.cameraZ * framing);
      const part = selected ? scene.getObjectByName(`ct-part-${selected}`) : undefined;
      if (part) {
        scene.updateMatrixWorld(true);
        focus.bounds.setFromObject(part);
        if (!focus.bounds.isEmpty()) {
          focus.bounds.getBoundingSphere(focus.sphere);
          const tangent = Math.tan(MathUtils.degToRad(camera.fov) / 2);
          const heightFit = focus.sphere.radius / (tangent * (mobile ? 0.32 : 0.72));
          const widthFit = focus.sphere.radius / (tangent * (size.width / size.height) * (mobile ? 0.82 : 0.42));
          const distance = Math.max(heightFit, widthFit, 0.4 * framing) * 1.08;
          focus.target.copy(focus.sphere.center);
          focus.position.copy(camera.position).sub(orbit.target).normalize().multiplyScalar(distance).add(focus.target);
        }
      }
      focus.pending = false;
      focus.moving = true;
    }
    if (activeScene === "EXPLORER" && orbit && focus.moving) {
      const blend = reducedMotion ? 1 : 1 - Math.exp(-10 * Math.min(delta, 0.05));
      camera.position.lerp(focus.position, blend);
      orbit.target.lerp(focus.target, blend);
      if (camera.position.distanceToSquared(focus.position) < 0.000001 && orbit.target.distanceToSquared(focus.target) < 0.000001) {
        camera.position.copy(focus.position);
        orbit.target.copy(focus.target);
        focus.moving = false;
      }
      orbit.update();
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
      ref={controls}
      enabled={activeScene === "EXPLORER"}
      enablePan={false}
      minDistance={0.35 * framing}
      maxDistance={selected ? 100 : 10 * framing}
      onStart={() => { focus.moving = false; }}
      makeDefault
    />
  );
}
