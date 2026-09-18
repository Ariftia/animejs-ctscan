export type CTComponent = {
  id: string;
  label: string;
  description: string;
  model?: string;
  transform: {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
  };
};

export const CT_COMPONENTS: CTComponent[] = [
  {
    id: "gantry",
    label: "Gantry housing",
    model: "/models/ct-gantry-housing.glb",
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 5.05 },
    description: "The protective enclosure surrounding the rotating imaging system.",
  },
  {
    id: "rotation",
    label: "Rotation system",
    model: "/models/ct-rotation-ring.glb",
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 2.78 },
    description: "A high-speed ring carries the source and detector around the patient.",
  },
  {
    id: "source",
    label: "X-ray source",
    model: "/models/ct-xray-tube.glb",
    transform: { position: [0, 0, 0], rotation: [Math.PI / 2, 0, 0], scale: 0.86 },
    description: "A compact, cooled tube produces a fan-shaped beam of X-rays.",
  },
  {
    id: "detector",
    label: "Detector array",
    model: "/models/ct-detector-array.glb",
    transform: { position: [0, 0, 0], rotation: [0, 0, Math.PI / 2], scale: 1.36 },
    description: "Segmented detector cells measure the transmitted X-ray intensity.",
  },
  {
    id: "table",
    label: "Patient table",
    model: "/models/ct-patient-table.glb",
    transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: 4.35 },
    description: "The motorized table positions the patient precisely through the bore.",
  },
];
