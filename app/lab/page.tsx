"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import { FloraModel } from "@/components/scanner/FloraModel";

const models = [
  ["GANTRY HOUSING", "/models/ct-gantry-housing.glb", [-3.2, 1.65, 0]],
  ["ROTATION RING", "/models/ct-rotation-ring.glb", [0, 1.65, 0]],
  ["X-RAY TUBE", "/models/ct-xray-tube.glb", [3.2, 1.65, 0]],
  ["DETECTOR ARRAY", "/models/ct-detector-array.glb", [-1.65, -1.65, 0]],
  ["PATIENT TABLE", "/models/ct-patient-table.glb", [1.65, -1.65, 0]],
] as const;

export default function LabPage() {
  return (
    <main style={{ width: "100vw", height: "100vh", background: "#eeeae2" }}>
      <div style={{ position: "fixed", inset: 20, zIndex: 2, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr", pointerEvents: "none" }}>
        {models.map(([label]) => <b key={label} style={{ padding: 12, font: "12px monospace" }}>{label}</b>)}
      </div>
      <Canvas camera={{ position: [0, 0, 11], fov: 42 }}>
        <ambientLight intensity={2} />
        <directionalLight position={[4, 6, 8]} intensity={4} />
        {models.map(([label, url, position]) => (
          <group key={label} position={position} scale={2.1}><FloraModel url={url} /></group>
        ))}
        <Environment preset="studio" />
        <OrbitControls />
      </Canvas>
    </main>
  );
}
