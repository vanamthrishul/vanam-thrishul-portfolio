export type Vec3 = [number, number, number];
export type Edge = [number, number];

const PHI = 1.618033988749895;

export const ICOSAHEDRON_VERTICES: Vec3[] = [
  [-1, PHI, 0], [1, PHI, 0], [-1, -PHI, 0], [1, -PHI, 0],
  [0, -1, PHI], [0, 1, PHI], [0, -1, -PHI], [0, 1, -PHI],
  [PHI, 0, -1], [PHI, 0, 1], [-PHI, 0, -1], [-PHI, 0, 1],
];

function distance(a: Vec3, b: Vec3): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/** Edges derived from nearest-neighbor distance — every vertex pair
 * within 5% of the shortest edge length counts as connected. */
export function buildIcosahedronEdges(vertices: Vec3[] = ICOSAHEDRON_VERTICES): Edge[] {
  const dists: number[] = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      dists.push(distance(vertices[i], vertices[j]));
    }
  }
  const minDist = Math.min(...dists);

  const edges: Edge[] = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      if (distance(vertices[i], vertices[j]) < minDist * 1.05) {
        edges.push([i, j]);
      }
    }
  }
  return edges;
}

export type ProjectedPoint = { x: number; y: number; z: number };

/** Rotates a vertex around X then Y and projects it with a simple
 * perspective divide, centered at (cx, cy) with the given radius. */
export function projectVertex(
  v: Vec3,
  angleX: number,
  angleY: number,
  cx: number,
  cy: number,
  radius: number,
  perspective = 4.4
): ProjectedPoint {
  const y1 = v[1] * Math.cos(angleX) - v[2] * Math.sin(angleX);
  const z1 = v[1] * Math.sin(angleX) + v[2] * Math.cos(angleX);
  const x2 = v[0] * Math.cos(angleY) + z1 * Math.sin(angleY);
  const z2 = -v[0] * Math.sin(angleY) + z1 * Math.cos(angleY);
  const scale = perspective / (perspective - z2);
  return { x: cx + x2 * radius * scale, y: cy + y1 * radius * scale, z: z2 };
}
