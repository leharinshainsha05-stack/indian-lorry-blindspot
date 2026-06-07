import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';
import { createIndianLorry } from './lorry.js';
import { createAutoRickshaw } from './rickshaw.js';
import { createMotorcycle } from './motorcycle.js';
import { createBicycle } from './bicycle.js';
import { createPedestrian } from './pedestrian.js';
import { BlindSpotSimulation, ZONES } from './simulation.js';

// Global variables
let scene, camera, renderer, controls;
let lorry, targetGroup, simulation;
let rickshawModel, motorcycleModel, bicycleModel, pedestrianModel;
let activeTargetKey = "rickshaw";
let targetsMap = {};
let zonesMeshes = {};
let trackingLine;
let dragPlane;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isDragging = false;

// Audio variables
let audioCtx = null;
let audioEnabled = true;
let lastBeepTime = 0;
const beepDuration = 0.08; // 80ms beep

// Dom elements
const teleRange = document.getElementById("tele-range");
const teleSpeed = document.getElementById("tele-speed");
const teleTtc = document.getElementById("tele-ttc");
const alertBanner = document.getElementById("alert-banner");
const alertMessage = document.getElementById("alert-message");
const systemIndicator = document.getElementById("system-status-indicator");
const systemText = document.getElementById("system-status-text");
const audioToggle = document.getElementById("audio-toggle");
const simPlayPauseBtn = document.getElementById("sim-play-pause");
const simSpeedSlider = document.getElementById("sim-speed");
const simSpeedLabel = document.getElementById("speed-label");
const instructionText = document.getElementById("instruction-text");

