"use client";

import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import { ColorRepresentation, Group, Material, Mesh, MeshStandardMaterial } from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

type FloraModelProps = {
  url: string;
  name?: string;
  color?: ColorRepresentation;
};

export function FloraModel({ url, name, color }: FloraModelProps) {
  const gltf = useGLTF(url);
  const scene = useMemo(() => {
    const next = clone(gltf.scene) as Group;
    next.traverse((child) => {
      if (child instanceof Mesh) {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const cloned = materials.map((material: Material) => material.clone());
        if (color) {
          cloned.forEach((material) => {
            if (material instanceof MeshStandardMaterial) material.color.set(color);
          });
        }
        child.material = Array.isArray(child.material) ? cloned : cloned[0];
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    return next;
  }, [color, gltf.scene]);
  return <primitive object={scene} name={name} />;
}

useGLTF.preload("/models/ct-gantry-housing.glb");
useGLTF.preload("/models/ct-rotation-ring.glb");
useGLTF.preload("/models/ct-xray-tube.glb");
useGLTF.preload("/models/ct-detector-array.glb");
useGLTF.preload("/models/ct-patient-table.glb");
