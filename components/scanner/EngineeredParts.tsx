"use client";

import { Edges, RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DoubleSide, Group, MeshBasicMaterial, MeshStandardMaterial, Shape } from "three";
import { useExperience } from "@/components/experience/ExperienceContext";

const OUTLINE = "#18383b";
const CYAN = "#26c6d2";

function PartEdges({ color = OUTLINE }: { color?: string }) {
  return <Edges threshold={24} scale={1.004} color={color} />;
}

export function HousingHalf({ side, selected }: { side: "left" | "right"; selected: boolean }) {
  const rotation = side === "left" ? Math.PI / 2 : -Math.PI / 2;
  return (
    <group rotation={[0, 0, rotation]}>
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1.58, 0.43, 22, 72, Math.PI]} />
        <meshStandardMaterial color={selected ? "#d9fbfc" : "#f1f2ee"} roughness={0.27} metalness={0.08} transparent />
      </mesh>
      <mesh scale={1.003}>
        <torusGeometry args={[1.58, 0.43, 10, 32, Math.PI]} />
        <meshBasicMaterial color={OUTLINE} transparent opacity={0.3} wireframe depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, -0.34]} castShadow receiveShadow>
        <torusGeometry args={[1.58, 0.38, 18, 72, Math.PI]} />
        <meshStandardMaterial color="#dfe3df" roughness={0.34} metalness={0.08} transparent />
      </mesh>
      <mesh position={[0, 0, -0.34]} scale={1.003}>
        <torusGeometry args={[1.58, 0.38, 8, 32, Math.PI]} />
        <meshBasicMaterial color="#718184" transparent opacity={0.22} wireframe depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.34]}>
        <torusGeometry args={[1.39, 0.035, 10, 72, Math.PI]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.28} roughness={0.3} transparent />
        <PartEdges color={CYAN} />
      </mesh>
    </group>
  );
}

export function HousingBase({ selected }: { selected: boolean }) {
  return (
    <group position={[0, -1.76, -0.08]}>
      <RoundedBox args={[2.42, 0.48, 0.98]} radius={0.16} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={selected ? "#d9fbfc" : "#e5e7e3"} roughness={0.3} metalness={0.1} transparent />
        <PartEdges />
      </RoundedBox>
      <RoundedBox args={[2.12, 0.12, 1.08]} radius={0.04} smoothness={2} position={[0, -0.27, 0]} castShadow>
        <meshStandardMaterial color="#2d3536" roughness={0.35} metalness={0.45} transparent />
        <PartEdges color="#263335" />
      </RoundedBox>
    </group>
  );
}

export function HousingCrown({ selected }: { selected: boolean }) {
  return (
    <group position={[0, 1.72, 0]}>
      <RoundedBox args={[0.86, 0.48, 0.92]} radius={0.16} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={selected ? "#d9fbfc" : "#e8ebe7"} roughness={0.29} metalness={0.1} transparent />
        <PartEdges />
      </RoundedBox>
      <RoundedBox args={[0.38, 0.045, 0.04]} radius={0.02} smoothness={2} position={[0, -0.12, 0.48]}>
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.6} transparent />
      </RoundedBox>
    </group>
  );
}

export function RotationRing({ selected }: { selected: boolean }) {
  return (
    <group>
      <mesh castShadow receiveShadow>
        <torusGeometry args={[1.43, 0.155, 18, 96]} />
        <meshStandardMaterial color={selected ? "#196a72" : "#273234"} roughness={0.28} metalness={0.68} transparent />
        <PartEdges color={selected ? CYAN : "#789194"} />
      </mesh>
      <mesh position={[0, 0, 0.015]}>
        <torusGeometry args={[1.29, 0.035, 10, 96]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.52} roughness={0.22} transparent />
        <PartEdges color={CYAN} />
      </mesh>
      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 1.43, Math.sin(angle) * 1.43, -0.08]} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.24, 0.07, 0.12]} />
            <meshStandardMaterial color="#748184" metalness={0.75} roughness={0.26} transparent />
            <PartEdges />
          </mesh>
        );
      })}
    </group>
  );
}

export function XRayTube({ selected = false }: { selected?: boolean }) {
  return (
    <group>
      <RoundedBox args={[0.68, 0.4, 0.48]} radius={0.11} smoothness={3} castShadow>
        <meshStandardMaterial color={selected ? "#148b96" : "#222b2d"} metalness={0.62} roughness={0.25} transparent />
        <PartEdges color={selected ? CYAN : "#758789"} />
      </RoundedBox>
      <mesh position={[0, -0.28, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.17, 0.2, 28]} />
        <meshStandardMaterial color="#aebabc" metalness={0.85} roughness={0.18} transparent />
        <PartEdges />
      </mesh>
      <mesh position={[0, -0.39, 0]}>
        <cylinderGeometry args={[0.072, 0.072, 0.025, 24]} />
        <meshStandardMaterial color={CYAN} emissive={CYAN} emissiveIntensity={0.72} transparent />
      </mesh>
      <RoundedBox args={[0.78, 0.09, 0.24]} radius={0.03} smoothness={2} position={[0, 0.25, -0.04]}>
        <meshStandardMaterial color="#6f7c7f" metalness={0.78} roughness={0.24} transparent />
        <PartEdges />
      </RoundedBox>
    </group>
  );
}

