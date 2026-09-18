"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DataTexture, Group, LinearFilter, MeshBasicMaterial, RGBAFormat } from "three";
import { useExperience } from "@/components/experience/ExperienceContext";

function ProjectionLines() {
  const angles = useMemo(() => [0, 45, 90, 135, 180], []);
  const group = useRef<Group>(null);
  const materials = useRef<MeshBasicMaterial[]>([]);
  const { motion } = useExperience();
  useFrame(() => {
    if (!group.current) return;
    const opacity = motion.current.dataAlpha;
    group.current.visible = opacity > 0.005;
    group.current.scale.setScalar(0.84 + opacity * 0.16);
    materials.current.forEach((material, index) => {
      material.opacity = opacity * (0.22 + (index % 12) / 18);
    });
  });
  return (
    <group ref={group} position={[2.8, 0.2, -0.4]}>
      {angles.map((angle, index) => (
        <group key={angle} position={[index * 0.2, (index - 2) * 0.34, 0]}>
          {Array.from({ length: 12 }, (_, cell) => (
            <mesh key={cell} position={[(cell - 5.5) * 0.075, 0, 0]}>
              <boxGeometry args={[0.05, 0.2 + Math.sin(cell * 0.75 + index) * 0.12, 0.025]} />
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
    const width = 96;
    const height = 56;
    const pixels = new Uint8Array(width * height * 4);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const angle = (x / width) * Math.PI * 2;
        const centerA = height * 0.5 + Math.sin(angle) * height * 0.29;
        const centerB = height * 0.5 + Math.sin(angle * 1.45 + 1.6) * height * 0.2;
        const centerC = height * 0.5 + Math.sin(angle * 0.62 - 0.8) * height * 0.36;
        const distance = Math.min(Math.abs(y - centerA), Math.abs(y - centerB), Math.abs(y - centerC));
        const signal = Math.exp(-(distance * distance) / 3.4);
        const index = (y * width + x) * 4;
        pixels[index] = Math.round(16 + signal * 45);
        pixels[index + 1] = Math.round(31 + signal * 170);
        pixels[index + 2] = Math.round(34 + signal * 185);
        pixels[index + 3] = 255;
      }
    }
    const next = new DataTexture(pixels, width, height, RGBAFormat);
    next.minFilter = LinearFilter;
    next.magFilter = LinearFilter;
    next.needsUpdate = true;
    return next;
  }, []);
  const group = useRef<Group>(null);
  const material = useRef<MeshBasicMaterial>(null);
  const { motion } = useExperience();
  useFrame(() => {
    if (!group.current) return;
    const opacity = motion.current.sinogramAlpha;
    group.current.visible = opacity > 0.005;
    group.current.scale.setScalar(0.92 + opacity * 0.08);
    if (material.current) material.current.opacity = opacity * 0.92;
  });
  return (
    <group ref={group} position={[0.35, 0.15, 1.5]} rotation={[-0.08, 0.02, 0]}>
      <mesh>
        <planeGeometry args={[3.15, 2.06]} />
        <meshBasicMaterial ref={material} map={texture} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Reconstruction() {
  const group = useRef<Group>(null);
  const lines = useRef<MeshBasicMaterial[]>([]);
  const disc = useRef<MeshBasicMaterial>(null);
  const { motion } = useExperience();
  useFrame(() => {
    if (!group.current) return;
    const opacity = motion.current.reconstructionAlpha;
    group.current.visible = opacity > 0.005;
    group.current.rotation.z += 0.002 * opacity;
    lines.current.forEach((material) => { material.opacity = opacity * 0.22; });
    if (disc.current) disc.current.opacity = opacity * 0.14;
  });
  return (
    <group ref={group} position={[0, 0.12, 1.2]}>
      {Array.from({ length: 14 }, (_, index) => (
        <mesh key={index} rotation={[0, 0, (index / 14) * Math.PI]}>
          <planeGeometry args={[4.4, 0.012]} />
          <meshBasicMaterial ref={(material) => { if (material) lines.current[index] = material; }} color="#31d4df" transparent opacity={0} depthWrite={false} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.05]}>
        <circleGeometry args={[1.06, 64]} />
        <meshBasicMaterial ref={disc} color="#8be3e8" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function DataVisuals() {
  return (
    <>
      <ProjectionLines />
      <SinogramPlane />
      <Reconstruction />
    </>
  );
}
