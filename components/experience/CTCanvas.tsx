"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
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
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 7, 5]} intensity={2.1} color="#fff7ec" />
      <directionalLight position={[-4, 2, 3]} intensity={0.7} color="#d9f5f5" />
      <directionalLight position={[2, 4, -5]} intensity={1.4} color="#e9f3ff" />
      <CTScanner />
      <mesh position={[0.6, -1.65, 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 5]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          vertexShader={`varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`}
          fragmentShader={`varying vec2 vUv;
            void main() {
              float radius = length((vUv - 0.5) * 2.0);
              float shadow = exp(-radius * radius * 5.5) * (1.0 - smoothstep(0.65, 1.0, radius));
              gl_FragColor = vec4(0.18, 0.24, 0.23, shadow * 0.19);
            }`}
        />
      </mesh>
      <Environment resolution={128} frames={1} environmentIntensity={0.65}>
        <Lightformer position={[-3, 5, 3]} scale={[5, 5, 1]} intensity={3} />
        <Lightformer position={[4, 2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[2, 5, 1]} intensity={2} />
        <Lightformer position={[0, 3, -4]} rotation={[0, Math.PI, 0]} scale={[4, 2, 1]} intensity={2} />
      </Environment>
      <CTCamera />
    </Canvas>
  );
}
