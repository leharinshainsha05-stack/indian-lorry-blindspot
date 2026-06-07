/**
 * Creates a detailed 3D low-poly pedestrian model
 * using Three.js primitives and attaches a limb swing animation.
 */
export function createPedestrian(THREE) {
  const pedGroup = new THREE.Group();
  pedGroup.name = "Pedestrian";

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xffdbac, // light skin tone
    roughness: 0.8
  });

  const shirtMat = new THREE.MeshStandardMaterial({
    color: 0x0c50a3, // blue shirt
    roughness: 0.6
  });

  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x242424, // dark pants
    roughness: 0.7
  });

  const shoesMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.9
  });

  // 1. Head
  const headGeo = new THREE.BoxGeometry(0.2, 0.2, 0.2);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.55, 0);
  head.castShadow = true;
  pedGroup.add(head);

  // Hair
  const hairGeo = new THREE.BoxGeometry(0.22, 0.08, 0.22);
  const hairMat = new THREE.MeshStandardMaterial({ color: 0x221100, roughness: 0.9 });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.set(0, 1.62, 0.02);
  pedGroup.add(hair);

  // 2. Torso (Body shirt)
  const torsoGeo = new THREE.BoxGeometry(0.32, 0.55, 0.2);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.set(0, 1.15, 0);
  torso.castShadow = true;
  torso.receiveShadow = true;
  pedGroup.add(torso);

  // Neck
  const neckGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.08, 6);
  const neck = new THREE.Mesh(neckGeo, skinMat);
  neck.position.set(0, 1.44, 0);
  pedGroup.add(neck);

  // 3. Limbs (Pivoted for rotation)
  
  // Left Leg Pivot
  const leftLegPivot = new THREE.Group();
  leftLegPivot.position.set(-0.09, 0.9, 0);
  
  const legGeo = new THREE.BoxGeometry(0.12, 0.5, 0.12);
  const leftLeg = new THREE.Mesh(legGeo, pantsMat);
  leftLeg.position.set(0, -0.25, 0);
  leftLeg.castShadow = true;
  leftLegPivot.add(leftLeg);

  const leftShoeGeo = new THREE.BoxGeometry(0.12, 0.08, 0.18);
  const leftShoe = new THREE.Mesh(leftShoeGeo, shoesMat);
  leftShoe.position.set(0, -0.52, 0.03);
  leftShoe.castShadow = true;
  leftLegPivot.add(leftShoe);
  
  pedGroup.add(leftLegPivot);

  // Right Leg Pivot
  const rightLegPivot = new THREE.Group();
  rightLegPivot.position.set(0.09, 0.9, 0);
  
  const rightLeg = new THREE.Mesh(legGeo, pantsMat);
  rightLeg.position.set(0, -0.25, 0);
  rightLeg.castShadow = true;
  rightLegPivot.add(rightLeg);

  const rightShoe = new THREE.Mesh(leftShoeGeo, shoesMat);
  rightShoe.position.set(0, -0.52, 0.03);
  rightShoe.castShadow = true;
  rightLegPivot.add(rightShoe);

  pedGroup.add(rightLegPivot);

  // Left Arm Pivot
  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.2, 1.35, 0);

  const armGeo = new THREE.BoxGeometry(0.08, 0.45, 0.08);
  const leftArm = new THREE.Mesh(armGeo, shirtMat);
  leftArm.position.set(0, -0.2, 0);
  leftArm.castShadow = true;
  leftArmPivot.add(leftArm);

  const leftHandGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
  const leftHand = new THREE.Mesh(leftHandGeo, skinMat);
  leftHand.position.set(0, -0.44, 0);
  leftArmPivot.add(leftHand);

  pedGroup.add(leftArmPivot);

  // Right Arm Pivot
  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.2, 1.35, 0);

  const rightArm = new THREE.Mesh(armGeo, shirtMat);
  rightArm.position.set(0, -0.2, 0);
  rightArm.castShadow = true;
  rightArmPivot.add(rightArm);

  const rightHand = new THREE.Mesh(leftHandGeo, skinMat);
  rightHand.position.set(0, -0.44, 0);
  rightArmPivot.add(rightHand);

  pedGroup.add(rightArmPivot);

  // 4. Bounding Box HUD (Width: 0.7m, Height: 1.8m, Depth: 0.7m)
  const bboxGeo = new THREE.BoxGeometry(0.7, 1.8, 0.7);
  const bboxEdges = new THREE.EdgesGeometry(bboxGeo);
  const bboxMat = new THREE.LineBasicMaterial({
    color: 0xff3333,
    linewidth: 2,
    transparent: true,
    opacity: 0.8
  });
  const trackingBbox = new THREE.LineSegments(bboxEdges, bboxMat);
  trackingBbox.position.set(0, 0.9, 0);
  trackingBbox.name = "TargetBoundingBox";
  pedGroup.add(trackingBbox);

  // Focus brackets
  const bracketGroup = new THREE.Group();
  bracketGroup.name = "TargetBrackets";
  bracketGroup.position.set(0, 0.9, 0);

  const bracketSize = 0.2;
  const bracketMat = new THREE.LineBasicMaterial({ color: 0xff3333, linewidth: 3 });

  const w2 = 0.7 / 2;
  const h2 = 1.8 / 2;
  const d2 = 0.7 / 2;

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
  pedGroup.add(bracketGroup);

  // Expose walking animation ticker
  pedGroup.tick = function(time, isMoving) {
    if (isMoving) {
      // Swing legs and arms in opposite directions
      leftLegPivot.rotation.x = Math.sin(time * 6) * 0.45;
      rightLegPivot.rotation.x = -Math.sin(time * 6) * 0.45;
      
      leftArmPivot.rotation.x = -Math.sin(time * 6) * 0.35;
      rightArmPivot.rotation.x = Math.sin(time * 6) * 0.35;
      
      // Slight vertical bobbing
      torso.position.y = 1.15 + Math.abs(Math.sin(time * 12)) * 0.03;
      head.position.y = 1.55 + Math.abs(Math.sin(time * 12)) * 0.03;
    } else {
      // Reset limbs
      leftLegPivot.rotation.x = 0;
      rightLegPivot.rotation.x = 0;
      leftArmPivot.rotation.x = 0;
      rightArmPivot.rotation.x = 0;
      torso.position.y = 1.15;
      head.position.y = 1.55;
    }
  };

  return pedGroup;
}