// Initialize scene
function init() {
  const container = document.getElementById("canvas-container");
  
  // 1. Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04080f);
  scene.fog = new THREE.FogExp2(0x04080f, 0.025);

  // 2. Camera
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(9, 6, 11);

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // 4. Orbit Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Prevent camera from going under floor
  controls.minDistance = 3;
  controls.maxDistance = 28;
  controls.target.set(0, 1.2, 0);

  // 5. Lighting
  // Cyberpunk ambient light (deep blue)
  const ambientLight = new THREE.AmbientLight(0x0a192f, 1.8);
  scene.add(ambientLight);

  // Directional Light (Sun/Key)
  const dirLight = new THREE.DirectionalLight(0xffffff, 3.2);
  dirLight.position.set(12, 18, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near = 0.5;
  dirLight.shadow.camera.far = 40;
  
  const d = 15;
  dirLight.shadow.camera.left = -d;
  dirLight.shadow.camera.right = d;
  dirLight.shadow.camera.top = d;
  dirLight.shadow.camera.bottom = -d;
  dirLight.shadow.bias = -0.0005;
  scene.add(dirLight);

  // Fill Light (Neon cyan/blue)
  const fillLight = new THREE.DirectionalLight(0x00f2fe, 1.0);
  fillLight.position.set(-10, 8, -10);
  scene.add(fillLight);

  // Decorative grid / Radar base
  setupRadarGrid();

  // 6. Create Lorry model
  lorry = createIndianLorry(THREE);
  scene.add(lorry);

  // Create Parent Target Group (moved by simulation)
  targetGroup = new THREE.Group();
  scene.add(targetGroup);

  // Instantiate all target models
  rickshawModel = createAutoRickshaw(THREE);
  motorcycleModel = createMotorcycle(THREE);
  bicycleModel = createBicycle(THREE);
  pedestrianModel = createPedestrian(THREE);

  // Add all to targetGroup
  targetGroup.add(rickshawModel);
  targetGroup.add(motorcycleModel);
  targetGroup.add(bicycleModel);
  targetGroup.add(pedestrianModel);

  // Set initial visibility
  rickshawModel.visible = true;
  motorcycleModel.visible = false;
  bicycleModel.visible = false;
  pedestrianModel.visible = false;

  targetsMap = {
    rickshaw: { model: rickshawModel, name: "AUTO RICKSHAW" },
    motorcycle: { model: motorcycleModel, name: "MOTORCYCLE" },
    bicycle: { model: bicycleModel, name: "BICYCLE" },
    pedestrian: { model: pedestrianModel, name: "PEDESTRIAN (WALKING)" }
  };

  // 7. Create Blind Spot volume meshes
  createBlindSpotMeshes();

  // 8. Create dynamic laser tracking line
  const trackingLineMat = new THREE.LineBasicMaterial({
    color: 0xff3333,
    linewidth: 2,
    transparent: true,
    opacity: 0.8
  });
  const trackingLineGeo = new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0, 1.0, 2.4),
    new THREE.Vector3(0, 1.0, 0)
  ]);
  trackingLine = new THREE.Line(trackingLineGeo, trackingLineMat);
  scene.add(trackingLine);

  // 9. Drag plane for manual movement
  dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

  // 10. Simulation logic integration
  simulation = new BlindSpotSimulation(lorry, targetGroup);

  // Setup Event Listeners
  setupEventListeners();

  // Animation Loop
  const clock = new THREE.Clock();
  
  function animate() {
    requestAnimationFrame(animate);
    
    const deltaTime = clock.getDelta();
    
    // Update simulation
    simulation.update(deltaTime);

    // Animate pedestrian walking if active and moving
    if (activeTargetKey === "pedestrian" && pedestrianModel && pedestrianModel.tick) {
      const isMoving = simulation.isPlaying && simulation.activeTrajectory !== "manual";
      pedestrianModel.tick(simulation.time, isMoving);
    }
    
    // Turn front wheels based on steering angle
    const leftFrontWheel = lorry.getObjectByName("frontLeftWheelGroup");
    const rightFrontWheel = lorry.getObjectByName("frontRightWheelGroup");
    if (leftFrontWheel && rightFrontWheel) {
      const rad = THREE.MathUtils.degToRad(simulation.steeringAngle);
      leftFrontWheel.rotation.y = rad;
      rightFrontWheel.rotation.y = rad;
    }

    // Flash turn signal blinkers
    const leftBlinker = lorry.getObjectByName("leftBlinker");
    const rightBlinker = lorry.getObjectByName("rightBlinker");
    const leftSideBlinker = lorry.getObjectByName("leftSideBlinker");
    const rightSideBlinker = lorry.getObjectByName("rightSideBlinker");
    const blinkOn = (Math.floor(Date.now() / 350) % 2 === 0);

    // Left blinker status
    if (simulation.blinker === "LEFT" && blinkOn) {
      if (leftBlinker) {
        leftBlinker.material.color.setHex(0xffaa00);
        leftBlinker.material.emissive.setHex(0xffaa00);
        leftBlinker.material.emissiveIntensity = 2.0;
      }
      if (leftSideBlinker) {
        leftSideBlinker.material.color.setHex(0xffaa00);
        leftSideBlinker.material.emissive.setHex(0xffaa00);
        leftSideBlinker.material.emissiveIntensity = 2.0;
      }
    } else {
      if (leftBlinker) {
        leftBlinker.material.color.setHex(0x442200);
        leftBlinker.material.emissive.setHex(0x000000);
        leftBlinker.material.emissiveIntensity = 0.0;
      }
      if (leftSideBlinker) {
        leftSideBlinker.material.color.setHex(0x442200);
        leftSideBlinker.material.emissive.setHex(0x000000);
        leftSideBlinker.material.emissiveIntensity = 0.0;
      }
    }

    // Right blinker status
    if (simulation.blinker === "RIGHT" && blinkOn) {
      if (rightBlinker) {
        rightBlinker.material.color.setHex(0xffaa00);
        rightBlinker.material.emissive.setHex(0xffaa00);
        rightBlinker.material.emissiveIntensity = 2.0;
      }
      if (rightSideBlinker) {
        rightSideBlinker.material.color.setHex(0xffaa00);
        rightSideBlinker.material.emissive.setHex(0xffaa00);
        rightSideBlinker.material.emissiveIntensity = 2.0;
      }
    } else {
      if (rightBlinker) {
        rightBlinker.material.color.setHex(0x442200);
        rightBlinker.material.emissive.setHex(0x000000);
        rightBlinker.material.emissiveIntensity = 0.0;
      }
      if (rightSideBlinker) {
        rightSideBlinker.material.color.setHex(0x442200);
        rightSideBlinker.material.emissive.setHex(0x000000);
        rightSideBlinker.material.emissiveIntensity = 0.0;
      }
    }

    // Update tracking laser line
    updateTrackingLine();
    
    // Update UI elements based on telemetry
    updateUI();

    // Trigger warning audio chimes
    playWarningBeeps();

    // Controls update
    controls.update();

    renderer.render(scene, camera);
  }

  animate();
}

