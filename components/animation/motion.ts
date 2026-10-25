export type MotionState = {
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  lookX: number;
  machineX: number;
  machineY: number;
  machineRotY: number;
  outlineAlpha: number;
  surfaceAlpha: number;
  explode: number;
  housingAlpha: number;
  ringRotation: number;
  scanAngle: number;
  beamAlpha: number;
  patientAlpha: number;
  detectorPulse: number;
  tableFeed: number;
  dataAlpha: number;
  sinogramAlpha: number;
  reconstructionAlpha: number;
  sliceAlpha: number;
};

export const createMotionState = (): MotionState => ({
  cameraX: 3.7,
  cameraY: 2,
  cameraZ: 7.5,
  lookX: 0.3,
  machineX: 0.8,
  machineY: 0,
  machineRotY: 0.08,
  outlineAlpha: 0.56,
  surfaceAlpha: 0.96,
  explode: 0,
  housingAlpha: 1,
  ringRotation: 0,
  scanAngle: 0,
  beamAlpha: 0,
  patientAlpha: 0,
  detectorPulse: 0,
  tableFeed: 0,
  dataAlpha: 0,
  sinogramAlpha: 0,
  reconstructionAlpha: 0,
  sliceAlpha: 0,
});
