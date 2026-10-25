"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Group, LineSegments, Material, Mesh, Object3D } from "three";
import { useExperience } from "./ExperienceContext";
import {
  DetectorArray,
  HousingBase,
  HousingCrown,
  HousingHalf,
  PatientPhantom,
  RotationRing,
  XRayTube,
} from "@/components/scanner/EngineeredParts";
import { AcquisitionBeam } from "@/components/scanner/AcquisitionBeam";
import { ACQUISITION } from "@/components/scanner/acquisition";
import { ProductHousing, ProductTable } from "@/components/scanner/ProductExterior";
import { DataVisuals } from "@/components/diagrams/DataVisuals";
import { rangeProgress, SCENES } from "@/components/animation/ranges";

type FadeMaterial = Material & { opacity: number; transparent: boolean };

function isFloraObject(object: Object3D, root: Object3D) {
  let current: Object3D | null = object;
  while (current && current !== root) {
    if (current.userData.presentation === "flora") return true;
    current = current.parent;
  }
  return false;
}

function collectMaterials(root: Object3D) {
  const proceduralSurfaces: FadeMaterial[] = [];
  const floraSurfaces: FadeMaterial[] = [];
  const outlines: FadeMaterial[] = [];
  root.traverse((object) => {
    if (object.userData.noSurfaceFade) return;
    if (object instanceof LineSegments) {
      const next = Array.isArray(object.material) ? object.material : [object.material];
      next.forEach((material) => outlines.push(material as FadeMaterial));
    } else if (object instanceof Mesh) {
      const next = Array.isArray(object.material) ? object.material : [object.material];
      next.forEach((material) => {
        if ("wireframe" in material && material.wireframe) outlines.push(material as FadeMaterial);
        else if (isFloraObject(object, root)) floraSurfaces.push(material as FadeMaterial);
        else proceduralSurfaces.push(material as FadeMaterial);
      });
    }
  });
  return { proceduralSurfaces, floraSurfaces, outlines };
}

function setObjectOpacity(root: Object3D, opacity: number) {
  root.traverse((object) => {
    if (!(object instanceof Mesh) || object.userData.noSurfaceFade) return;
    const next = Array.isArray(object.material) ? object.material : [object.material];
    next.forEach((material) => {
      const fade = material as FadeMaterial;
      fade.transparent = true;
      fade.opacity = opacity;
      fade.depthWrite = opacity > 0.9;
    });
  });
}


