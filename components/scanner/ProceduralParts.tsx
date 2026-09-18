"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { DoubleSide, Group, MeshBasicMaterial, MeshStandardMaterial, Shape } from "three";
import { useExperience } from "@/components/experience/ExperienceContext";

export function XRayTube({ selected = false }: { selected?: boolean }) {
  return (
    <group>
      <mesh castShadow>
        <boxGeometry args={[0.56, 0.34, 0.42]} />
        <meshStandardMaterial color={selected ? "#19c7d8" : "#30373a"} metalness={0.74} roughness={0.27} />
      </mesh>
      <mesh position={[0, -0.23, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.18, 24]} />
        <meshStandardMaterial color="#c6d1d1" metalness={0.82} roughness={0.2} />
      </mesh>
      <mesh position={[0.22, 0.03, 0.22]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#19c7d8" />
      </mesh>
    </group>
  );
}

export function DetectorArray({ selected = false }: { selected?: boolean }) {
  const cells = useMemo(() => Array.from({ length: 17 }, (_, index) => index), []);
  const materials = useRef<MeshStandardMaterial[]>([]);
  const { motion } = useExperience();
  useFrame((state) => {
    const pulse = motion.current.detectorPulse;
    materials.current.forEach((material, index) => {
      const active = pulse > index / cells.length;
      material.color.set(selected || active ? "#20c9d6" : "#536164");
      material.emissiveIntensity = active ? 0.55 + Math.sin(state.clock.elapsedTime * 8 - index * 0.35) * 0.25 : 0.05;
    });
  });
  return (
    <group>
      {cells.map((index) => {
        const angle = (index - 8) * 0.038;
        return (
          <mesh key={index} position={[Math.sin(angle) * 0.72, Math.cos(angle) * 0.22, 0]} rotation={[0, 0, -angle]} castShadow>
            <boxGeometry args={[0.074, 0.28, 0.34]} />
            <meshStandardMaterial
              ref={(material) => { if (material) materials.current[index] = material; }}
              color={selected ? "#20c9d6" : "#536164"}
              emissive="#0caebb"
              emissiveIntensity={0.05}
              metalness={0.35}
              roughness={0.38}
            />
          </mesh>
        );
      })}
    </group>
  );
}

export function XRayBeam() {
  const shape = useMemo(() => {
    const result = new Shape();
    result.moveTo(0, 0);
    result.lineTo(-1.2, -2.7);
    result.lineTo(1.2, -2.7);
    result.closePath();
    return result;
  }, []);
  const material = useRef<MeshBasicMaterial>(null);
  const mesh = useRef<Group>(null);
  const { motion } = useExperience();
  useFrame(() => {
    const opacity = motion.current.beamAlpha;
    if (material.current) material.current.opacity = opacity * 0.22;
  });
  return (
    <group ref={mesh}>
      <mesh position={[0, -0.25, 0]} rotation={[0, 0, 0]}>
        <shapeGeometry args={[shape]} />
        <meshBasicMaterial ref={material} color="#45d9e4" transparent opacity={0} side={DoubleSide} depthWrite={false} />
      </mesh>
    </group>
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
    if (outer.current) outer.current.opacity = opacity * 0.35;
    if (inner.current) inner.current.opacity = opacity * 0.12;
  });
  return (
    <group ref={group} position={[0, -0.42, 0.12]}>
      <mesh scale={[0.62, 1.15, 0.38]}>
        <capsuleGeometry args={[0.48, 1.4, 10, 24]} />
        <meshPhysicalMaterial ref={outer} color="#b8e4e5" transparent opacity={0} transmission={0.42} roughness={0.38} depthWrite={false} />
      </mesh>
      <mesh scale={[0.38, 0.76, 0.25]}>
        <capsuleGeometry args={[0.42, 1.1, 8, 20]} />
        <meshBasicMaterial ref={inner} color="#1bbdca" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
