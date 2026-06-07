/**
 * Creates a detailed 3D model of a bicycle
 * using Three.js primitives.
 */
export function createBicycle(THREE) {
  const bikeGroup = new THREE.Group();
  bikeGroup.name = "Bicycle";

  // Materials
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0a9e2e, // Green frame
    roughness: 0.4,
    metalness: 0.6
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.1,
    metalness: 0.95
  });

  const seatMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.9,
    metalness: 0.05
  });

  // Helper to create thin frame tubes
  function createTube(length, rotateZVal, rotateXVal, x, y, z) {
    const geo = new THREE.CylinderGeometry(0.012, 0.012, length, 6);
    if (rotateZVal) geo.rotateZ(rotateZVal);
    if (rotateXVal) geo.rotateX(rotateXVal);
    const mesh = new THREE.Mesh(geo, frameMat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    bikeGroup.add(mesh);
    return mesh;
  }

  // 1. Frame Geometry (Triangular bars)
  // Down tube
  createTube(0.75, 0, Math.PI / 3.5, 0, 0.6, 0.2);
  // Top tube
  createTube(0.68, 0, Math.PI / 2, 0, 0.78, -0.05);
  // Seat tube
  createTube(0.6, 0, -Math.PI / 15, 0, 0.62, -0.35);
  // Chain stay (to rear hub)
  createTube(0.55, 0, Math.PI / 2, 0, 0.35, -0.55);
  // Seat stay (from seat to rear hub)
  createTube(0.6, 0, -Math.PI / 5, 0, 0.6, -0.55);

  // Seat post & seat
  const postGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 6);
  const post = new THREE.Mesh(postGeo, chromeMat);
  post.position.set(0, 0.88, -0.37);
  bikeGroup.add(post);

  const saddleGeo = new THREE.BoxGeometry(0.12, 0.04, 0.25);
  const saddle = new THREE.Mesh(saddleGeo, seatMat);
  saddle.position.set(0, 0.96, -0.39);
  bikeGroup.add(saddle);

  // 2. Handlebars & Forks
  const forkGroup = new THREE.Group();
  forkGroup.position.set(0, 0.35, 0.52);
  forkGroup.rotation.x = -Math.PI / 12; // fork rake

  const forkLegGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.5, 6);
  const forkL = new THREE.Mesh(forkLegGeo, chromeMat);
  forkL.position.set(-0.04, 0.25, 0);
  forkGroup.add(forkL);

  const forkR = forkL.clone();
  forkR.position.set(0.04, 0.25, 0);
  forkGroup.add(forkR);

  // Stem & Handlebar
  const stemGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.2, 6);
  const stem = new THREE.Mesh(stemGeo, chromeMat);
  stem.position.set(0, 0.55, 0);
  forkGroup.add(stem);

  const barGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.44, 8);
  barGeo.rotateZ(Math.PI / 2);
  const bar = new THREE.Mesh(barGeo, chromeMat);
  bar.position.set(0, 0.65, 0.04);
  forkGroup.add(bar);
  
  bikeGroup.add(forkGroup);

  // 3. Wheels
  // Radius: 0.35m, W: 0.04m
  const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 16);
  tireGeo.rotateZ(Math.PI / 2);

  const rimGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.045, 12);
  rimGeo.rotateZ(Math.PI / 2);

  // Spoke representation (simple radial cylinders or a transparent cylinder)
  const spokeGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.66, 6);
  spokeGeo.rotateZ(Math.PI / 2);

  function createWheel(z) {
    const wGroup = new THREE.Group();
    wGroup.position.set(0, 0.35, z);

    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.castShadow = true;
    wGroup.add(tire);

    const rim = new THREE.Mesh(rimGeo, chromeMat);
    wGroup.add(rim);

    // 4 crossed spokes representing spokes
    for (let i = 0; i < 4; i++) {
      const spoke = new THREE.Mesh(spokeGeo, chromeMat);
      spoke.rotation.x = (i / 4) * Math.PI;
      wGroup.add(spoke);
    }
    
    bikeGroup.add(wGroup);
  }

  // Front wheel Z=0.52
  createWheel(0.52);
  // Rear wheel Z=-0.78
  createWheel(-0.78);

  // 4. Bounding Box HUD (Width: 0.6m, Height: 1.3m, Depth: 1.7m)
  const bboxGeo = new THREE.BoxGeometry(0.6, 1.3, 1.7);
  const bboxEdges = new THREE.EdgesGeometry(bboxGeo);
  const bboxMat = new THREE.LineBasicMaterial({
    color: 0xff3333,
    linewidth: 2,
    transparent: true,
    opacity: 0.8
  });
  const trackingBbox = new THREE.LineSegments(bboxEdges, bboxMat);
  trackingBbox.position.set(0, 0.65, -0.13);
  trackingBbox.name = "TargetBoundingBox";
  bikeGroup.add(trackingBbox);

  // Focus brackets
  const bracketGroup = new THREE.Group();
  bracketGroup.name = "TargetBrackets";
  bracketGroup.position.set(0, 0.65, -0.13);

  const bracketSize = 0.2;
  const bracketMat = new THREE.LineBasicMaterial({ color: 0xff3333, linewidth: 3 });

  const w2 = 0.6 / 2;
  const h2 = 1.3 / 2;
  const d2 = 1.7 / 2;

  const bracketPoints = [
    [-w2, h2, d2, -w2+bracketSize, h2, d2], [-w2, h2, d2, -w2, h2-bracketSize, d2], [-w2, h2, d2, -w2, h2, d2-bracketSize],
    [w2, h2, d2, w2-bracketSize, h2, d2], [w2, h2, d2, w2, h2-bracketSize, d2], [w2, h2, d2, w2, h2, d2-bracketSize],
    [-w2, h2, -d2, -w2+bracketSize, h2, -d2], [-w2, h2, -d2, -w2, h2-bracketSize, -d2], [-w2, h2, -d2, -w2, h2, -d2+bracketSize],
    [w2, h2, -d2, w2-bracketSize, h2, -d2], [w2, h2, -d2, w2, h2-bracketSize, -d2], [w2, h2, -d2, w2, h2, -d2+bracketSize]
  ];

  bracketPoints.forEach(([x1, y1, z1, x2, y2, z2]) => {
    const points = [new THREE.Vector3(x1, y1, z1), new THREE.Vector3(x2, y2, z2)];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo, bracketMat);
    bracketGroup.add(line);
  });
  bikeGroup.add(bracketGroup);

  return bikeGroup;
}
