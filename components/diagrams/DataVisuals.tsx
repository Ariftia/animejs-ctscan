"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import { DataTexture, Group, LinearFilter, MeshBasicMaterial, RGBAFormat, ShaderMaterial } from "three";
import { ReconstructionVolume } from "./ReconstructionVolume";
import { ACQUISITION, transmission } from "@/components/scanner/acquisition";
import { SCENES, rangeProgress } from "@/components/animation/ranges";
import { useExperience } from "@/components/experience/ExperienceContext";

function ProjectionLines() {
  const { size } = useThree();
  const mobile = size.width <= 800;
  const angles = useMemo(() => [0, 45, 90, 135, 180], []);
  const group = useRef<Group>(null);
  const materials = useRef<MeshBasicMaterial[]>([]);
  const annotations = useRef<(HTMLSpanElement | null)[]>([]);
  const profiles = useMemo(() => angles.map((angle) => Array.from({ length: 12 }, (_, channel) => {
    const detector = (channel / 11) * (ACQUISITION.channels - 1);
    return 0.02 - Math.log(transmission(detector, angle * Math.PI / 180, 0)) * 0.24;
  })), [angles]);
  const { motion } = useExperience();
  useFrame(() => {
    if (!group.current) return;
    const opacity = motion.current.dataAlpha * (1 - motion.current.sinogramAlpha) * (1 - motion.current.reconstructionAlpha);
    const reveal = Math.min(1, opacity * 4);
    group.current.visible = opacity > 0.005;
    materials.current.forEach((material) => { material.opacity = reveal * 0.95; });
    annotations.current.forEach((label) => {
      if (!label) return;
      label.style.opacity = String(reveal);
      label.setAttribute("aria-hidden", String(opacity < 0.005));
    });
  });
  return (
    <group ref={group} position={[mobile ? 2.3 : 3.1, 0.1, 0.65]}>
      <Html position={[0, 1.3, 0]} center style={{ pointerEvents: "none" }}>
        <span ref={(node) => { annotations.current[5] = node; }} className="projection-label">ATTENUATION</span>
      </Html>
      {angles.map((angle, index) => (
        <group key={angle} position={[0, (2 - index) * 0.42, 0]}>
          <Html position={[-0.76, 0.06, 0]} center style={{ pointerEvents: "none" }}>
            <span ref={(node) => { annotations.current[index] = node; }} className="projection-label">{angle}°</span>
          </Html>
          {Array.from({ length: 12 }, (_, cell) => (
            <mesh key={cell} position={[(cell - 5.5) * 0.085, profiles[index][cell] / 2, 0]}>
              <boxGeometry args={[0.055, profiles[index][cell], 0.025]} />
              <meshBasicMaterial ref={(material) => { if (material) materials.current[index * 12 + cell] = material; }} color="#13818a" transparent opacity={0} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
      <Html position={[0, -1.15, 0]} center style={{ pointerEvents: "none" }}>
        <span ref={(node) => { annotations.current[6] = node; }} className="projection-label">DETECTOR POSITION →</span>
      </Html>
    </group>
  );
}

function SinogramPlane() {
  const texture = useMemo(() => {
    const width = 128;
    const height = 180;
    const pixels = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y += 1) {
      const angle = (y / (height - 1)) * Math.PI * 2;
      for (let x = 0; x < width; x += 1) {
        const channel = (x / (width - 1)) * (ACQUISITION.channels - 1);
        const attenuation = -Math.log(transmission(channel, angle, 0));
        const signal = Math.min(1, attenuation / 1.35);
        const index = (y * width + x) * 4;
        pixels[index] = Math.round(20 + signal * 200);
        pixels[index + 1] = Math.round(30 + signal * 200);
        pixels[index + 2] = Math.round(32 + signal * 200);
        pixels[index + 3] = 255;
      }
    }
    const next = new DataTexture(pixels, width, height, RGBAFormat);
    next.minFilter = LinearFilter;
    next.magFilter = LinearFilter;
    next.needsUpdate = true;
    return next;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  const group = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uMap: { value: texture }, uAlpha: { value: 0 }, uReveal: { value: 0 },
  }), [texture]);
  const { motion, progressRef } = useExperience();
  useFrame(() => {
    if (!group.current) return;
    const opacity = motion.current.sinogramAlpha * (1 - motion.current.reconstructionAlpha * 0.85);
    group.current.visible = opacity > 0.005;
    if (!material.current) return;
    material.current.uniforms.uAlpha.value = opacity * 0.96;
    const progress = rangeProgress(progressRef.current, [SCENES.SINOGRAM[0], SCENES.SINOGRAM[1]]);
    // Eased reveal curve for tactile data scanning feel
    material.current.uniforms.uReveal.value = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  });
  return (
    <group ref={group} position={[2.05, 0.15, 0.65]}>
      <mesh>
        <planeGeometry args={[1.45, 1.9]} />
        <shaderMaterial
          ref={material} uniforms={uniforms} transparent depthWrite={false}
          vertexShader={`varying vec2 vUv;
            void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
          fragmentShader={`
            uniform sampler2D uMap;
            uniform float uAlpha, uReveal;
            varying vec2 vUv;
            void main() {
              float row = 1.0 - vUv.y;
              vec3 signal = texture2D(uMap, vec2(vUv.x, row)).rgb;
              float acquired = 1.0 - smoothstep(uReveal, uReveal + 0.008, row);
              vec3 color = mix(vec3(0.04, 0.075, 0.08), signal, acquired);
              float cursor = (1.0 - smoothstep(0.002, 0.008, abs(row - uReveal))) * step(uReveal, 0.99);
              gl_FragColor = vec4(mix(color, vec3(0.2, 0.85, 0.9), cursor), uAlpha);
            }`}
        />
      </mesh>
    </group>
  );
}

export function DataVisuals() {
  return (
    <>
      <ProjectionLines />
      <SinogramPlane />
      <ReconstructionVolume />
    </>
  );
}
