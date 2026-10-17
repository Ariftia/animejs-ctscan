"use client";

import { RoundedBox } from "@react-three/drei";
import { useMemo } from "react";
import { DoubleSide, Path, Shape } from "three";

const ACCENT = "#208f98";

function OperatorPanel({ side }: { side: number }) {
  return (
    <group position={[side * 1.64, 0.25, 0.75]} rotation={[0, side * 0.1, 0]}>
      <RoundedBox args={[0.38, 0.64, 0.065]} radius={0.045} smoothness={3}>
        <meshStandardMaterial color="#354349" roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.105, 0.036]}>
        <planeGeometry args={[0.29, 0.29]} />
        <meshStandardMaterial color="#16383f" roughness={0.28} />
      </mesh>
      {[0, 1, 2].map((row) => (
        <mesh key={row} position={[-0.025, 0.18 - row * 0.065, 0.038]}>
          <planeGeometry args={[row === 0 ? 0.2 : 0.14, 0.013]} />
          <meshStandardMaterial color="#86c9cf" emissive="#86c9cf" emissiveIntensity={0.25} />
        </mesh>
      ))}
      {[-1, 0, 1].map((column) => (
        <mesh key={column} position={[column * 0.09, -0.13, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.018, 16]} />
          <meshStandardMaterial color={column === 1 ? "#b75d48" : "#c4ced0"} roughness={0.5} />
        </mesh>
      ))}
      <RoundedBox args={[0.18, 0.045, 0.018]} radius={0.014} position={[0, -0.24, 0.04]}>
        <meshStandardMaterial color="#a3b4b7" roughness={0.45} />
      </RoundedBox>
    </group>
  );
}

/** Original geometry informed by clinical CT products; no manufacturer assets. */
export function ProductHousing({ selected }: { selected: boolean }) {
  const enclosure = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-1.72, -1.96);
    shape.lineTo(1.72, -1.96);
    shape.quadraticCurveTo(2.03, -1.96, 2.03, -1.65);
    shape.lineTo(2.03, 0.52);
    shape.bezierCurveTo(2.03, 1.48, 1.3, 2.04, 0.5, 2.04);
    shape.lineTo(-0.5, 2.04);
    shape.bezierCurveTo(-1.3, 2.04, -2.03, 1.48, -2.03, 0.52);
    shape.lineTo(-2.03, -1.65);
    shape.quadraticCurveTo(-2.03, -1.96, -1.72, -1.96);
    const bore = new Path();
    bore.absarc(0, 0, 1.2, 0, Math.PI * 2, true);
    shape.holes.push(bore);
    return shape;
  }, []);
  return (
    <group>
      <mesh position={[0, 0, -0.72]} castShadow receiveShadow>
        <extrudeGeometry args={[enclosure, { depth: 1.25, bevelEnabled: true, bevelSegments: 5, steps: 1, bevelSize: 0.12, bevelThickness: 0.12, curveSegments: 64 }]} />
        <meshStandardMaterial color={selected ? "#d4eeee" : "#e9edeb"} metalness={0.08} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0.66]}>
        <torusGeometry args={[1.29, 0.07, 16, 96]} />
        <meshStandardMaterial color={ACCENT} metalness={0.4} roughness={0.26} />
      </mesh>
      <mesh position={[0, 0, 0.71]}>
        <torusGeometry args={[1.215, 0.015, 8, 96]} />
        <meshStandardMaterial color="#91e4e4" emissive="#58c9ce" emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, -0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[1.19, 1.19, 1.35, 96, 1, true]} />
        <meshStandardMaterial color="#d3dddc" roughness={0.48} side={DoubleSide} />
      </mesh>
      <OperatorPanel side={-1} />
      <OperatorPanel side={1} />
      <RoundedBox args={[0.48, 0.065, 0.035]} radius={0.02} position={[0, 1.66, 0.67]}>
        <meshStandardMaterial color="#3f565b" roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.22, 0.018, 0.015]} radius={0.005} position={[0, 1.56, 0.67]}>
        <meshStandardMaterial color={ACCENT} roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[3.7, 0.15, 1.34]} radius={0.05} position={[0, -1.99, -0.08]}>
        <meshStandardMaterial color="#485557" roughness={0.5} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 2.145, -0.92, -0.1]}>
          {Array.from({ length: 8 }, (_, index) => (
            <mesh key={index} position={[0, index * 0.055, 0]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[0.48, 0.016]} />
              <meshStandardMaterial color="#8c9a9c" roughness={0.6} side={DoubleSide} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export function ProductTable({ selected }: { selected: boolean }) {
  return (
    <group>
      <RoundedBox args={[0.94, 0.16, 4.1]} radius={0.075} smoothness={4} position={[0, 0.03, 0.1]} castShadow>
        <meshStandardMaterial color={selected ? "#c4e4e2" : "#e1e7e5"} roughness={0.32} metalness={0.14} />
      </RoundedBox>
      <RoundedBox args={[0.82, 0.09, 3.92]} radius={0.04} smoothness={4} position={[0, 0.155, 0.1]}>
        <meshStandardMaterial color="#3a494d" roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.53, 0.07, 0.46]} radius={0.03} position={[0, 0.225, -1.35]}>
        <meshStandardMaterial color="#4e6063" roughness={0.9} />
      </RoundedBox>
      {[-1, 1].map((side) => (
        <RoundedBox key={side} args={[0.035, 0.055, 2.8]} radius={0.012} position={[side * 0.45, -0.06, 0.6]}>
          <meshStandardMaterial color="#718487" metalness={0.7} roughness={0.24} />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.67, 0.25, 1.55]} radius={0.08} position={[0, -0.17, 0.65]}>
        <meshStandardMaterial color="#6a7c80" metalness={0.25} roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.56, 0.65, 0.87]} radius={0.08} position={[0, -0.55, 0.85]}>
        <meshStandardMaterial color="#dce3e0" roughness={0.36} metalness={0.1} />
      </RoundedBox>
      <RoundedBox args={[0.4, 0.38, 0.64]} radius={0.045} position={[0, -0.49, 0.85]}>
        <meshStandardMaterial color="#9eacad" metalness={0.55} roughness={0.3} />
      </RoundedBox>
      <RoundedBox args={[1.04, 0.16, 1.5]} radius={0.075} position={[0, -0.89, 0.85]} castShadow>
        <meshStandardMaterial color="#c9d2cf" roughness={0.4} metalness={0.14} />
      </RoundedBox>
      <RoundedBox args={[0.95, 0.055, 1.37]} radius={0.02} position={[0, -0.99, 0.85]}>
        <meshStandardMaterial color="#455558" roughness={0.6} />
      </RoundedBox>
    </group>
  );
}
