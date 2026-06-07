/**
 * Creates a detailed 3D model of a motorcycle
 * using Three.js primitives.
 */
export function createMotorcycle(THREE) {
  const motorGroup = new THREE.Group();
  motorGroup.name = "Motorcycle";

  // Materials
  const redMetalMat = new THREE.MeshStandardMaterial({
    color: 0xd91a1a,
    roughness: 0.3,
    metalness: 0.7
  });

  const engineMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.4,
    metalness: 0.8
  });

  const seatMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.8
  });

  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.9,
    metalness: 0.05
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd,
    roughness: 0.1,
    metalness: 0.95
  });

  const lightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffaa,
    emissiveIntensity: 0.8
  });

  // 1. Frame & Engine (Center)
  const engineGeo = new THREE.BoxGeometry(0.3, 0.4, 0.6);
  const engine = new THREE.Mesh(engineGeo, engineMat);
  engine.position.set(0, 0.5, 0);
  engine.castShadow = true;
  motorGroup.add(engine);

  const tankGeo = new THREE.BoxGeometry(0.35, 0.25, 0.55);
  const tank = new THREE.Mesh(tankGeo, redMetalMat);
  tank.position.set(0, 0.8, 0.15);
  tank.castShadow = true;
  motorGroup.add(tank);

  // Seat
  const seatGeo = new THREE.BoxGeometry(0.28, 0.08, 0.45);
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(0, 0.82, -0.25);
  seat.rotation.x = -Math.PI / 20;
  motorGroup.add(seat);

  // Rear exhaust pipe
  const exhaustGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 8);
  exhaustGeo.rotateX(Math.PI / 2.2);
  const exhaust = new THREE.Mesh(exhaustGeo, chromeMat);
  exhaust.position.set(0.16, 0.45, -0.4);
  exhaust.castShadow = true;
  motorGroup.add(exhaust);

  // 2. Front Fork & Handlebars
  const forkGroup = new THREE.Group();
  forkGroup.position.set(0, 0.6, 0.55);
  forkGroup.rotation.x = -Math.PI / 12; // Rake angle

  const strutGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
  const strutL = new THREE.Mesh(strutGeo, chromeMat);
  strutL.position.set(-0.1, 0.1, 0);
  forkGroup.add(strutL);

  const strutR = strutL.clone();
  strutR.position.set(0.1, 0.1, 0);
  forkGroup.add(strutR);

  // Handlebars crossbar
  const barGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.5, 8);
  barGeo.rotateZ(Math.PI / 2);
  const bar = new THREE.Mesh(barGeo, chromeMat);
  bar.position.set(0, 0.5, 0);
  forkGroup.add(bar);

  // Grips
  const gripGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8);
  gripGeo.rotateZ(Math.PI / 2);
  const gripL = new THREE.Mesh(gripGeo, seatMat);
  gripL.position.set(-0.25, 0.5, 0);
  forkGroup.add(gripL);

  const gripR = gripL.clone();
  gripR.position.set(0.25, 0.5, 0);
  forkGroup.add(gripR);

  // Headlight
  const headlampGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.08, 12);
  headlampGeo.rotateX(Math.PI / 2);
  const headlamp = new THREE.Mesh(headlampGeo, lightMat);
  headlamp.position.set(0, 0.42, 0.06);
  forkGroup.add(headlamp);
  motorGroup.add(forkGroup);

  // 3. Wheels
  // Tire dimensions: R: 0.35m, W: 0.12m
  const tireGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.12, 16);
  tireGeo.rotateZ(Math.PI / 2);

  const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.13, 8);
  rimGeo.rotateZ(Math.PI / 2);

  // Front Wheel
  const wheelF = new THREE.Mesh(tireGeo, tireMat);
  wheelF.position.set(0, 0.35, 0.75);
  wheelF.castShadow = true;
  motorGroup.add(wheelF);

  const rimF = new THREE.Mesh(rimGeo, chromeMat);
  rimF.position.set(0, 0.35, 0.75);
  motorGroup.add(rimF);

  // Rear Wheel
  const wheelR = new THREE.Mesh(tireGeo, tireMat);
  wheelR.position.set(0, 0.35, -0.75);
  wheelR.castShadow = true;
  motorGroup.add(wheelR);

  const rimR = new THREE.Mesh(rimGeo, chromeMat);
  rimR.position.set(0, 0.35, -0.75);
  motorGroup.add(rimR);

  // Rear Mudguard
  const mudguardGeo = new THREE.BoxGeometry(0.18, 0.2, 0.5);
  const mudguard = new THREE.Mesh(mudguardGeo, redMetalMat);
  mudguard.position.set(0, 0.62, -0.65);
  mudguard.rotation.x = -Math.PI / 6;
  motorGroup.add(mudguard);

  // 4. Bounding Box HUD (Width: 0.8m, Height: 1.4m, Depth: 2.2m)
  const bboxGeo = new THREE.BoxGeometry(0.8, 1.4, 2.2);
  const bboxEdges = new THREE.EdgesGeometry(bboxGeo);
  const bboxMat = new THREE.LineBasicMaterial({
    color: 0xff3333,
    linewidth: 2,
    transparent: true,
    opacity: 0.8
  });
  const trackingBbox = new THREE.LineSegments(bboxEdges, bboxMat);
  trackingBbox.position.set(0, 0.7, 0);
  trackingBbox.name = "TargetBoundingBox";
  motorGroup.add(trackingBbox);

  // 4 Focus corner brackets
  const bracketGroup = new THREE.Group();
  bracketGroup.name = "TargetBrackets";
  bracketGroup.position.set(0, 0.7, 0);

  const bracketSize = 0.25;
  const bracketMat = new THREE.LineBasicMaterial({ color: 0xff3333, linewidth: 3 });

  const w2 = 0.8 / 2;
  const h2 = 1.4 / 2;
  const d2 = 2.2 / 2;

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
  motorGroup.add(bracketGroup);

  return motorGroup;
}