/**
 * Creates 3D coordinate grids and radar rings for high-tech HUD look
 */
function setupRadarGrid() {
  // Main grid helper
  const gridHelper = new THREE.GridHelper(32, 32, 0x00f2fe, 0x1d3043);
  gridHelper.position.y = 0.005; // Slightly above ground
  gridHelper.material.opacity = 0.15;
  gridHelper.material.transparent = true;
  scene.add(gridHelper);

  // Concentric radar rings (drawn as thin loops)
  const ringColors = [0x00f2fe, 0x00f2fe, 0x00f2fe, 0x00f2fe];
  const radii = [3.0, 6.0, 9.5, 13.0];
  
  radii.forEach((r, idx) => {
    const points = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(theta) * r, 0.01, Math.sin(theta) * r));
    }
    const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
    const ringMat = new THREE.LineDashedMaterial({
      color: ringColors[idx],
      transparent: true,
      opacity: idx === 0 ? 0.3 : 0.12,
      dashSize: 0.3,
      gapSize: 0.2
    });
    
    const ringLine = new THREE.Line(ringGeo, ringMat);
    ringLine.computeLineDistances();
    scene.add(ringLine);
  });

  // Dark ground receiver plane for shadows
  const groundGeo = new THREE.PlaneGeometry(50, 50);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x03070d,
    roughness: 0.9,
    metalness: 0.1,
    shadowSide: THREE.DoubleSide
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);
}

/**
 * Procedurally draws and extrudes 3D meshes for each blind spot zone
 */
