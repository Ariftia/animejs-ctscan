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
  dataAlpha: number;
  sinogramAlpha: number;
  reconstructionAlpha: number;
  sliceAlpha: number;
};

export const createMotionState = (): MotionState => ({
  cameraX: 4.8,
  cameraY: 2.5,
  cameraZ: 7.8,
  lookX: 0,
  machineX: 0.8,
  machineY: 0,
  machineRotY: 0.02,
  outlineAlpha: 0.56,
  surfaceAlpha: 0.96,
  explode: 0,
  housingAlpha: 1,
  ringRotation: 0,
  scanAngle: 0,
  beamAlpha: 0,
  patientAlpha: 0,
  detectorPulse: 0,
  dataAlpha: 0,
  sinogramAlpha: 0,
  reconstructionAlpha: 0,
  sliceAlpha: 0,
});
