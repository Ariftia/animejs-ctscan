export const SCENES = {
  HERO: [0, 0.045],
  INTRO: [0.045, 0.136],
  EXPLODE: [0.136, 0.227],
  GANTRY: [0.227, 0.318],
  XRAY: [0.318, 0.409],
  ATTENUATION: [0.409, 0.5],
  DETECTOR: [0.5, 0.591],
  PROJECTION: [0.591, 0.682],
  SINOGRAM: [0.682, 0.773],
  RECONSTRUCTION: [0.773, 0.864],
  REASSEMBLY: [0.864, 0.955],
  EXPLORER: [0.955, 1],
} as const;

export type SceneKey = keyof typeof SCENES;

export const SCENE_ORDER = Object.keys(SCENES) as SceneKey[];

export function sceneAt(progress: number): SceneKey {
  return SCENE_ORDER.find((key) => progress <= SCENES[key][1]) ?? "EXPLORER";
}

export function rangeProgress(progress: number, range: readonly [number, number]) {
  return Math.min(1, Math.max(0, (progress - range[0]) / (range[1] - range[0])));
}