function createBlindSpotMeshes() {
  for (const key of Object.keys(ZONES)) {
    const zone = ZONES[key];
    
    // Create 2D shape of the polygon
    const shape = new THREE.Shape();
    shape.moveTo(zone.polygon[0][0], zone.polygon[0][1]);
    for (let i = 1; i < zone.polygon.length; i++) {
      shape.lineTo(zone.polygon[i][0], zone.polygon[i][1]);
    }
    shape.closePath();

    // Extrude Shape into 3D volume (height 1.2m)
    const extrudeSettings = {
      depth: 1.2,
      bevelEnabled: false
    };
    
    const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Extrude geometry faces +Z, we need to map X-Y to X-Z horizontal plane
    geo.rotateX(-Math.PI / 2);
    
    // Translucent glass material
    const mat = new THREE.MeshBasicMaterial({
      color: zone.color,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = 0.01; // Rest directly on grid
    scene.add(mesh);
    
    zonesMeshes[key] = {
      mesh: mesh,
      material: mat,
      defaultColor: zone.color,
      defaultOpacity: 0.12
    };

    // Add outline borders for the zones
    const outlinePoints = [];
    zone.polygon.forEach(([x, z]) => {
      outlinePoints.push(new THREE.Vector3(x, 0.02, z));
    });
    outlinePoints.push(outlinePoints[0].clone()); // Close loop
    
    const outlineGeo = new THREE.BufferGeometry().setFromPoints(outlinePoints);
    const outlineMat = new THREE.LineBasicMaterial({
      color: zone.color,
      linewidth: 1.5,
      transparent: true,
      opacity: 0.5
    });
    const outline = new THREE.Line(outlineGeo, outlineMat);
    scene.add(outline);
    zonesMeshes[key].outline = outlineMat;
  }
}

/**
 * Updates the 3D laser pointer connecting the truck's front sensor to the rickshaw
 */
function updateTrackingLine() {
  const rx = targetGroup.position.x;
  const rz = targetGroup.position.z;
  
  // Connect sensor at (0, 0.8, 2.4) [Lorry Cab center-ish] to Target (rx, 0.8, rz)
  const positions = trackingLine.geometry.attributes.position.array;
  
  positions[0] = 0;
  positions[1] = 0.8;
  positions[2] = 2.4;
  
  positions[3] = rx;
  positions[4] = 0.8;
  positions[5] = rz;
  
  trackingLine.geometry.attributes.position.needsUpdate = true;
}

/**
 * Synthesizes sonar alert chimes using Web Audio API
 */
function initAudio() {
  if (audioCtx) return;
  
  // Initialize context on user click (browser autoplay security)
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContextClass();
}

function playWarningBeeps() {
  if (!audioEnabled || !audioCtx) return;
  if (audioCtx.state === 'suspended') return;

  const hasCriticalAlert = (simulation.telemetry.alertState.LEFT === "CRITICAL" || 
                            simulation.telemetry.alertState.RIGHT === "CRITICAL");

  if (!hasCriticalAlert) return;

  const range = simulation.telemetry.range; // in cm
  
  // Decide beep interval speed based on range inside danger zone
  let interval = 0.16; // rapid continuous beep
  let freq = 950;
  let vol = 0.14;
  
  if (range < 300) {
    interval = 0.12; // extremely rapid close warning
    freq = 1000;
    vol = 0.16;
  } else if (range < 600) {
    interval = 0.22; // rapid alert
    freq = 920;
    vol = 0.12;
  }

  const now = audioCtx.currentTime;
  if (now - lastBeepTime >= interval) {
    // Play synthetic alarm tone
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    
    // Quick ramp up and fade out to sound high-tech
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + beepDuration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start(now);
    osc.stop(now + beepDuration);
    
    lastBeepTime = now;
  }
}

/**
 * Updates UI values (telemetry panels, warning banners, lights)
 */
function updateUI() {
  const data = simulation.telemetry;

  // 1. Text Telemetry
  teleRange.textContent = data.range + " cm";
  
  if (simulation.activeTrajectory === "manual") {
    teleSpeed.textContent = "MANUAL";
    teleTtc.textContent = data.ttc;
  } else {
    teleSpeed.textContent = data.speed + " km/h";
    teleTtc.textContent = data.ttc;
  }

  // Adjust style tags depending on threat level
  if (data.ttc !== "Safe" && data.ttc !== "Stationary" && !data.ttc.includes(">")) {
    teleTtc.className = "telemetry-value active"; // red text
  } else {
    teleTtc.className = "telemetry-value";
  }

  // 2. Alert States & Alarm Banner Overlay
  let hasCritical = false;
  let hasAwareness = false;
  let alertSides = [];

  for (const key of Object.keys(data.activeZones)) {
    const card = document.getElementById(`card-${key}`);
    const stateText = document.getElementById(`state-${key}`);
    const zoneMesh = zonesMeshes[key];
    const alertState = data.alertState[key]; // NONE, AWARENESS, CRITICAL
    
    if (alertState === "CRITICAL") {
      hasCritical = true;
      alertSides.push(ZONES[key].name);

      // Update HTML sensor card to critical style
      card.className = "sensor-card active";
      stateText.className = "sensor-state alert";
      stateText.textContent = "CRITICAL";

      // Pulsate the 3D zone geometry in flashing red
      const flash = (Math.floor(Date.now() / 150) % 2 === 0);
      zoneMesh.material.opacity = flash ? 0.35 : 0.08;
      zoneMesh.material.color.setHex(0xff3333); // Flash Red
      zoneMesh.outline.opacity = 0.9;
      zoneMesh.outline.color.setHex(0xff3333);
    } else if (alertState === "AWARENESS") {
      hasAwareness = true;
      alertSides.push(ZONES[key].name);

      // Update HTML sensor card to awareness style
      card.className = "sensor-card warning";
      stateText.className = "sensor-state warning-state";
      stateText.textContent = "AWARENESS";

      // Glow yellow/orange
      zoneMesh.material.opacity = 0.18 + Math.sin(Date.now() * 0.005) * 0.04;
      zoneMesh.material.color.setHex(0xffaa00); // Amber/Yellow
      zoneMesh.outline.opacity = 0.7;
      zoneMesh.outline.color.setHex(0xffaa00);
    } else {
      // Restore secure state
      card.className = "sensor-card";
      stateText.className = "sensor-state safe";
      stateText.textContent = "SECURE";

      // Restore 3D default style
      zoneMesh.material.opacity = zoneMesh.defaultOpacity;
      zoneMesh.material.color.setHex(zoneMesh.defaultColor);
      zoneMesh.outline.opacity = 0.5;
      zoneMesh.outline.color.setHex(zoneMesh.defaultColor);
    }
  }

  // Bounding Box and dynamic lines highlight
  const activeModel = targetsMap[activeTargetKey].model;
  const targetBBox = activeModel.getObjectByName("TargetBoundingBox");
  const targetBrackets = activeModel.getObjectByName("TargetBrackets");

  if (hasCritical) {
    // Critical Alert Banner
    alertBanner.className = "alert-banner visible";
    alertBanner.style.background = "rgba(255, 51, 51, 0.25)";
    alertBanner.style.borderColor = "var(--accent-red)";
    alertBanner.style.boxShadow = "0 0 20px rgba(255, 51, 51, 0.4)";
    alertMessage.textContent = `CRITICAL DANGER: COLLISION THREAT IN ${alertSides.join(" & ")}`;
    
    systemIndicator.className = "status-indicator critical";
    systemText.textContent = "COLLISION WARNING";

    // Set 3D target boxes to solid red
    if (targetBBox) targetBBox.material.color.setHex(0xff3333);
    if (targetBrackets) {
      targetBrackets.traverse(child => {
        if (child.material) child.material.color.setHex(0xff3333);
      });
    }
    trackingLine.material.color.setHex(0xff3333);
    trackingLine.visible = true;
  } else if (hasAwareness) {
    // Awareness Stage Banner
    alertBanner.className = "alert-banner visible";
    alertBanner.style.background = "rgba(255, 170, 0, 0.15)";
    alertBanner.style.borderColor = "var(--accent-orange)";
    alertBanner.style.boxShadow = "0 0 20px rgba(255, 170, 0, 0.25)";
    alertMessage.textContent = `AWARENESS ALERT: VRU DETECTED IN ${alertSides.join(" & ")}`;
    
    systemIndicator.className = "status-indicator warning";
    systemText.textContent = "VRU AWARENESS";

    // Set 3D target boxes to yellow
    if (targetBBox) targetBBox.material.color.setHex(0xffaa00);
    if (targetBrackets) {
      targetBrackets.traverse(child => {
        if (child.material) child.material.color.setHex(0xffaa00);
      });
    }
    trackingLine.material.color.setHex(0xffaa00);
    trackingLine.visible = true;
  } else {
    alertBanner.className = "alert-banner";
    
    systemIndicator.className = "status-indicator";
    systemText.textContent = "SYSTEM ACTIVE";

    // Set 3D target boxes to green/cyan when safe
    if (targetBBox) targetBBox.material.color.setHex(0x00f2fe);
    if (targetBrackets) {
      targetBrackets.traverse(child => {
        if (child.material) child.material.color.setHex(0x00f2fe);
      });
    }
    trackingLine.material.color.setHex(0x00f2fe);
    
    // Hide laser line if target is too far
    if (data.range > 1300) {
      trackingLine.visible = false;
    } else {
      trackingLine.visible = true;
    }
  }

  // Update Lorry A-Pillar Warning LEDs
  const leftLight = lorry.getObjectByName("leftPillarLight");
  const rightLight = lorry.getObjectByName("rightPillarLight");

  // Left Light state
  if (leftLight) {
    const alertState = data.alertState.LEFT;
    if (alertState === "CRITICAL") {
      // Flashing Red
      const flash = (Math.floor(Date.now() / 150) % 2 === 0);
      leftLight.material.color.setHex(flash ? 0xff0000 : 0x222222);
      leftLight.material.emissive.setHex(flash ? 0xff0000 : 0x000000);
      leftLight.material.emissiveIntensity = flash ? 4.0 : 0.0;
    } else if (alertState === "AWARENESS") {
      // Solid Yellow
      leftLight.material.color.setHex(0xffff00);
      leftLight.material.emissive.setHex(0xffff00);
      leftLight.material.emissiveIntensity = 1.8;
    } else {
      // Off dark gray
      leftLight.material.color.setHex(0x222222);
      leftLight.material.emissive.setHex(0x000000);
      leftLight.material.emissiveIntensity = 0.0;
    }
  }

  // Right Light state
  if (rightLight) {
    const alertState = data.alertState.RIGHT;
    if (alertState === "CRITICAL") {
      // Flashing Red
      const flash = (Math.floor(Date.now() / 150) % 2 === 0);
      rightLight.material.color.setHex(flash ? 0xff0000 : 0x222222);
      rightLight.material.emissive.setHex(flash ? 0xff0000 : 0x000000);
      rightLight.material.emissiveIntensity = flash ? 4.0 : 0.0;
    } else if (alertState === "AWARENESS") {
      // Solid Yellow
      rightLight.material.color.setHex(0xffff00);
      rightLight.material.emissive.setHex(0xffff00);
      rightLight.material.emissiveIntensity = 1.8;
    } else {
      // Off dark gray
      rightLight.material.color.setHex(0x222222);
      rightLight.material.emissive.setHex(0x000000);
      rightLight.material.emissiveIntensity = 0.0;
    }
  }
}

/**
 * Raycasts against ground grid to support drag-and-drop mechanics
 */
function onPointerDown(event) {
  // Initialize audio on first click
  initAudio();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (simulation.activeTrajectory !== "manual") return;

  // Calculate mouse position in normalized device coordinates
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  
  // Check intersection with active model children
  const activeModel = targetsMap[activeTargetKey].model;
  const intersects = raycaster.intersectObjects(activeModel.children, true);

  if (intersects.length > 0) {
    isDragging = true;
    controls.enabled = false; // Disable orbit camera rotation while dragging
  }
}

function onPointerMove(event) {
  if (!isDragging || simulation.activeTrajectory !== "manual") return;

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  
  // Find intersection with the horizontal drag plane (Y=0)
  const intersectPoint = new THREE.Vector3();
  raycaster.ray.intersectPlane(dragPlane, intersectPoint);

  // Clamp dragging coordinates to stay within radar range
  const rx = Math.max(-12, Math.min(12, intersectPoint.x));
  const rz = Math.max(-18, Math.min(18, intersectPoint.z));

  // Update position
  targetGroup.position.set(rx, 0, rz);
  
  // Point the target to face forward (+Z) by default
  targetGroup.rotation.y = 0;
}

function onPointerUp() {
  if (isDragging) {
    isDragging = false;
    controls.enabled = true; // Re-enable camera rotation
  }
}

/**
 * Handles HUD buttons and Camera positioning
 */
function setupEventListeners() {
  // Window Resize
  window.addEventListener('resize', onWindowResize);

  // Pointer events for dragging rickshaw
  window.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  // Audio mute button
  audioToggle.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    audioToggle.textContent = audioEnabled ? "🔊" : "🔇";
    audioToggle.style.opacity = audioEnabled ? "1" : "0.5";
  });

  // Play Pause simulation
  simPlayPauseBtn.addEventListener('click', () => {
    simulation.togglePlay();
    simPlayPauseBtn.textContent = simulation.isPlaying ? "Pause Simulation" : "Resume Simulation";
    simPlayPauseBtn.style.borderColor = simulation.isPlaying ? "var(--accent-cyan)" : "var(--accent-green)";
    simPlayPauseBtn.style.color = simulation.isPlaying ? "var(--accent-cyan)" : "var(--accent-green)";
  });

  // Speed Slider
  simSpeedSlider.addEventListener('input', (e) => {
    const val = e.target.value;
    simulation.setSpeed(val);
    simSpeedLabel.textContent = parseFloat(val).toFixed(1) + "x";
  });

  // Preset Paths Toggles
  const paths = ["orbit", "overtake-left", "overtake-right", "manual"];
  paths.forEach(p => {
    const btn = document.getElementById(`path-${p}`);
    btn.addEventListener('click', () => {
      // Remove active from all
      paths.forEach(x => document.getElementById(`path-${x}`).className = "btn-preset");
      btn.className = "btn-preset active";
      
      // Update simulation path
      simulation.setTrajectory(p);

      // Edit helper instruction tag
      if (p === "manual") {
        instructionText.innerHTML = "💡 <strong>Manual Control:</strong> Click and hold the <span style='color: #00f2fe;'>Auto-Rickshaw</span> directly in the 3D viewport to drag it anywhere on the grid. Observe sensor feedback in real-time.";
        simPlayPauseBtn.style.display = "none";
      } else {
        const textMap = {
          "orbit": "💡 <strong>Preset Orbit Mode:</strong> The Auto-Rickshaw moves autonomously through the lateral blind spots. Drag the screen with <span class='key-tag'>Left Click</span> to rotate, <span class='key-tag'>Right Click</span> to pan, and <span class='key-tag'>Scroll</span> to zoom.",
          "overtake-left": "💡 <strong>Overtake Left:</strong> Simulates a hazardous left-hand blind spot pass. Watch how the target enters the lateral Left blind spot.",
          "overtake-right": "💡 <strong>Overtake Right:</strong> Simulates an overtaking maneuver on the right side cab lane."
        };
        instructionText.innerHTML = textMap[p];
        simPlayPauseBtn.style.display = "block";
      }
    });
  });

  // Camera Presets
  const cams = ["orbit", "radar", "morts", "mirror"];
  cams.forEach(c => {
    const btn = document.getElementById(`cam-${c}`);
    btn.addEventListener('click', () => {
      cams.forEach(x => document.getElementById(`cam-${x}`).className = "btn-camera");
      btn.className = "btn-camera active";
      switchCameraPreset(c);
    });
  });

  // Lorry Speed Slider binding
  const lorrySpeedSlider = document.getElementById("lorry-speed");
  const lorrySpeedLabel = document.getElementById("lorry-speed-label");
  lorrySpeedSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    simulation.lorrySpeed = val;
    lorrySpeedLabel.textContent = val + " km/h";
  });

  // Blinker Switch buttons binding
  const blinkers = ["left", "off", "right"];
  blinkers.forEach(b => {
    const btn = document.getElementById(`blinker-${b}`);
    btn.addEventListener('click', () => {
      // Toggle active classes
      blinkers.forEach(x => {
        document.getElementById(`blinker-${x}`).classList.remove("active");
      });
      btn.classList.add("active");
      
      // Update simulation value
      simulation.blinker = b.toUpperCase();
    });
  });

  // Steering Angle Slider binding
  const steeringAngleSlider = document.getElementById("steering-angle");
  const steeringLabel = document.getElementById("steering-label");
  steeringAngleSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    simulation.steeringAngle = val;
    steeringLabel.textContent = val + "°";
  });

  // Target Class Dropdown listener
  const targetSelect = document.getElementById("target-type-select");
  targetSelect.addEventListener('change', (e) => {
    const key = e.target.value;
    activeTargetKey = key;
    simulation.activeTargetKey = key; // Keep simulation in sync

    // Toggle visibility
    Object.keys(targetsMap).forEach(k => {
      targetsMap[k].model.visible = (k === key);
    });

    // Update 2D text label
    document.getElementById("tele-class").textContent = targetsMap[key].name;

    // Reset trajectory position
    simulation.resetRickshaw();
  });

  // HUD Sidebars Toggle Buttons
  const leftHud = document.querySelector(".left-sidebar");
  const rightHud = document.querySelector(".right-sidebar");
  const toggleLeftBtn = document.getElementById("toggle-left-hud");
  const toggleRightBtn = document.getElementById("toggle-right-hud");

  toggleLeftBtn.addEventListener('click', () => {
    leftHud.classList.toggle("collapsed");
    toggleLeftBtn.classList.toggle("active");
  });

  toggleRightBtn.addEventListener('click', () => {
    rightHud.classList.toggle("collapsed");
    toggleRightBtn.classList.toggle("active");
  });
}

/**
 * Camera preset transitions
 */
function switchCameraPreset(name) {
  controls.enabled = true;
  controls.reset();
  
  switch (name) {
    case "orbit":
      // Free Orbit default
      camera.position.set(9, 6, 11);
      controls.target.set(0, 1.2, 0);
      break;

    case "radar":
      // Top down flat view (Ortho look)
      camera.position.set(0, 22, -0.01);
      controls.target.set(0, 0, 0);
      controls.enabled = false; // Disable orbit control rotation to keep orthographic feel
      break;

    case "morts":
      // Side cab blind spot perspective
      camera.position.set(-7.5, 3.5, 5.0);
      controls.target.set(-1.8, 1.0, 1.8);
      break;

    case "mirror":
      // Driver left rearview mirror perspective looking backwards
      // Mirror position is approximately (-1.7, 2.4, 2.8) on Lorry mirror
      camera.position.set(-1.75, 2.38, 2.7);
      controls.target.set(-5.5, 1.2, -6.0); // look backward down the left side lane
      controls.enabled = false; // lock rotation to mirror angle
      break;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Start app
window.onload = init;
