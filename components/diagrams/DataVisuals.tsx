"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { DataTexture, Group, LinearFilter, MeshBasicMaterial, Mesh, RGBAFormat, ShaderMaterial } from "three";
import { ReconstructionVolume } from "./ReconstructionVolume";
import { ACQUISITION, transmission } from "@/components/scanner/acquisition";
import { SCENES, rangeProgress } from "@/components/animation/ranges";
import { useExperience } from "@/components/experience/ExperienceContext";

function ProjectionLines() {
  const angles = useMemo(() => [0, 45, 90, 135, 180], []);
  const group = useRef<Group>(null);
  const materials = useRef<MeshBasicMaterial[]>([]);
  const bars = useRef<Mesh[]>([]);
  const { motion } = useExperience();
  useFrame(() => {
    if (!group.current) return;
    const opacity = motion.current.dataAlpha * (1 - motion.current.sinogramAlpha) * (1 - motion.current.reconstructionAlpha);
    group.current.visible = opacity > 0.005;
    group.current.scale.setScalar(0.84 + opacity * 0.16);
    materials.current.forEach((material, index) => {
      const view = Math.floor(index / 12);
      const channel = ((index % 12) / 11) * (ACQUISITION.channels - 1);
      const signal = -Math.log(transmission(channel, motion.current.scanAngle + view * Math.PI / 4, motion.current.explode));
      material.opacity = opacity * 0.7;
      if (bars.current[index]) bars.current[index].scale.y = 0.06 + signal * 0.3;
    });
  });
  return (
    <group ref={group} position={[2.8, 0.2, -0.4]}>
      {angles.map((angle, index) => (
        <group key={angle} position={[index * 0.2, (index - 2) * 0.34, 0]}>
          {Array.from({ length: 12 }, (_, cell) => (
            <mesh key={cell} ref={(mesh) => { if (mesh) bars.current[index * 12 + cell] = mesh; }} position={[(cell - 5.5) * 0.075, 0, 0]}>
              <boxGeometry args={[0.05, 1, 0.025]} />
              <meshBasicMaterial ref={(material) => { if (material) materials.current[index * 12 + cell] = material; }} color="#16bcca" transparent opacity={0} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
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
    const opacity = motion.current.sinogramAlpha * (1 - motion.current.reconstructionAlpha);
    group.current.visible = opacity > 0.005;
    if (!material.current) return;
    material.current.uniforms.uAlpha.value = opacity * 0.94;
    material.current.uniforms.uReveal.value = rangeProgress(progressRef.current, [SCENES.SINOGRAM[0], SCENES.SINOGRAM[1]]);
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
