/**
 * Creates a detailed 3D model of a traditional Indian Auto Rickshaw
 * using Three.js primitives.
 */
export function createAutoRickshaw(THREE) {
  const rickshawGroup = new THREE.Group();
  rickshawGroup.name = "AutoRickshaw";

  // Materials
  const yellowCanopyMat = new THREE.MeshStandardMaterial({
    color: 0xffcc00, // Vibrant yellow/mustard
    roughness: 0.5,
    metalness: 0.1
  });

  const blackBodyMat = new THREE.MeshStandardMaterial({
    color: 0x1c1c1c, // Black lower body
    roughness: 0.4,
    metalness: 0.3
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.3,
    metalness: 0.8
  });

  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.9,
    metalness: 0.05
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.9
  });

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x1a3344,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.7
  });

  const activeLightMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffaa,
    emissiveIntensity: 0.8,
    roughness: 0.1
  });

  // 1. Chassis/Floor Base
  // W: 1.2m, H: 0.1m, D: 2.4m
  const baseGeo = new THREE.BoxGeometry(1.1, 0.1, 2.2);
  const base = new THREE.Mesh(baseGeo, blackBodyMat);
  base.position.set(0, 0.3, 0);
  base.castShadow = true;
  base.receiveShadow = true;
  rickshawGroup.add(base);

  // 2. Lower Cab Body
  // Back half passenger walls (U-shaped tub)
  const backWallGeo = new THREE.BoxGeometry(1.1, 0.7, 0.1);
  const backWall = new THREE.Mesh(backWallGeo, blackBodyMat);
  backWall.position.set(0, 0.65, -0.95);
  backWall.castShadow = true;
  rickshawGroup.add(backWall);

  const leftWallGeo = new THREE.BoxGeometry(0.1, 0.7, 1.2);
  const leftWall = new THREE.Mesh(leftWallGeo, blackBodyMat);
  leftWall.position.set(-0.5, 0.65, -0.4);
  leftWall.castShadow = true;
  rickshawGroup.add(leftWall);

  const rightWall = leftWall.clone();
  rightWall.position.set(0.5, 0.65, -0.4);
  rickshawGroup.add(rightWall);

  // Seat inside
  const seatGeo = new THREE.BoxGeometry(0.96, 0.25, 0.45);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.8 }); // brown vinyl
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(0, 0.45, -0.7);
  rickshawGroup.add(seat);

  // Driver seat (smaller single seat in front)
  const driverSeatGeo = new THREE.BoxGeometry(0.4, 0.25, 0.4);
  const driverSeat = new THREE.Mesh(driverSeatGeo, seatMat);
  driverSeat.position.set(0, 0.45, 0.15);
  rickshawGroup.add(driverSeat);

  // Handlebars / Steering console
  const steerGroup = new THREE.Group();
  steerGroup.position.set(0, 0.75, 0.7);
  
  const consoleGeo = new THREE.BoxGeometry(0.4, 0.15, 0.2);
  const consoleMesh = new THREE.Mesh(consoleGeo, blackBodyMat);
  steerGroup.add(consoleMesh);
  
  const barGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8);
  barGeo.rotateZ(Math.PI / 2);
  const bar = new THREE.Mesh(barGeo, metalMat);
  bar.position.set(0, 0.08, 0.02);
  steerGroup.add(bar);
  rickshawGroup.add(steerGroup);

  // 3. Front Nose (Tapered front cab)
  const noseGeo = new THREE.BoxGeometry(0.8, 0.55, 0.7);
  const nose = new THREE.Mesh(noseGeo, blackBodyMat);
  nose.position.set(0, 0.55, 0.75);
  nose.castShadow = true;
  rickshawGroup.add(nose);

  const noseTipGeo = new THREE.BoxGeometry(0.5, 0.4, 0.3);
  const noseTip = new THREE.Mesh(noseTipGeo, blackBodyMat);
  noseTip.position.set(0, 0.48, 1.15);
  rickshawGroup.add(noseTip);

  // Front Mudguard
  const mudguardGeo = new THREE.BoxGeometry(0.24, 0.3, 0.5);
  const mudguard = new THREE.Mesh(mudguardGeo, blackBodyMat);
  mudguard.position.set(0, 0.4, 1.05);
  rickshawGroup.add(mudguard);

  // 4. Canopy (Yellow Roof + Struts)
  // Support Struts
  const strutGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8);
  
  const strutFL = new THREE.Mesh(strutGeo, metalMat);
  strutFL.position.set(-0.45, 1.05, 0.55);
  rickshawGroup.add(strutFL);
  
  const strutFR = strutFL.clone();
  strutFR.position.set(0.45, 1.05, 0.55);
  rickshawGroup.add(strutFR);

  const strutRL = new THREE.Mesh(strutGeo, metalMat);
  strutRL.position.set(-0.52, 1.05, -0.95);
  rickshawGroup.add(strutRL);

  const strutRR = strutRL.clone();
  strutRR.position.set(0.52, 1.05, -0.95);
  rickshawGroup.add(strutRR);

  // Canopy Roof Mesh (Rounded look using multiple boxes)
  const roofGroup = new THREE.Group();
  roofGroup.position.set(0, 1.5, -0.15);
  
  // Main flat top
  const roofTopGeo = new THREE.BoxGeometry(1.08, 0.08, 1.8);
  const roofTop = new THREE.Mesh(roofTopGeo, yellowCanopyMat);
  roofTop.position.set(0, 0.1, 0);
  roofTop.castShadow = true;
  roofGroup.add(roofTop);

  // Slanted front canopy cap
  const roofFrontGeo = new THREE.BoxGeometry(1.08, 0.4, 0.6);
  roofFrontGeo.rotateX(-Math.PI / 6);
  const roofFront = new THREE.Mesh(roofFrontGeo, yellowCanopyMat);
  roofFront.position.set(0, -0.05, 0.95);
  roofFront.castShadow = true;
  roofGroup.add(roofFront);

  // Slanted back canopy cap
  const roofBackGeo = new THREE.BoxGeometry(1.08, 0.6, 0.4);
  roofBackGeo.rotateX(Math.PI / 12);
  const roofBack = new THREE.Mesh(roofBackGeo, yellowCanopyMat);
  roofBack.position.set(0, -0.18, -0.95);
  roofBack.castShadow = true;
  roofGroup.add(roofBack);

  // Side panels of the canopy (Upper cover)
  const sidePanelGeo = new THREE.BoxGeometry(0.04, 0.4, 1.2);
  const sidePanelL = new THREE.Mesh(sidePanelGeo, yellowCanopyMat);
  sidePanelL.position.set(-0.53, -0.1, -0.1);
  roofGroup.add(sidePanelL);

  const sidePanelR = sidePanelL.clone();
  sidePanelR.position.set(0.53, -0.1, -0.1);
  roofGroup.add(sidePanelR);
  
  rickshawGroup.add(roofGroup);

  // Windshield glass
  const glassGeo = new THREE.BoxGeometry(0.72, 0.38, 0.03);
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 1.0, 0.65);
  glass.rotation.x = -Math.PI / 10;
  rickshawGroup.add(glass);

  // 5. Wheels
  const tireGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.18, 16);
  tireGeo.rotateZ(Math.PI / 2);
  
  const rimGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.2, 10);
  rimGeo.rotateZ(Math.PI / 2);

  // Rear Wheels
  const wheelRL = new THREE.Mesh(tireGeo, wheelMat);
  wheelRL.position.set(-0.56, 0.25, -0.7);
  wheelRL.castShadow = true;
  rickshawGroup.add(wheelRL);

  const rimRL = new THREE.Mesh(rimGeo, chromeMat);
  rimRL.position.set(-0.57, 0.25, -0.7);
  rickshawGroup.add(rimRL);

  const wheelRR = new THREE.Mesh(tireGeo, wheelMat);
  wheelRR.position.set(0.56, 0.25, -0.7);
  wheelRR.castShadow = true;
  rickshawGroup.add(wheelRR);

  const rimRR = new THREE.Mesh(rimGeo, chromeMat);
  rimRR.position.set(0.57, 0.25, -0.7);
  rickshawGroup.add(rimRR);

  // Front Wheel (Centered)
  const wheelF = new THREE.Mesh(tireGeo, wheelMat);
  wheelF.position.set(0, 0.25, 1.05);
  wheelF.castShadow = true;
  rickshawGroup.add(wheelF);

  const rimF = new THREE.Mesh(rimGeo, chromeMat);
  rimF.position.set(0, 0.25, 1.05);
  rickshawGroup.add(rimF);

  // 6. Lights
  const headlightGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.05, 12);
  headlightGeo.rotateX(Math.PI / 2);
  const headlamp = new THREE.Mesh(headlightGeo, activeLightMat);
  headlamp.position.set(0, 0.45, 1.31);
  rickshawGroup.add(headlamp);

  // Small bumper in front
  const frontBumperGeo = new THREE.BoxGeometry(0.4, 0.08, 0.08);
  const frontBumper = new THREE.Mesh(frontBumperGeo, metalMat);
  frontBumper.position.set(0, 0.25, 1.22);
  rickshawGroup.add(frontBumper);

  // 7. Bounding Box and Bracket System (Selection Hud Overlay in 3D)
  // Create a wireframe box that can be toggled on/off to represent active targeting
  const bboxGeo = new THREE.BoxGeometry(1.4, 1.8, 2.7);
  const bboxEdges = new THREE.EdgesGeometry(bboxGeo);
  const bboxMat = new THREE.LineBasicMaterial({
    color: 0xff3333,
    linewidth: 2,
    transparent: true,
    opacity: 0.8
  });
  const trackingBbox = new THREE.LineSegments(bboxEdges, bboxMat);
  trackingBbox.position.set(0, 0.9, 0.15);
  trackingBbox.name = "TargetBoundingBox";
  trackingBbox.visible = true; // default visible
  rickshawGroup.add(trackingBbox);

  // Add 4 floating corners (like photo camera autofocus brackets)
  const bracketGroup = new THREE.Group();
  bracketGroup.name = "TargetBrackets";
  bracketGroup.position.set(0, 0.9, 0.15);
  
  // We can add simple lines to represent bracket corners
  const bracketSize = 0.3;
  const bracketMat = new THREE.LineBasicMaterial({ color: 0xff3333, linewidth: 3 });
  
  // Draw corners: we'll create lines for the 8 vertices of the bounding box
  const w2 = 1.4 / 2;
  const h2 = 1.8 / 2;
  const d2 = 2.7 / 2;

  const bracketPoints = [
    // Top front left
    [-w2, h2, d2, -w2+bracketSize, h2, d2],
    [-w2, h2, d2, -w2, h2-bracketSize, d2],
    [-w2, h2, d2, -w2, h2, d2-bracketSize],
    
    // Top front right
    [w2, h2, d2, w2-bracketSize, h2, d2],
    [w2, h2, d2, w2, h2-bracketSize, d2],
    [w2, h2, d2, w2, h2, d2-bracketSize],

    // Top back left
    [-w2, h2, -d2, -w2+bracketSize, h2, -d2],
    [-w2, h2, -d2, -w2, h2-bracketSize, -d2],
    [-w2, h2, -d2, -w2, h2, -d2+bracketSize],

    // Top back right
    [w2, h2, -d2, w2-bracketSize, h2, -d2],
    [w2, h2, -d2, w2, h2-bracketSize, -d2],
    [w2, h2, -d2, w2, h2, -d2+bracketSize]
  ];

  bracketPoints.forEach(([x1, y1, z1, x2, y2, z2]) => {
    const points = [
      new THREE.Vector3(x1, y1, z1),
      new THREE.Vector3(x2, y2, z2)
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geo, bracketMat);
    bracketGroup.add(line);
  });
  
  rickshawGroup.add(bracketGroup);

  return rickshawGroup;
}
