export type CTComponent = {
  id: string;
  label: string;
  description: string;
  explanation: string;
};

export const CT_COMPONENTS: CTComponent[] = [
  {
    id: "gantry",
    label: "Gantry housing",
    description: "The protective enclosure surrounding the rotating imaging system.",
    explanation: "The housing separates the patient space from the moving machinery. Its central opening, or bore, lets the table pass through while the source and detector rotate inside.",
  },
  {
    id: "rotation",
    label: "Rotation system",
    description: "A high-speed ring carries the source and detector around the patient.",
    explanation: "The ring keeps the source and detector aligned on opposite sides of the patient. Each angle contributes another projection, giving reconstruction measurements from many directions.",
  },
  {
    id: "source",
    label: "X-ray source",
    description: "A compact, cooled tube produces a fan-shaped beam of X-rays.",
    explanation: "The tube sends a fan-shaped beam through the body toward the detector. Different paths lose different amounts of intensity, encoding information about the tissues along each path.",
  },
  {
    id: "detector",
    label: "Detector array",
    description: "Segmented detector cells measure the transmitted X-ray intensity.",
    explanation: "Each channel records the X-rays that reach it. In this illustrated detector, a scintillator converts X-rays to light before electronics turn that light into a digital signal.",
  },
  {
    id: "table",
    label: "Patient table",
    description: "The motorized table positions the patient precisely through the bore.",
    explanation: "Controlled table motion positions the anatomy within the imaging plane. Moving it along the bore lets the scanner sample successive cross-sections of the object.",
  },
];
