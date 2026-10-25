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
  radiansPerSecond: 0.2,
} as const;

export const PHANTOM = [
  { x: 0, y: 0, rx: 0.4, ry: 0.55, mu: 0.9 },
  { x: -0.16, y: 0.08, rx: 0.12, ry: 0.26, mu: -0.63 },
  { x: 0.16, y: 0.08, rx: 0.12, ry: 0.26, mu: -0.63 },
  { x: 0, y: -0.28, rx: 0.07, ry: 0.09, mu: 1.8 },
] as const;

// Shared model-space bounds for the scanned object and its axial reconstruction.
export const PHANTOM_VOLUME = {
  centerZ: -0.25,
  depth: 1.6,
  sliceCount: 15,
  width: 1.02,
  height: 1.34,
} as const;

export function createPhantomSlice(slice: number, size = 512) {
  const pixels = new Uint8Array(size * size * 4);
  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      const x = (column / (size - 1) - 0.5) * PHANTOM_VOLUME.width;
      const y = (row / (size - 1) - 0.5) * PHANTOM_VOLUME.height;
      let tissue = -1;
      PHANTOM.forEach((part, index) => {
        if (((x - part.x) / part.rx) ** 2 + ((y - part.y) / part.ry) ** 2 < 1) tissue = index;
      });
      const texture = Math.sin(x * 473 + y * 157 + slice) * Math.cos(y * 397 - x * 131 - slice) * 5;
      const intensity = tissue < 0 ? 0 : tissue === 0 ? 115 : tissue === 3 ? 225 : 26;
      const offset = (row * size + column) * 4;
      pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = tissue < 0 ? 0 : Math.round(intensity + texture);
      pixels[offset + 3] = tissue < 0 ? 0 : 255;
    }
  }
  return pixels;
}

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
