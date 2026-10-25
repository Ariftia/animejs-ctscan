"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { DataTexture, DoubleSide, Group, LinearFilter, RGBAFormat, ShaderMaterial } from "three";
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

export function ReconstructionVolume() {
  const { motion } = useExperience();
  const group = useRef<Group>(null);
  const material = useRef<ShaderMaterial>(null);
  const texture = useMemo(() => createSliceTexture(3), []);
  const uniforms = useMemo(() => ({ uMap: { value: texture }, uAlpha: { value: 0 }, uResolve: { value: 0 } }), [texture]);
  useEffect(() => () => texture.dispose(), [texture]);
  useFrame(() => {
    const reveal = motion.current.sliceAlpha;
    if (group.current) {
      group.current.visible = reveal > 0.005;
      group.current.position.z = 1.35 - reveal * 0.18;
      group.current.rotation.y = -0.15 + (1 - reveal) * 0.12;
    }
    if (!material.current) return;
    material.current.uniforms.uAlpha.value = reveal;
    material.current.uniforms.uResolve.value = reveal;
  });
  return (
    <group ref={group} position={[0, 0.04, 1.25]} rotation={[0.04, -0.15, 0]} visible={false}>
      <mesh>
        <planeGeometry args={[1.9, 2.25]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          transparent depthWrite={false} side={DoubleSide}
          vertexShader={`varying vec2 vUv;
            void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
          fragmentShader={`
            uniform sampler2D uMap;
            uniform float uAlpha, uResolve;
            varying vec2 vUv;
            void main() {
              vec3 sharp = texture2D(uMap, vUv).rgb;
              vec2 blur = vec2(0.018 * (1.0 - uResolve));
              vec3 soft = (texture2D(uMap, vUv + blur).rgb + texture2D(uMap, vUv - blur).rgb + sharp) / 3.0;
              float row = 1.0 - vUv.y;
              float acquired = 1.0 - smoothstep(uResolve, uResolve + 0.04, row);
              vec3 color = mix(vec3(0.027), soft, acquired);
              float sweep = (1.0 - smoothstep(0.001, 0.004, abs(row - uResolve))) * (1.0 - step(0.98, uResolve));
              color = mix(color, vec3(0.12, 0.65, 0.69), sweep * 0.65);
              float border = step(0.992, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)) * 2.0);
              color = mix(color, vec3(0.23, 0.3, 0.31), border);
              gl_FragColor = vec4(color, uAlpha);
            }`}
        />
      </mesh>
    </group>
  );
}