export function CTScanner() {
  const { motion, progressRef, selected, setSelected, activeScene, reducedMotion } = useExperience();
  const { size } = useThree();
  const root = useRef<Group>(null);
  const scanOffset = useRef(0);
  const assembly = useRef<Group>(null);
  const housingLeft = useRef<Group>(null);
  const housingRight = useRef<Group>(null);
  const housingBase = useRef<Group>(null);
  const housingCrown = useRef<Group>(null);
  const floraHousing = useRef<Group>(null);
  const ring = useRef<Group>(null);
  const ringFrame = useRef<Group>(null);
  const table = useRef<Group>(null);
  const tube = useRef<Group>(null);
  const detector = useRef<Group>(null);
  const materials = useRef<{
    proceduralSurfaces: FadeMaterial[];
    floraSurfaces: FadeMaterial[];
    outlines: FadeMaterial[];
  }>({ proceduralSurfaces: [], floraSurfaces: [], outlines: [] });

  useEffect(() => {
    if (assembly.current) materials.current = collectMaterials(assembly.current);
  }, [selected]);

  useFrame((_, delta) => {
    const m = motion.current;
    if (!root.current || !housingLeft.current || !housingRight.current || !housingBase.current || !housingCrown.current || !floraHousing.current || !ring.current || !table.current || !tube.current || !detector.current) return;

    root.current.position.set(size.width <= 800 ? m.machineX * 0.15 : m.machineX, m.machineY - 0.05, 0);
    root.current.rotation.y = m.machineRotY;

    housingLeft.current.position.x = -m.explode * 1.42;
    housingLeft.current.position.z = m.explode * 0.08;
    housingRight.current.position.x = m.explode * 1.42;
    housingRight.current.position.z = m.explode * 0.08;
    housingBase.current.position.y = -m.explode * 0.26;
    housingCrown.current.position.y = m.explode * 0.4;
    floraHousing.current.position.set(-m.explode * 2.25, m.explode * 0.08, m.explode * 0.08);

    ring.current.position.z = -0.25 - m.explode * 0.88;
    if (!reducedMotion && m.beamAlpha > 0.005) {
      scanOffset.current = (scanOffset.current + Math.min(delta, 0.05) * ACQUISITION.radiansPerSecond) % (Math.PI * 2);
    }
    if (reducedMotion || m.beamAlpha <= 0.005) scanOffset.current = 0;
    m.scanAngle = m.ringRotation + scanOffset.current * Math.min(1, m.beamAlpha / 0.12);
    ring.current.rotation.z = m.scanAngle;
    tube.current.position.y = ACQUISITION.sourceRadius + m.explode * ACQUISITION.sourceExplode;
    detector.current.position.y = -ACQUISITION.detectorRadius - m.explode * ACQUISITION.detectorExplode;

    // Match the gantry floor while keeping the deck inside the bore liner.
    table.current.position.y = -1.04 - m.explode * 0.55;
    table.current.position.z = 1.38 - m.tableFeed * 0.42 + m.explode * 1.15;

    const hardwareAlpha = 1 - m.reconstructionAlpha;
    const progress = progressRef.current;
    const ringAlpha = rangeProgress(progress, SCENES.INTRO);
    const tableAlpha = 1 - rangeProgress(progress, SCENES.GANTRY) + rangeProgress(progress, SCENES.REASSEMBLY);
    if (assembly.current) assembly.current.visible = hardwareAlpha > 0.005;

    materials.current.proceduralSurfaces.forEach((material) => {
      material.transparent = true;
      material.opacity = m.surfaceAlpha * hardwareAlpha;
      material.depthWrite = material.opacity > 0.9;
    });
    materials.current.floraSurfaces.forEach((material) => {
      material.transparent = true;
      material.opacity = m.surfaceAlpha * hardwareAlpha;
      material.depthWrite = material.opacity > 0.9;
    });
    materials.current.outlines.forEach((material) => {
      material.transparent = true;
      material.opacity = m.outlineAlpha * 0.45 * hardwareAlpha;
      material.depthWrite = false;
    });
    const shellReveal = Math.min(1, m.explode * 4);
    setObjectOpacity(floraHousing.current, m.surfaceAlpha * m.housingAlpha * (1 - shellReveal) * hardwareAlpha);
    [housingLeft.current, housingRight.current, housingBase.current, housingCrown.current].forEach((part) => {
      setObjectOpacity(part, m.surfaceAlpha * m.housingAlpha * shellReveal * hardwareAlpha);
    });
    setObjectOpacity(ring.current, m.surfaceAlpha * hardwareAlpha * ringAlpha);
    setObjectOpacity(table.current, m.surfaceAlpha * hardwareAlpha * tableAlpha);

    const isolated = activeScene === "EXPLORER" ? selected : null;
    const revealingInternal = isolated !== null && isolated !== "gantry";
    const showShell = m.housingAlpha * shellReveal * hardwareAlpha > 0.005 && !revealingInternal;
    housingLeft.current.visible = showShell;
    housingRight.current.visible = showShell;
    housingBase.current.visible = showShell;
    housingCrown.current.visible = showShell;
    floraHousing.current.visible = m.housingAlpha * (1 - shellReveal) * hardwareAlpha > 0.005 && !revealingInternal;
    ring.current.visible = (ringAlpha > 0.005 || revealingInternal) && (!isolated || ["rotation", "source", "detector"].includes(isolated));
    if (ringFrame.current) ringFrame.current.visible = !isolated || isolated === "rotation";
    tube.current.visible = !isolated || isolated === "rotation" || isolated === "source";
    detector.current.visible = !isolated || isolated === "rotation" || isolated === "detector";
    table.current.visible = tableAlpha > 0.005 && (!isolated || isolated === "table");
  }, -1);

  const explorer = activeScene === "EXPLORER";
  const pick = (id: string) => explorer && setSelected(selected === id ? null : id);

  return (
    <group ref={root} scale={0.7}>
      <group ref={assembly}>
        <group
          ref={floraHousing}
          name="ct-part-gantry"
          userData={{ presentation: "flora" }}
          onClick={(event) => { event.stopPropagation(); pick("gantry"); }}
        >
          <ProductHousing selected={selected === "gantry"} />
        </group>

        <group ref={housingLeft} onClick={(event) => { event.stopPropagation(); pick("gantry"); }}>
          <HousingHalf side="left" selected={selected === "gantry"} />
        </group>
        <group ref={housingRight} onClick={(event) => { event.stopPropagation(); pick("gantry"); }}>
          <HousingHalf side="right" selected={selected === "gantry"} />
        </group>
        <group ref={housingBase} onClick={(event) => { event.stopPropagation(); pick("gantry"); }}>
          <HousingBase selected={selected === "gantry"} />
        </group>
        <group ref={housingCrown} onClick={(event) => { event.stopPropagation(); pick("gantry"); }}>
          <HousingCrown selected={selected === "gantry"} />
        </group>

        <group name="ct-part-rotation" ref={ring} position={[0, 0, -0.25]} onClick={(event) => { event.stopPropagation(); pick("rotation"); }}>
          <group ref={ringFrame}><RotationRing selected={selected === "rotation"} /></group>
          <AcquisitionBeam />
          <group name="ct-part-source" ref={tube} position={[0, 1.47, 0.04]} onClick={(event) => { event.stopPropagation(); pick("source"); }}>
            <XRayTube selected={selected === "source"} />
          </group>
          <group name="ct-part-detector" ref={detector} position={[0, -1.47, 0.04]} rotation={[0, 0, Math.PI]} onClick={(event) => { event.stopPropagation(); pick("detector"); }}>
            <DetectorArray selected={selected === "detector"} />
          </group>
        </group>

        <group name="ct-part-table" ref={table} position={[0, -1.04, 1.38]} onClick={(event) => { event.stopPropagation(); pick("table"); }}>
          <ProductTable selected={selected === "table"} />
        </group>
      </group>

      <PatientPhantom />
      <DataVisuals />
    </group>
  );
}
