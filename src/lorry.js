/**
 * Creates a highly detailed 3D model of a traditional Indian Lorry
 * using Three.js primitives and dynamic Canvas-based textures.
 */
export function createIndianLorry(THREE) {
  const lorryGroup = new THREE.Group();
  lorryGroup.name = "IndianLorry";

  // Material helpers
  const chassisMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
    metalness: 0.1
  });
  
  const metalMaterial = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    roughness: 0.2,
    metalness: 0.8
  });

  const chromeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0.95
  });

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: 0x242424,
    roughness: 0.8,
    metalness: 0.1
  });

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0x051a24,
    roughness: 0.1,
    metalness: 0.9,
    transparent: true,
    opacity: 0.85
  });

  // Helper: Create a canvas texture for decals
  function createDecalTexture(width, height, drawFn) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    // Draw background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    
    // Run custom drawing
    drawFn(ctx, width, height);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  // 1. Chassis Frame
  // Dimension: W: 1.6m, H: 0.4m, D: 8.2m
  const chassisGeo = new THREE.BoxGeometry(1.6, 0.4, 8.2);
  const chassis = new THREE.Mesh(chassisGeo, chassisMaterial);
  chassis.position.set(0, 0.5, -0.6);
  chassis.castShadow = true;
  chassis.receiveShadow = true;
  lorryGroup.add(chassis);

  // Decorative Mudflaps / Mudguards
  const guardGeo = new THREE.BoxGeometry(2.5, 0.5, 0.8);
  const mudguardFront = new THREE.Mesh(guardGeo, chassisMaterial);
  mudguardFront.position.set(0, 0.6, 1.8);
  lorryGroup.add(mudguardFront);

  const mudguardRear = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.5, 2.4), chassisMaterial);
  mudguardRear.position.set(0, 0.6, -2.6);
  lorryGroup.add(mudguardRear);

  // 2. Cab Section (Front)
  // Placing the cab center around Z = 2.4 (total truck center is Z=0, front is +Z, rear is -Z)
  const cabGroup = new THREE.Group();
  cabGroup.position.set(0, 1.6, 2.4);
  lorryGroup.add(cabGroup);

  // Cab Lower Body (Painted Box)
  // Canvas texture for Cab Front/Sides (Stripes and patterns)
  const cabSideTexDraw = (ctx, w, h) => {
    // Left/Right side cab panel
    ctx.fillStyle = "#f5f5f5"; // White base
    ctx.fillRect(0, 0, w, h);
    
    // Colorful horizontal stripes
    const colors = ["#d92121", "#f2a104", "#0a7e8c", "#1d871d"];
    const stripeH = h / 10;
    
    // Draw stripes at the bottom
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = colors[i];
      ctx.fillRect(0, h - (4 - i) * stripeH - 20, w, stripeH - 2);
    }

    // Cab door outline
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, w - 40, h - 40);

    // Decorative mandala in the center of the door
    ctx.fillStyle = "#d92121";
    ctx.beginPath();
    ctx.arc(w / 2, h / 3, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#f2a104";
    ctx.beginPath();
    ctx.arc(w / 2, h / 3, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(w / 2, h / 3, 5, 0, Math.PI * 2);
    ctx.fill();
  };

  const cabSideTex = createDecalTexture(512, 512, cabSideTexDraw);
  const cabSideMat = new THREE.MeshStandardMaterial({
    map: cabSideTex,
    roughness: 0.4,
    metalness: 0.2
  });

  const cabFrontTexDraw = (ctx, w, h) => {
    // Cab Front panel (grill + emblem + stripes)
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, w, h);

    // Stripes
    const colors = ["#d92121", "#f2a104", "#0a7e8c"];
    for (let i = 0; i < colors.length; i++) {
      ctx.fillStyle = colors[i];
      ctx.fillRect(0, h - 80 - i * 25, w, 20);
    }

    // Traditional text above grill
    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#d92121";
    ctx.textAlign = "center";
    ctx.fillText("VAHAN COACH", w / 2, 60);

    ctx.font = "bold 20px monospace";
    ctx.fillStyle = "#1d871d";
    ctx.fillText("NATIONAL PERMIT", w / 2, 95);

    // Floral motifs
    ctx.fillStyle = "#f2a104";
    ctx.beginPath();
    ctx.moveTo(40, 40);
    ctx.lineTo(60, 60);
    ctx.lineTo(40, 80);
    ctx.lineTo(20, 60);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(w - 40, 40);
    ctx.lineTo(w - 20, 60);
    ctx.lineTo(w - 40, 80);
    ctx.lineTo(w - 60, 60);
    ctx.closePath();
    ctx.fill();
  };

  const cabFrontTex = createDecalTexture(512, 512, cabFrontTexDraw);
  const cabFrontMat = new THREE.MeshStandardMaterial({
    map: cabFrontTex,
    roughness: 0.4,
    metalness: 0.2
  });

  const cabSolidMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    roughness: 0.4,
    metalness: 0.2
  });

  // Cab materials array: 
  // [Right, Left, Top, Bottom, Front, Back]
  // In our local system: 
  // Box geometry width: X (Left/Right), height: Y (Top/Bottom), depth: Z (Front/Back)
  const cabMats = [
    cabSideMat,     // +X (Right)
    cabSideMat,     // -X (Left)
    cabSolidMat,    // +Y (Top)
    cabSolidMat,    // -Y (Bottom)
    cabFrontMat,    // +Z (Front)
    cabSolidMat     // -Z (Back)
  ];

  // Lower cab block
  const cabLowerGeo = new THREE.BoxGeometry(2.4, 1.2, 2.0);
  const cabLower = new THREE.Mesh(cabLowerGeo, cabMats);
  cabLower.castShadow = true;
  cabLower.receiveShadow = true;
  cabGroup.add(cabLower);

  // Cab Windshield & Upper Section
  const cabUpperGeo = new THREE.BoxGeometry(2.4, 0.8, 1.8);
  const cabUpperMats = [
    cabSideMat,
    cabSideMat,
    cabSolidMat,
    cabSolidMat,
    new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.3 }), // Front (will place glass mesh over it)
    cabSolidMat
  ];
  const cabUpper = new THREE.Mesh(cabUpperGeo, cabUpperMats);
  cabUpper.position.set(0, 1.0, -0.1);
  cabUpper.castShadow = true;
  cabUpper.receiveShadow = true;
  cabGroup.add(cabUpper);

  // Windshield glass panel overlay
  const glassGeo = new THREE.BoxGeometry(2.2, 0.6, 0.05);
  const windshield = new THREE.Mesh(glassGeo, glassMaterial);
  windshield.position.set(0, 1.0, 0.81);
  cabGroup.add(windshield);

  // Metal grill splitters (traditional windshield split)
  const splitterGeo = new THREE.BoxGeometry(0.06, 0.62, 0.08);
  const splitter = new THREE.Mesh(splitterGeo, metalMaterial);
  splitter.position.set(0, 1.0, 0.82);
  cabGroup.add(splitter);

  // Left & Right A-Pillar Blind Spot Warning Indicator Lights
  const backingGeo = new THREE.BoxGeometry(0.12, 0.42, 0.06);
  const leftBacking = new THREE.Mesh(backingGeo, chassisMaterial);
  leftBacking.position.set(-1.25, 1.30, 0.82);
  cabGroup.add(leftBacking);

  const leftPillarLightMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.5,
    metalness: 0.2
  });
  const pillarLightGeo = new THREE.BoxGeometry(0.09, 0.39, 0.07);
  const leftPillarLight = new THREE.Mesh(pillarLightGeo, leftPillarLightMat);
  leftPillarLight.position.set(-1.25, 1.30, 0.85);
  leftPillarLight.name = "leftPillarLight";
  cabGroup.add(leftPillarLight);

  const rightBacking = new THREE.Mesh(backingGeo, chassisMaterial);
  rightBacking.position.set(1.25, 1.30, 0.82);
  cabGroup.add(rightBacking);

  const rightPillarLightMat = new THREE.MeshStandardMaterial({
    color: 0x222222, // Reset to dark gray initially
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.5,
    metalness: 0.2
  });
  const rightPillarLight = new THREE.Mesh(pillarLightGeo, rightPillarLightMat);
  rightPillarLight.position.set(1.25, 1.30, 0.85);
  rightPillarLight.name = "rightPillarLight";
  cabGroup.add(rightPillarLight);

  // 3. The Crown (Taj / Headboard)
  // The iconic extension on top of Indian Truck cabs!
  const crownTexDraw = (ctx, w, h) => {
    ctx.fillStyle = "#0c50a3"; // Dark blue base
    ctx.fillRect(0, 0, w, h);

    // Ornate gold border
    ctx.strokeStyle = "#e8ac0c";
    ctx.lineWidth = 12;
    ctx.strokeRect(10, 10, w - 20, h - 20);

    // Decorative inner panel
    ctx.fillStyle = "#d61c1c"; // Red panel
    ctx.fillRect(25, 25, w - 50, h - 50);

    // "GOODS CARRIER" Text
    ctx.font = "bold 56px 'Impact', 'Arial Black', sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 6;
    ctx.strokeText("GOODS CARRIER", w / 2, h / 2);
    ctx.fillText("GOODS CARRIER", w / 2, h / 2);
    
    // Add little lotus decorations
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#e8ac0c";
    ctx.fillText("✿", 60, h / 2);
    ctx.fillText("✿", w - 60, h / 2);
  };

  const crownTex = createDecalTexture(1024, 256, crownTexDraw);
  const crownFrontMat = new THREE.MeshStandardMaterial({
    map: crownTex,
    roughness: 0.3,
    metalness: 0.4
  });

  const crownGeo = new THREE.BoxGeometry(2.4, 0.6, 1.8);
  const crownMats = [
    cabSideMat,     // +X
    cabSideMat,     // -X
    cabSolidMat,    // +Y
    cabSolidMat,    // -Y
    crownFrontMat,  // +Z (Front decal)
    cabSolidMat     // -Z
  ];
  const crown = new THREE.Mesh(crownGeo, crownMats);
  crown.position.set(0, 1.7, -0.1);
  crown.castShadow = true;
  cabGroup.add(crown);

  // Roof Luggage Carrier (Metal frame)
  const carrierGroup = new THREE.Group();
  carrierGroup.position.set(0, 2.05, -0.1);
  
  const railGeo = new THREE.BoxGeometry(2.2, 0.05, 0.05);
  const topRail = new THREE.Mesh(railGeo, metalMaterial);
  topRail.position.set(0, 0.1, 0);
  carrierGroup.add(topRail);

  const sideRailGeo = new THREE.BoxGeometry(0.05, 0.05, 1.6);
  const leftRail = new THREE.Mesh(sideRailGeo, metalMaterial);
  leftRail.position.set(-1.1, 0.1, 0);
  carrierGroup.add(leftRail);
  
  const rightRail = leftRail.clone();
  rightRail.position.set(1.1, 0.1, 0);
  carrierGroup.add(rightRail);

  // Add support struts for roof rack
  for (let z = -0.7; z <= 0.7; z += 0.35) {
    const strutGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.1);
    const strutL = new THREE.Mesh(strutGeo, metalMaterial);
    strutL.position.set(-1.1, 0.05, z);
    carrierGroup.add(strutL);
    
    const strutR = strutL.clone();
    strutR.position.set(1.1, 0.05, z);
    carrierGroup.add(strutR);
  }
  cabGroup.add(carrierGroup);

  // 4. Cargo Bed Section (Rear Container)
  // Dimensions: W: 2.4m, H: 2.0m, D: 5.6m. Placed behind Cab (Z = -1.6)
  const cargoGroup = new THREE.Group();
  cargoGroup.position.set(0, 1.7, -1.6);
  lorryGroup.add(cargoGroup);

  // Side Cargo Textures ("BHOLENATH ROAD LINE")
  const cargoSideDraw = (ctx, w, h) => {
    // Bright orange background
    ctx.fillStyle = "#e65c00";
    ctx.fillRect(0, 0, w, h);

    // Ornate blue/white border
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 6;
    ctx.strokeRect(15, 15, w - 30, h - 30);
    
    ctx.strokeStyle = "#0d6efd";
    ctx.lineWidth = 4;
    ctx.strokeRect(25, 25, w - 50, h - 50);

    // Traditional floral corner patterns
    const corners = [[35, 35], [w-35, 35], [35, h-35], [w-35, h-35]];
    ctx.fillStyle = "#e0a800";
    corners.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2);
      ctx.fill();
    });

    // "BHOLENATH" in large decorated typography
    ctx.font = "bold 90px 'Arial Black', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Text shadow/3D effect
    ctx.fillStyle = "#111111";
    ctx.fillText("BHOLENATH", w / 2 + 6, h / 2 - 35);
    
    // Main text
    ctx.fillStyle = "#ffff00"; // Yellow
    ctx.fillText("BHOLENATH", w / 2, h / 2 - 40);

    // Stylized border inside letters
    ctx.strokeStyle = "#d10a0a"; // Red outline
    ctx.lineWidth = 4;
    ctx.strokeText("BHOLENATH", w / 2, h / 2 - 40);

    // "ROAD LINE" below on a white strip
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(100, h / 2 + 25, w - 200, 45);
    
    ctx.font = "bold 32px monospace";
    ctx.fillStyle = "#0c50a3"; // Dark blue text
    ctx.fillText("R O A D   L I N E", w / 2, h / 2 + 48);

    // Draw Trishul (Trident) symbol on the sides
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    
    // Draw left Trishul
    drawTrishul(ctx, 80, h / 2 - 40);
    // Draw right Trishul
    drawTrishul(ctx, w - 80, h / 2 - 40);
  };

  function drawTrishul(ctx, x, y) {
    ctx.strokeStyle = "#ffffff";
    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 4;
    
    // Center rod
    ctx.beginPath();
    ctx.moveTo(x, y + 30);
    ctx.lineTo(x, y - 40);
    ctx.stroke();
    
    // Curve outer prongs
    ctx.beginPath();
    ctx.arc(x, y - 10, 20, 0, Math.PI, false);
    ctx.stroke();

    // Center sharp point
    ctx.beginPath();
    ctx.moveTo(x, y - 40);
    ctx.lineTo(x - 5, y - 30);
    ctx.lineTo(x + 5, y - 30);
    ctx.closePath();
    ctx.fill();

    // Side sharp points
    ctx.beginPath();
    ctx.moveTo(x - 20, y - 10);
    ctx.lineTo(x - 25, y - 20);
    ctx.lineTo(x - 15, y - 20);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x + 20, y - 10);
    ctx.lineTo(x + 15, y - 20);
    ctx.lineTo(x + 25, y - 20);
    ctx.closePath();
    ctx.fill();
  }

  const cargoSideTexL = createDecalTexture(1024, 512, cargoSideDraw);
  
  // Create mirrored or identical right texture
  const cargoSideTexR = createDecalTexture(1024, 512, (ctx, w, h) => {
    cargoSideDraw(ctx, w, h);
  });

  // Tailgate Texture ("HORN OK PLEASE")
  const cargoRearDraw = (ctx, w, h) => {
    // Yellow background
    ctx.fillStyle = "#ffcc00";
    ctx.fillRect(0, 0, w, h);

    // Diagonal safety hazard stripes at the bottom
    const stripeW = 40;
    ctx.fillStyle = "#111111";
    for (let x = 0; x < w; x += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.lineTo(x + stripeW, h);
      ctx.lineTo(x + stripeW - 40, h - 50);
      ctx.lineTo(x - 40, h - 50);
      ctx.closePath();
      ctx.fill();
    }

    // Border
    ctx.strokeStyle = "#d92121";
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, w - 30, h - 30);

    // "HORN" and "PLEASE" on sides, "OK" in center
    ctx.font = "bold 56px 'Arial Black', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // "HORN"
    ctx.fillStyle = "#d92121";
    ctx.fillText("HORN", w / 5 + 10, h / 2 - 20);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.strokeText("HORN", w / 5 + 10, h / 2 - 20);

    // "PLEASE"
    ctx.fillStyle = "#118f11";
    ctx.fillText("PLEASE", (w * 4) / 5 - 10, h / 2 - 20);
    ctx.strokeText("PLEASE", (w * 4) / 5 - 10, h / 2 - 20);

    // Center "OK" inside a beautiful red frame
    ctx.fillStyle = "#d92121";
    ctx.fillRect(w / 2 - 80, h / 2 - 70, 160, 100);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.strokeRect(w / 2 - 72, h / 2 - 62, 144, 84);

    ctx.font = "bold 72px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("OK", w / 2, h / 2 - 20);

    // Decorative slogans
    ctx.font = "bold 24px monospace";
    ctx.fillStyle = "#111111";
    ctx.fillText("USE DIPIER AT NIGHT", w / 2, 45);
    ctx.fillText("B L O W   H O R N", w / 2, h - 75);
  };

  const cargoRearTex = createDecalTexture(512, 512, cargoRearDraw);

  const cargoOrangeMat = new THREE.MeshStandardMaterial({
    color: 0xe65c00,
    roughness: 0.6,
    metalness: 0.15
  });

  const cargoMats = [
    new THREE.MeshStandardMaterial({ map: cargoSideTexR, roughness: 0.5 }), // +X
    new THREE.MeshStandardMaterial({ map: cargoSideTexL, roughness: 0.5 }), // -X
    cargoOrangeMat,    // +Y
    cargoOrangeMat,    // -Y
    cargoOrangeMat,    // +Z (Facing Cab)
    new THREE.MeshStandardMaterial({ map: cargoRearTex, roughness: 0.5 })  // -Z (Tailgate)
  ];

  const cargoGeo = new THREE.BoxGeometry(2.4, 2.0, 5.6);
  const cargoBed = new THREE.Mesh(cargoGeo, cargoMats);
  cargoBed.castShadow = true;
  cargoBed.receiveShadow = true;
  cargoGroup.add(cargoBed);

  // Add wooden vertical rib accents along the cargo container sides
  const ribGeo = new THREE.BoxGeometry(0.08, 2.02, 0.08);
  const ribMaterial = new THREE.MeshStandardMaterial({
    color: 0x0c50a3, // Rich blue ribs contrasting with orange cargo
    roughness: 0.7
  });

  // 10 ribs on left, 10 on right
  for (let z = -2.6; z <= 2.6; z += 0.58) {
    // Right side rib
    const ribR = new THREE.Mesh(ribGeo, ribMaterial);
    ribR.position.set(1.21, 0, z);
    cargoGroup.add(ribR);

    // Left side rib
    const ribL = new THREE.Mesh(ribGeo, ribMaterial);
    ribL.position.set(-1.21, 0, z);
    cargoGroup.add(ribL);
  }

  // 5. Wheels
  // Wheels coordinates:
  // Front Axle: Z = 2.4, Y = 0.5
  // Rear Axles: Z = -1.6 and Z = -2.8, Y = 0.5
  const wheelsGroup = new THREE.Group();
  lorryGroup.add(wheelsGroup);

  const tireGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.35, 24);
  tireGeo.rotateZ(Math.PI / 2); // Rotate cylinder to lie horizontal (axle alignment)

  const hubcapGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.37, 12);
  hubcapGeo.rotateZ(Math.PI / 2);

  const axlePositions = [
    { z: 2.4, isDouble: false }, // Front axle
    { z: -1.6, isDouble: true }, // Rear axle 1
    { z: -2.8, isDouble: true }  // Rear axle 2
  ];

  axlePositions.forEach(({ z, isDouble }) => {
    // Axle shaft
    const axleShaftGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
    axleShaftGeo.rotateZ(Math.PI / 2);
    const axle = new THREE.Mesh(axleShaftGeo, chassisMaterial);
    axle.position.set(0, 0.5, z);
    wheelsGroup.add(axle);

    // Left Side Wheels
    if (isDouble) {
      // Rear Left Outer Wheel
      const wheelLO = new THREE.Mesh(tireGeo, wheelMaterial);
      wheelLO.position.set(-1.15, 0.5, z);
      wheelLO.castShadow = true;
      wheelsGroup.add(wheelLO);

      // Rear Left Inner Wheel
      const wheelLI = new THREE.Mesh(tireGeo, wheelMaterial);
      wheelLI.position.set(-0.8, 0.5, z);
      wheelLI.castShadow = true;
      wheelsGroup.add(wheelLI);

      // Hubcap LO
      const hubLO = new THREE.Mesh(hubcapGeo, chromeMaterial);
      hubLO.position.set(-1.16, 0.5, z);
      wheelsGroup.add(hubLO);

      // Rear Right Outer Wheel
      const wheelRO = new THREE.Mesh(tireGeo, wheelMaterial);
      wheelRO.position.set(1.15, 0.5, z);
      wheelRO.castShadow = true;
      wheelsGroup.add(wheelRO);

      // Rear Right Inner Wheel
      const wheelRI = new THREE.Mesh(tireGeo, wheelMaterial);
      wheelRI.position.set(0.8, 0.5, z);
      wheelRI.castShadow = true;
      wheelsGroup.add(wheelRI);

      // Hubcap RO
      const hubRO = new THREE.Mesh(hubcapGeo, chromeMaterial);
      hubRO.position.set(1.16, 0.5, z);
      wheelsGroup.add(hubRO);
    } else {
      // Front Left Wheel Group (for steering)
      const frontLeftWheelGroup = new THREE.Group();
      frontLeftWheelGroup.name = "frontLeftWheelGroup";
      frontLeftWheelGroup.position.set(-1.1, 0.5, z);
      
      const wheelL = new THREE.Mesh(tireGeo, wheelMaterial);
      wheelL.position.set(0, 0, 0);
      wheelL.castShadow = true;
      frontLeftWheelGroup.add(wheelL);

      const hubL = new THREE.Mesh(hubcapGeo, chromeMaterial);
      hubL.position.set(-0.01, 0, 0);
      frontLeftWheelGroup.add(hubL);
      
      wheelsGroup.add(frontLeftWheelGroup);

      // Front Right Wheel Group (for steering)
      const frontRightWheelGroup = new THREE.Group();
      frontRightWheelGroup.name = "frontRightWheelGroup";
      frontRightWheelGroup.position.set(1.1, 0.5, z);
      
      const wheelR = new THREE.Mesh(tireGeo, wheelMaterial);
      wheelR.position.set(0, 0, 0);
      wheelR.castShadow = true;
      frontRightWheelGroup.add(wheelR);

      const hubR = new THREE.Mesh(hubcapGeo, chromeMaterial);
      hubR.position.set(0.01, 0, 0);
      frontRightWheelGroup.add(hubR);
      
      wheelsGroup.add(frontRightWheelGroup);
    }
  });

  // 6. Accessories & Traditional Ornaments
  
  // Front Bumper (painted with safety stripes)
  const bumperTexDraw = (ctx, w, h) => {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Red stripes
    ctx.fillStyle = "#d92121";
    const stripeW = 30;
    for (let x = 0; x < w; x += stripeW * 2) {
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.lineTo(x + stripeW, h);
      ctx.lineTo(x + stripeW - 15, 0);
      ctx.lineTo(x - 15, 0);
      ctx.closePath();
      ctx.fill();
    }
  };
  const bumperTex = createDecalTexture(512, 128, bumperTexDraw);
  const bumperMat = new THREE.MeshStandardMaterial({
    map: bumperTex,
    roughness: 0.4
  });

  const bumperGeo = new THREE.BoxGeometry(2.6, 0.25, 0.2);
  const bumper = new THREE.Mesh(bumperGeo, bumperMat);
  bumper.position.set(0, 0.4, 3.5); // Very front of truck
  bumper.castShadow = true;
  lorryGroup.add(bumper);

  // Two front bumper round spotlights
  const spotGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
  spotGeo.rotateX(Math.PI / 2);
  const lampLightMat = new THREE.MeshStandardMaterial({
    color: 0xffe57f,
    emissive: 0xffcc00,
    emissiveIntensity: 0.8,
    roughness: 0.1
  });

  const spotL = new THREE.Mesh(spotGeo, lampLightMat);
  spotL.position.set(-0.5, 0.4, 3.61);
  lorryGroup.add(spotL);

  const spotR = spotL.clone();
  spotR.position.set(0.5, 0.4, 3.61);
  lorryGroup.add(spotR);

  // Chrome spotlight housing
  const houseGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.1, 12);
  houseGeo.rotateX(Math.PI / 2);
  const houseL = new THREE.Mesh(houseGeo, chromeMaterial);
  houseL.position.set(-0.5, 0.4, 3.58);
  lorryGroup.add(houseL);

  const houseR = houseL.clone();
  houseR.position.set(0.5, 0.4, 3.58);
  lorryGroup.add(houseR);

  // Side View Mirrors (Traditional massive square mirrors extending far out)
  const mirrorArmGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.6, 8);
  mirrorArmGeo.rotateZ(Math.PI / 2);

  const mirrorPlateGeo = new THREE.BoxGeometry(0.04, 0.35, 0.2);

  // Left Mirror Arm
  const armL = new THREE.Mesh(mirrorArmGeo, metalMaterial);
  armL.position.set(-1.4, 2.4, 2.8);
  lorryGroup.add(armL);

  // Left Mirror Plate
  const plateL = new THREE.Mesh(mirrorPlateGeo, chromeMaterial);
  plateL.position.set(-1.7, 2.4, 2.8);
  lorryGroup.add(plateL);

  // Right Mirror Arm
  const armR = new THREE.Mesh(mirrorArmGeo, metalMaterial);
  armR.position.set(1.4, 2.4, 2.8);
  lorryGroup.add(armR);

  // Right Mirror Plate
  const plateR = new THREE.Mesh(mirrorPlateGeo, chromeMaterial);
  plateR.position.set(1.7, 2.4, 2.8);
  lorryGroup.add(plateR);

  // Mirror Glass Face inserts
  const mirrorGlassGeo = new THREE.BoxGeometry(0.01, 0.33, 0.18);
  const mirrorGlassL = new THREE.Mesh(mirrorGlassGeo, glassMaterial);
  mirrorGlassL.position.set(-1.71, 2.4, 2.8);
  lorryGroup.add(mirrorGlassL);

  const mirrorGlassR = new THREE.Mesh(mirrorGlassGeo, glassMaterial);
  mirrorGlassR.position.set(1.71, 2.4, 2.8);
  lorryGroup.add(mirrorGlassR);

  // Fuel Tank (Steel cylinder on left side)
  const tankGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.4, 16);
  tankGeo.rotateZ(Math.PI / 2);
  const tank = new THREE.Mesh(tankGeo, metalMaterial);
  tank.position.set(-1.0, 0.65, -0.2);
  tank.castShadow = true;
  lorryGroup.add(tank);

  // Tool Box / Battery (Black box on right side)
  const toolBoxGeo = new THREE.BoxGeometry(0.5, 0.5, 1.2);
  const toolBox = new THREE.Mesh(toolBoxGeo, chassisMaterial);
  toolBox.position.set(1.0, 0.65, -0.2);
  toolBox.castShadow = true;
  lorryGroup.add(toolBox);

  // 7. Evil Eye Nazar Battu Tassels (Hanging charms!)
  // Black threads/tassels hanging from rearview mirrors & front bumper
  const tasselMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

  function addHangingTassel(x, y, z) {
    const threadGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.25, 4);
    const thread = new THREE.Mesh(threadGeo, tasselMat);
    thread.position.set(x, y - 0.125, z);
    lorryGroup.add(thread);

    const puffGeo = new THREE.ConeGeometry(0.04, 0.1, 8);
    const puff = new THREE.Mesh(puffGeo, tasselMat);
    puff.position.set(x, y - 0.25, z);
    puff.rotation.x = Math.PI; // Point down
    lorryGroup.add(puff);
  }

  // Left Mirror Tassel
  addHangingTassel(-1.7, 2.22, 2.8);
  // Right Mirror Tassel
  addHangingTassel(1.7, 2.22, 2.8);
  // Front Bumper Left Tassel
  addHangingTassel(-1.1, 0.27, 3.5);
  // Front Bumper Right Tassel
  addHangingTassel(1.1, 0.27, 3.5);

  // 8. Dynamic Turn Signal LED indicator meshes
  const leftBlinkerMat = new THREE.MeshStandardMaterial({
    color: 0x442200,
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.2
  });
  
  const rightBlinkerMat = new THREE.MeshStandardMaterial({
    color: 0x442200,
    emissive: 0x000000,
    emissiveIntensity: 0,
    roughness: 0.2
  });

  const indicatorGeo = new THREE.BoxGeometry(0.15, 0.08, 0.05);

  const leftBlinker = new THREE.Mesh(indicatorGeo, leftBlinkerMat);
  leftBlinker.position.set(-1.1, 0.4, 3.61);
  leftBlinker.name = "leftBlinker";
  lorryGroup.add(leftBlinker);

  const rightBlinker = new THREE.Mesh(indicatorGeo, rightBlinkerMat);
  rightBlinker.position.set(1.1, 0.4, 3.61);
  rightBlinker.name = "rightBlinker";
  lorryGroup.add(rightBlinker);

  // Side turn indicators on cab doors
  const sideIndicatorGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.02, 8);
  sideIndicatorGeo.rotateZ(Math.PI / 2); // align side-facing

  const leftSideBlinker = new THREE.Mesh(sideIndicatorGeo, leftBlinkerMat);
  leftSideBlinker.position.set(-1.21, 0, 0); // relative to cabGroup
  leftSideBlinker.name = "leftSideBlinker";
  cabGroup.add(leftSideBlinker);

  const rightSideBlinker = new THREE.Mesh(sideIndicatorGeo, rightBlinkerMat);
  rightSideBlinker.position.set(1.21, 0, 0); // relative to cabGroup
  rightSideBlinker.name = "rightSideBlinker";
  cabGroup.add(rightSideBlinker);

  return lorryGroup;
}
