"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { CTScanner } from "./CTScanner";
import { CTCamera } from "./CTCamera";

export function CTCanvas() {
  return (
    <Canvas
      camera={{ position: [4.8, 2.5, 7.8], fov: 36, near: 0.1, far: 100 }}
      dpr={[1, 1.55]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      fallback={<div className="webgl-fallback">Interactive model unavailable. The full CT story remains below.</div>}
    >
      <color attach="background" args={["#f3f1eb"]} />
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 7, 8]} intensity={2.35} />
      <directionalLight position={[-4, 2, 4]} intensity={1.05} color="#d9f5f5" />
      <pointLight position={[0, -2, 4]} intensity={0.45} color="#ffffff" />
      <CTScanner />
      <mesh position={[0, -2.08, 0.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.8, 0.72, 1]} receiveShadow>
        <circleGeometry args={[2.4, 64]} />
        <meshBasicMaterial color="#8d9b99" transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <Environment preset="studio" environmentIntensity={0.22} />
      <CTCamera />
    </Canvas>
  );
}