export function DetectorArray({ selected = false }: { selected?: boolean }) {
  const cells = useMemo(() => Array.from({ length: 25 }, (_, index) => index), []);
  const materials = useRef<MeshStandardMaterial[]>([]);
  const { motion } = useExperience();

  useFrame((state) => {
    const pulse = motion.current.detectorPulse;
    materials.current.forEach((material, index) => {
      const active = pulse > index / cells.length;
      material.color.set(selected || active ? CYAN : "#6b7a7c");
      material.emissiveIntensity = active ? 0.35 + Math.sin(state.clock.elapsedTime * 8 - index * 0.3) * 0.16 : 0.02;
    });
  });

  return (
    <group>
      <RoundedBox args={[1.22, 0.18, 0.47]} radius={0.06} smoothness={2} position={[0, 0.02, -0.06]}>
        <meshStandardMaterial color="#253032" metalness={0.64} roughness={0.3} transparent />
        <PartEdges />
      </RoundedBox>
      {cells.map((index) => {
        const angle = (index - 12) * 0.034;
        return (
          <mesh key={index} position={[Math.sin(angle) * 1.03, Math.cos(angle) * 0.17, 0.2]} rotation={[0, 0, -angle]} castShadow>
            <boxGeometry args={[0.043, 0.23, 0.25]} />
            <meshStandardMaterial ref={(material) => { if (material) materials.current[index] = material; }} color={selected ? CYAN : "#6b7a7c"} emissive={CYAN} emissiveIntensity={0.02} metalness={0.38} roughness={0.36} transparent />
            <PartEdges />
          </mesh>
        );
      })}
    </group>
  );
}

export function PatientTable({ selected = false }: { selected?: boolean }) {
  return (
    <group>
      <RoundedBox args={[1.05, 0.16, 5.1]} radius={0.13} smoothness={3} castShadow receiveShadow>
        <meshStandardMaterial color={selected ? "#b7f4f6" : "#4c595b"} roughness={0.3} metalness={0.26} transparent />
        <PartEdges color={selected ? CYAN : OUTLINE} />
      </RoundedBox>
      <RoundedBox args={[0.82, 0.13, 4.62]} radius={0.08} smoothness={2} position={[0, 0.13, 0]}>
        <meshStandardMaterial color="#151c1d" roughness={0.52} metalness={0.12} transparent />
        <PartEdges color="#7d8b8d" />
      </RoundedBox>
      <RoundedBox args={[1.02, 0.22, 1.32]} radius={0.12} smoothness={3} position={[0, -0.27, 1.62]} castShadow>
        <meshStandardMaterial color="#e3e6e2" roughness={0.32} metalness={0.1} transparent />
        <PartEdges />
      </RoundedBox>
      <RoundedBox args={[1.48, 0.18, 1.65]} radius={0.08} smoothness={2} position={[0, -0.47, 1.62]} castShadow>
        <meshStandardMaterial color="#505c5e" roughness={0.35} metalness={0.48} transparent />
        <PartEdges />
      </RoundedBox>
    </group>
  );
}

export function XRayBeam() {
  const shape = useMemo(() => {
    const result = new Shape();
    result.moveTo(0, 0);
    result.lineTo(-1.18, -2.72);
    result.lineTo(1.18, -2.72);
    result.closePath();
    return result;
  }, []);
  const material = useRef<MeshBasicMaterial>(null);
  const { motion } = useExperience();

  useFrame(() => {
    if (material.current) material.current.opacity = motion.current.beamAlpha * 0.23;
  });

  return (
    <mesh position={[0, -0.35, 0.08]} userData={{ noSurfaceFade: true }}>
      <shapeGeometry args={[shape]} />
      <meshBasicMaterial ref={material} color="#53dce5" transparent opacity={0} side={DoubleSide} depthWrite={false} />
    </mesh>
  );
}

export function PatientPhantom() {
  const group = useRef<Group>(null);
  const outer = useRef<MeshStandardMaterial>(null);
  const inner = useRef<MeshBasicMaterial>(null);
  const { motion } = useExperience();

  useFrame(() => {
    const opacity = motion.current.patientAlpha;
    if (group.current) group.current.visible = opacity > 0.005;
    if (outer.current) outer.current.opacity = opacity * 0.3;
    if (inner.current) inner.current.opacity = opacity * 0.11;
  });

  return (
    <group ref={group} position={[0, -1.03, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
      <mesh scale={[0.62, 1.18, 0.4]}>
        <capsuleGeometry args={[0.47, 1.4, 10, 24]} />
        <meshPhysicalMaterial ref={outer} color="#b8e9eb" transparent opacity={0} transmission={0.38} roughness={0.34} depthWrite={false} />
      </mesh>
      <mesh scale={[0.38, 0.78, 0.26]}>
        <capsuleGeometry args={[0.42, 1.08, 8, 20]} />
        <meshBasicMaterial ref={inner} color={CYAN} transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export function CTSliceStack() {
  const group = useRef<Group>(null);
  const { motion } = useExperience();
  useFrame((state) => {
    if (!group.current) return;
    const opacity = motion.current.sliceAlpha;
    group.current.visible = opacity > 0.005;
    group.current.rotation.z = state.clock.elapsedTime * 0.08;
    group.current.scale.setScalar(0.85 + opacity * 0.15);
  });

  return (
    <group ref={group} position={[0, 0.05, 1.05]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
      {Array.from({ length: 9 }, (_, index) => (
        <mesh key={index} position={[0, (index - 4) * 0.055, 0]}>
          <cylinderGeometry args={[0.86 - index * 0.012, 0.86 - index * 0.012, 0.018, 64]} />
          <meshPhysicalMaterial color={index === 8 ? "#d6fcff" : "#35cbd5"} emissive="#12aab6" emissiveIntensity={0.16} transparent opacity={0.18 + index * 0.035} roughness={0.22} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}
