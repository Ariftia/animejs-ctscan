// A schematic axial fan-beam acquisition. Distances use scanner model units.
export const ACQUISITION = {
  channels: 25,
  sourceRadius: 1.47,
  sourceExplode: 0.36,
  focalOffset: 0.39,
  detectorRadius: 1.47,
  detectorExplode: 0.34,
  detectorArc: 0.034,
  detectorWidthRadius: 2.8,
  detectorDepthRadius: 2.8,
  detectorCenterOffset: 0.25,
  radiansPerSecond: 0.65,
} as const;

export const PHANTOM = [
  { x: 0, y: 0, rx: 0.4, ry: 0.55, mu: 0.9 },
  { x: -0.16, y: 0.08, rx: 0.12, ry: 0.26, mu: -0.63 },
  { x: 0.16, y: 0.08, rx: 0.12, ry: 0.26, mu: -0.63 },
  { x: 0, y: -0.28, rx: 0.07, ry: 0.09, mu: 1.8 },
] as const;

export function detectorPoint(channel: number, explode: number) {
  const angle = (channel - (ACQUISITION.channels - 1) / 2) * ACQUISITION.detectorArc;
  return {
    x: -Math.sin(angle) * ACQUISITION.detectorWidthRadius,
    y: -ACQUISITION.detectorRadius - explode * ACQUISITION.detectorExplode - ACQUISITION.detectorCenterOffset + (1 - Math.cos(angle)) * ACQUISITION.detectorDepthRadius,
  };
}

export function transmission(channel: number, rotation: number, explode: number) {
  const target = detectorPoint(channel, explode);
  const sourceY = ACQUISITION.sourceRadius + explode * ACQUISITION.sourceExplode - ACQUISITION.focalOffset;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const sx = -sourceY * sin;
  const sy = sourceY * cos;
  const dx = target.x * cos - target.y * sin - sx;
  const dy = target.x * sin + target.y * cos - sy;
  const length = Math.hypot(dx, dy);
  let attenuation = 0;
  for (const ellipse of PHANTOM) {
    const ox = (sx - ellipse.x) / ellipse.rx;
    const oy = (sy - ellipse.y) / ellipse.ry;
    const vx = dx / ellipse.rx;
    const vy = dy / ellipse.ry;
    const a = vx * vx + vy * vy;
    const b = 2 * (ox * vx + oy * vy);
    const c = ox * ox + oy * oy - 1;
    const discriminant = b * b - 4 * a * c;
    if (discriminant <= 0) continue;
    const near = Math.max(0, (-b - Math.sqrt(discriminant)) / (2 * a));
    const far = Math.min(1, (-b + Math.sqrt(discriminant)) / (2 * a));
    attenuation += Math.max(0, far - near) * length * ellipse.mu;
  }
  return Math.exp(-Math.max(0, attenuation));
}
