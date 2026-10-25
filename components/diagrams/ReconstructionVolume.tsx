"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { DataTexture, DoubleSide, Group, Mesh, LinearFilter, RGBAFormat, ShaderMaterial } from "three";
import { useExperience } from "@/components/experience/ExperienceContext";
import { PHANTOM } from "@/components/scanner/acquisition";

function ellipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number) {
  return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
}

// Synthetic anatomy, sharing the acquisition phantom's body, lungs and spine.
// This is an educational illustration rather than a patient image.
export function createSliceTexture(slice: number, size = 512) {
  const pixels = new Uint8Array(size * size * 4);
  const taper = 1 - Math.abs(slice - 3) * 0.018;
  const body = PHANTOM[0];
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const x = ((column / (size - 1)) * 2 - 1) * 0.51;
      const y = ((row / (size - 1)) * 2 - 1) * 0.67;
      const contour = ellipse(x, y, 0, 0, body.rx * taper, body.ry * taper);
      let intensity = 9;
      if (contour < 1) {
        const texture = Math.sin(x * 473 + y * 157 + slice) * Math.cos(y * 397 - x * 131 - slice) * 7;
        intensity = 115 + texture;
        if (contour > 0.85) intensity = 73 + texture;
        if (contour > 0.96) intensity = 165;
        for (const lung of PHANTOM.slice(1, 3)) {
          const cx = lung.x * taper;
          const cy = lung.y + (slice - 3) * 0.006;
          if (ellipse(x, y, cx, cy, lung.rx * taper, lung.ry) < 1) {
            intensity = 24 + texture * 0.85;
            const branch = Math.abs(x - cx - Math.sin(y * 12 + slice * 0.15) * 0.025);
            if (branch < 0.007 && Math.abs(y - cy) < 0.19) intensity = 105;
            if (ellipse(x, y, cx + 0.035, cy - 0.035, 0.018, 0.025) < 1) intensity = 145;
          }
        }
        if (ellipse(x, y, 0.018, -0.045, 0.1, 0.14) < 1) intensity = 153 + texture;
        const spine = PHANTOM[3];
        const vertebra = ellipse(x, y, spine.x, spine.y, spine.rx, spine.ry);
        if (vertebra < 1) intensity = vertebra > 0.62 ? 235 : 166 + texture;
        if (ellipse(x, y, 0, -0.29, 0.025, 0.032) < 1) intensity = 40;
        for (let rib = 0; rib < 10; rib += 1) {
          const angle = (rib / 10) * Math.PI * 2 + 0.12;
          const dx = x - Math.cos(angle) * 0.335 * taper;
          const dy = y - Math.sin(angle) * 0.455 * taper;
          const tangent = -dx * Math.sin(angle) + dy * Math.cos(angle);
          const radial = dx * Math.cos(angle) + dy * Math.sin(angle);
          const bone = (tangent / 0.031) ** 2 + (radial / 0.015) ** 2;
          if (bone < 1) intensity = bone > 0.45 ? 235 : 144 + texture;
        }
      }
      const offset = (row * size + column) * 4;
      pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = Math.round(intensity);
      pixels[offset + 3] = 255;
    }
  }
  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

const SLICE_COUNT = 15;

export function ReconstructionVolume() {
  const { motion, reducedMotion } = useExperience();
  const group = useRef<Group>(null);
  const materials = useRef<ShaderMaterial[]>([]);
  const slices = useRef<Mesh[]>([]);
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
      // Position volume directly inside the gantry scanner bore right where the patient sits!
      group.current.position.set(0, 0.04, 0.15 - reveal * 0.1);
      group.current.rotation.y = reducedMotion ? 0.17 : -0.15 + reveal * 0.32;
      group.current.rotation.x = reducedMotion ? 0.18 : 0.04 + reveal * 0.14;
    }
    materials.current.forEach((material, index) => {
      if (!material) return;
      // Progressive stacking: scan slices sweep and resolve one by one into a solid 3D object
      const sliceDelay = reducedMotion ? 0 : (index / SLICE_COUNT) * 0.45;
      const sliceReveal = Math.min(1, Math.max(0, (reveal - sliceDelay) / (1 - sliceDelay)));
      material.uniforms.uAlpha.value = sliceReveal * 0.88;
      material.uniforms.uResolve.value = reducedMotion ? 1 : sliceReveal;
      const slice = slices.current[index];
      if (slice) {
        const spread = index - Math.floor(SLICE_COUNT / 2);
        slice.position.z = spread * (0.085 + (reducedMotion ? 0 : (1 - sliceReveal) * 0.06));
      }
    });
  });

  return (
    <group ref={group} position={[0, 0.04, 0.15]} rotation={[0.04, -0.15, 0]} visible={false}>
      {/* Synthetic cross-sections gather into a compact volume as they resolve. */}
      {Array.from({ length: SLICE_COUNT }, (_, index) => {
        const spread = index - Math.floor(SLICE_COUNT / 2);
        return (
          <mesh key={index} ref={(mesh) => { if (mesh) slices.current[index] = mesh; }} position={[0, 0, spread * 0.085]}>
            <planeGeometry args={[1.7, 2.05]} />
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
                  vec3 sharp = texture2D(uMap, vUv).rgb;
                  vec2 blur = vec2(0.015 * (1.0 - uResolve));
                  vec3 soft = (texture2D(uMap, vUv + blur).rgb + texture2D(uMap, vUv - blur).rgb + sharp) / 3.0;
                  float row = 1.0 - vUv.y;
                  float acquired = 1.0 - smoothstep(uResolve, uResolve + 0.04, row);
                  vec3 color = mix(vec3(0.02), soft, acquired);
                  float sweep = (1.0 - smoothstep(0.001, 0.004, abs(row - uResolve))) * (1.0 - step(0.98, uResolve));
                  color = mix(color, vec3(0.15, 0.88, 0.95), sweep * 0.75);
                  // Exclude the synthetic background while retaining the low-density lungs.
                  float alphaMask = smoothstep(0.04, 0.08, sharp.r);
                  gl_FragColor = vec4(color, uAlpha * alphaMask * acquired);
                }`}
            />
          </mesh>
        );
      })}
    </group>
  );
}
