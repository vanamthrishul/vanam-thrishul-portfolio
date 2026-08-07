export type Vec3 = [number, number, number];
export type Edge = [number, number];

/**
 * Procedurally builds a low-poly wireframe trident: a twisted faceted
 * shaft with a pyramid pommel, a crossguard, and three tapering
 * diamond-section prongs (outer two staggered in z so the silhouette
 * never goes fully edge-on flat while it spins). Coordinates are in
 * the same normalized space icosahedron.ts used to occupy (roughly
 * [-3, 3]) so the existing canvas radius/perspective math still applies.
 */
function buildTrident(): { vertices: Vec3[]; edges: Edge[] } {
  const vertices: Vec3[] = [];
  const edges: Edge[] = [];

  function addVertex(v: Vec3): number {
    vertices.push(v);
    return vertices.length - 1;
  }
  function addEdge(a: number, b: number) {
    edges.push([a, b]);
  }

  // ---- shaft: three twisted square rings ----
  const shaftRadius = 0.11;
  const ringHeights = [1.7, 0.65, -0.35]; // bottom (pommel side) -> top (prong side)
  const ringTwist = [0, 0.35, 0.7]; // radians — subtle drill-bit twist per ring
  const ringIndices: number[][] = ringHeights.map((y, ringI) => {
    const idxs: number[] = [];
    for (let k = 0; k < 4; k++) {
      const a = ringTwist[ringI] + (k * Math.PI) / 2;
      idxs.push(addVertex([Math.cos(a) * shaftRadius, y, Math.sin(a) * shaftRadius]));
    }
    for (let k = 0; k < 4; k++) addEdge(idxs[k], idxs[(k + 1) % 4]);
    return idxs;
  });
  for (let r = 0; r < ringIndices.length - 1; r++) {
    for (let k = 0; k < 4; k++) addEdge(ringIndices[r][k], ringIndices[r + 1][k]);
  }

  // ---- pommel: pyramid cap below the bottom ring ----
  const pommelTip = addVertex([0, 2.05, 0]);
  ringIndices[0].forEach((idx) => addEdge(idx, pommelTip));

  // ---- crossguard bar at the top ring ----
  const topRing = ringIndices[ringIndices.length - 1];
  const guardY = ringHeights[ringHeights.length - 1];
  const guardLeft = addVertex([-0.5, guardY, 0.08]);
  const guardRight = addVertex([0.5, guardY, -0.08]);
  addEdge(guardLeft, guardRight);
  addEdge(guardLeft, topRing[0]);
  addEdge(guardLeft, topRing[3]);
  addEdge(guardRight, topRing[1]);
  addEdge(guardRight, topRing[2]);

  // ---- three tapering prongs (diamond cross-section blades) ----
  const bladeHalfWidth = 0.055;
  const prongs = [
    { baseX: 0, baseZ: 0, tipX: 0, tipY: -2.7, tipZ: 0, root: topRing[0] },
    { baseX: -0.16, baseZ: 0.03, tipX: -0.85, tipY: -2.35, tipZ: 0.22, root: guardLeft },
    { baseX: 0.16, baseZ: -0.03, tipX: 0.85, tipY: -2.35, tipZ: -0.22, root: guardRight },
  ];
  prongs.forEach((p) => {
    const front = addVertex([p.baseX, guardY - 0.05, p.baseZ + bladeHalfWidth]);
    const back = addVertex([p.baseX, guardY - 0.05, p.baseZ - bladeHalfWidth]);
    const tip = addVertex([p.tipX, p.tipY, p.tipZ]);
    addEdge(front, back);
    addEdge(front, tip);
    addEdge(back, tip);
    addEdge(front, p.root);
    addEdge(back, p.root);
  });

  return { vertices, edges };
}

const built = buildTrident();
export const TRIDENT_VERTICES: Vec3[] = built.vertices;
export const TRIDENT_EDGES: Edge[] = built.edges;

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
