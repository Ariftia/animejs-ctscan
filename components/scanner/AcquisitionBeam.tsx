"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { BufferGeometry, DoubleSide, Float32BufferAttribute, ShaderMaterial } from "three";
import { useExperience } from "@/components/experience/ExperienceContext";
import { ACQUISITION, detectorPoint, PHANTOM } from "./acquisition";

export function AcquisitionBeam() {
  const { motion, reducedMotion } = useExperience();
  const geometry = useMemo(() => {
    const vertices: number[] = [];
    const uvs: number[] = [];
    for (let index = 0; index < ACQUISITION.channels - 1; index += 1) {
      const left = detectorPoint(index, 0);
      const right = detectorPoint(index + 1, 0);
      vertices.push(0, ACQUISITION.sourceRadius - ACQUISITION.focalOffset, 0.04, left.x, left.y, 0.24, right.x, right.y, 0.24);
      uvs.push((index + 0.5) / (ACQUISITION.channels - 1), 0, index / (ACQUISITION.channels - 1), 1, (index + 1) / (ACQUISITION.channels - 1), 1);
    }
    const next = new BufferGeometry();
    next.setAttribute("position", new Float32BufferAttribute(vertices, 3));
    next.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    return next;
  }, []);
  const material = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({
    uTime: { value: 0 }, uAlpha: { value: 0 }, uExplode: { value: 0 },
    uRotation: { value: 0 }, uPatient: { value: 0 }, uReduced: { value: 0 },
  }), []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((state) => {
    if (!material.current) return;
    const live = material.current.uniforms;
    const m = motion.current;
    live.uTime.value = reducedMotion ? 0 : state.clock.elapsedTime;
    live.uAlpha.value = m.beamAlpha;
    live.uExplode.value = m.explode;
    live.uRotation.value = m.scanAngle;
    live.uPatient.value = Math.min(1, m.patientAlpha / 0.3);
    live.uReduced.value = reducedMotion ? 1 : 0;
  });
  return (
    <mesh geometry={geometry} frustumCulled={false} userData={{ noSurfaceFade: true }}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={DoubleSide}
        vertexShader={`
          uniform float uExplode;
          varying vec2 vUv;
          varying vec2 vPosition;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.y += mix(${ACQUISITION.sourceExplode}, -${ACQUISITION.detectorExplode}, uv.y) * uExplode;
            vPosition = p.xy;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime, uAlpha, uExplode, uRotation, uPatient, uReduced;
          varying vec2 vUv;
          varying vec2 vPosition;
          float pathLength(vec2 origin, vec2 point, vec2 center, vec2 radius) {
            vec2 direction = point - origin;
            float distance = length(direction);
            vec2 o = (origin - center) / radius;
            vec2 d = normalize(direction) / radius;
            float a = dot(d, d);
            float b = dot(o, d);
            float c = dot(o, o) - 1.0;
            float disc = b * b - a * c;
            if (disc <= 0.0) return 0.0;
            float near = (-b - sqrt(disc)) / a;
            float far = (-b + sqrt(disc)) / a;
            return max(0.0, min(distance, far) - max(0.0, near));
          }
          void main() {
            float c = cos(uRotation), s = sin(uRotation);
            mat2 rotation = mat2(c, s, -s, c);
            vec2 source = rotation * vec2(0.0, ${ACQUISITION.sourceRadius - ACQUISITION.focalOffset} + uExplode * ${ACQUISITION.sourceExplode});
            vec2 point = rotation * vPosition;
            float attenuation = 0.0;
            ${PHANTOM.map(e => `attenuation += pathLength(source, point, vec2(${e.x.toFixed(3)}, ${e.y.toFixed(3)}), vec2(${e.rx}, ${e.ry})) * ${e.mu};`).join("\n")}
            float intensity = exp(-max(0.0, attenuation) * uPatient);
            float sourceY = ${ACQUISITION.sourceRadius - ACQUISITION.focalOffset} + uExplode * ${ACQUISITION.sourceExplode};
            float rayAngle = atan(vPosition.x, sourceY - vPosition.y);
            float channel = abs(fract(rayAngle / ${ACQUISITION.detectorArc} + 0.5) - 0.5);
            float rays = 1.0 - smoothstep(0.045, 0.11, channel);
            float front = pow(max(0.0, sin(vUv.y * 32.0 - uTime * 4.0)), 12.0) * (1.0 - uReduced);
            float edge = smoothstep(0.0, 0.035, vUv.x) * smoothstep(0.0, 0.035, 1.0 - vUv.x);
            float alpha = uAlpha * intensity * (0.14 + rays * (0.45 + front * 0.65)) * edge;
            gl_FragColor = vec4(mix(vec3(0.13, 0.62, 0.68), vec3(0.4, 0.94, 1.0), intensity), alpha);
          }
        `}
      />
    </mesh>
  );
}
