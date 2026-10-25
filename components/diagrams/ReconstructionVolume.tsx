"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { DataTexture, DoubleSide, Group, LinearFilter, RGBAFormat, ShaderMaterial } from "three";
import { useExperience } from "@/components/experience/ExperienceContext";
import { createPhantomSlice, PHANTOM_VOLUME } from "@/components/scanner/acquisition";

// The object and every reconstructed cross-section use the same phantom geometry.
export function createSliceTexture(slice: number, size = 512) {
  const texture = new DataTexture(createPhantomSlice(slice, size), size, size, RGBAFormat);
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const SLICE_COUNT = PHANTOM_VOLUME.sliceCount;

export function ReconstructionVolume() {
  const { motion, reducedMotion } = useExperience();
  const group = useRef<Group>(null);
  const materials = useRef<ShaderMaterial[]>([]);
  const textures = useMemo(() => Array.from({ length: SLICE_COUNT }, (_, i) => createSliceTexture(i * 0.5)), []);
  const uniformsList = useMemo(() => textures.map((texture) => ({
    uMap: { value: texture },
    uAlpha: { value: 0 },
    uResolve: { value: 0 },
  })), [textures]);

  useEffect(() => () => textures.forEach((tex) => tex.dispose()), [textures]);

  useFrame(() => {
    const reveal = motion.current.sliceAlpha;
    if (group.current) {
      group.current.visible = reveal > 0.005;
    }
    materials.current.forEach((material, index) => {
      if (!material) return;
      // Progressive stacking: scan slices sweep and resolve one by one into a solid 3D object
      const sliceDelay = reducedMotion ? 0 : (index / SLICE_COUNT) * 0.45;
      const sliceReveal = Math.min(1, Math.max(0, (reveal - sliceDelay) / (1 - sliceDelay)));
      material.uniforms.uAlpha.value = sliceReveal * 0.88;
      material.uniforms.uResolve.value = reducedMotion ? 1 : sliceReveal;
    });
  });

  return (
    <group ref={group} position={[0, 0, PHANTOM_VOLUME.centerZ]} visible={false}>
      {Array.from({ length: SLICE_COUNT }, (_, index) => {
        const depth = (index / (SLICE_COUNT - 1) - 0.5) * PHANTOM_VOLUME.depth;
        return (
          <mesh key={index} position={[0, 0, depth]}>
            <planeGeometry args={[PHANTOM_VOLUME.width, PHANTOM_VOLUME.height]} />
            <shaderMaterial
              ref={(mat) => { if (mat) materials.current[index] = mat; }}
              uniforms={uniformsList[index]}
              transparent depthWrite={false} side={DoubleSide}
              vertexShader={`varying vec2 vUv;
                void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
              fragmentShader={`
                uniform sampler2D uMap;
                uniform float uAlpha, uResolve;
                varying vec2 vUv;
                void main() {
                  vec4 sampleValue = texture2D(uMap, vUv);
                  vec3 sharp = sampleValue.rgb;
                  vec2 blur = vec2(0.015 * (1.0 - uResolve));
                  vec3 soft = (texture2D(uMap, vUv + blur).rgb + texture2D(uMap, vUv - blur).rgb + sharp) / 3.0;
                  float row = 1.0 - vUv.y;
                  float acquired = 1.0 - smoothstep(uResolve, uResolve + 0.04, row);
                  vec3 color = mix(vec3(0.02), soft, acquired);
                  float sweep = (1.0 - smoothstep(0.001, 0.004, abs(row - uResolve))) * (1.0 - step(0.98, uResolve));
                  color = mix(color, vec3(0.15, 0.88, 0.95), sweep * 0.75);
                  float alphaMask = sampleValue.a;
                  gl_FragColor = vec4(color, uAlpha * alphaMask * acquired);
                }`}
            />
          </mesh>
        );
      })}
    </group>
  );
}
