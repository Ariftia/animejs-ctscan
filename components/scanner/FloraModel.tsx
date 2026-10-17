"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
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
        cloned.forEach((material) => {
          if (material instanceof MeshStandardMaterial) {
            if (color) material.color.set(color);
            material.roughness = 0.32;
            material.metalness = 0.12;
            material.envMapIntensity = 0.8;
          }
        });
        child.material = Array.isArray(child.material) ? cloned : cloned[0];
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
    return next;
  }, [color, gltf.scene]);
  useEffect(() => () => {
    scene.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    });
  }, [scene]);
  return <primitive object={scene} name={name} />;
}

useGLTF.preload("/models/ct-gantry-housing.glb");
useGLTF.preload("/models/ct-patient-table.glb");
