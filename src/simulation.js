/**
 * Handles the simulation state, trajectories, collision detection (blind spot zones),
 * and telemetry calculation.
 */

// Define 2D polygons for the blind spot zones in the X-Z plane
// Coordinates relative to truck center (0,0)
// Truck Cab front: Z = 3.4, Bumper Z = 3.5, Rear Tailgate Z = -4.4
// Left side X = -1.2, Right side X = 1.2
export const ZONES = {
  LEFT: {
    id: "LEFT",
    name: "ANGLES MORTS (L)",
    color: 0xffaa00,
    polygon: [
      [-1.2, 3.5],
      [-4.2, 3.5],
      [-3.2, -1.0],
      [-1.2, -1.0]
    ]
  },
  RIGHT: {
    id: "RIGHT",
    name: "ANGLES MORTS (R)",
    color: 0xffaa00,
    polygon: [
      [1.2, 3.5],
      [4.2, 3.5],
      [3.2, -1.0],
      [1.2, -1.0]
    ]
  }
};

/**
 * Checks if a point (x, z) is inside a 2D polygon using ray-casting algorithm
 */
function isPointInPolygon(x, z, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], zi = polygon[i][1];
    const xj = polygon[j][0], zj = polygon[j][1];
    
    const intersect = ((zi > z) !== (zj > z))
        && (x < (xj - xi) * (z - zi) / (zj - zi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export class BlindSpotSimulation {
  constructor(lorry, rickshaw) {
    this.lorry = lorry;
    this.rickshaw = rickshaw;
    
    this.activeTrajectory = "orbit"; // orbit, overtake-left, overtake-right, tailgate, manual
    this.isPlaying = true;
    this.speedMultiplier = 1.0;
    this.time = 0;
    
    // Interactive inputs for adaptive alerts
    this.lorrySpeed = 0; // in km/h
    this.blinker = "OFF"; // LEFT, OFF, RIGHT
    this.steeringAngle = 0; // in degrees (-45 to +45)
    this.activeTargetKey = "rickshaw"; // current target key
    
    // Telemetry data
    this.telemetry = {
      range: 0,       // in cm
      speed: 0,       // in km/h
      ttc: "--",      // time to collision (seconds)
      activeZones: {
        LEFT: false,
        RIGHT: false
      },
      alertState: {
        LEFT: "NONE",   // NONE, AWARENESS, CRITICAL
        RIGHT: "NONE"
      },
      lastPosition: { x: 0, z: 0 }
    };
    
    // Set initial position
    this.resetRickshaw();
  }

  setTrajectory(name) {
    this.activeTrajectory = name;
    this.time = 0;
    this.resetRickshaw();
  }

  resetRickshaw() {
    if (this.activeTrajectory === "manual") {
      this.rickshaw.position.set(-3.0, 0, 1.0);
    } else {
      this.updatePosition(0);
    }
    this.telemetry.lastPosition.x = this.rickshaw.position.x;
    this.telemetry.lastPosition.z = this.rickshaw.position.z;
  }

  togglePlay() {
    this.isPlaying = !this.isPlaying;
  }

  setSpeed(multiplier) {
    this.speedMultiplier = parseFloat(multiplier);
  }

  update(deltaTime) {
    if (!this.isPlaying && this.activeTrajectory !== "manual") return;

    if (this.activeTrajectory !== "manual") {
      this.time += deltaTime * this.speedMultiplier;
      this.updatePosition(this.time);
    }

    this.calculateTelemetry(deltaTime);
  }

  /**
   * Computes the Rickshaw's position along predefined parametric trajectories
   */
  updatePosition(t) {
    const rx = this.rickshaw.position;
    let targetX = 0;
    let targetZ = 0;
    let angle = 0;

    switch (this.activeTrajectory) {
      case "orbit":
        // Slow rotation around the truck, tracing through all blind spots
        // Orbit radius: 5.5 meters, period: ~15 seconds
        angle = t * 0.4;
        targetX = Math.sin(angle) * 5.0;
        targetZ = Math.cos(angle) * 7.5 - 1.0;
        
        // Orientation faces the direction of motion
        rx.set(targetX, 0, targetZ);
        this.rickshaw.rotation.y = angle + Math.PI / 2;
        break;

      case "overtake-left":
        // Rickshaw approaches from behind, passes on the left, goes in front
        // Cycle period: ~12 seconds
        {
          const cycle = (t * 0.5) % 12;
          if (cycle < 4) {
            // Approaching from Z = -16 to Z = -5, X = -3.2 (Rear No-zone & approaching left)
            const p = cycle / 4;
            targetX = -3.0;
            targetZ = -16.0 + p * 11.0;
            this.rickshaw.rotation.y = 0; // facing forward (+Z)
          } else if (cycle < 8) {
            // Passing left side Z = -5 to Z = 5
            const p = (cycle - 4) / 4;
            targetX = -3.0 + p * 0.5; // slight drift closer
            targetZ = -5.0 + p * 10.0;
            this.rickshaw.rotation.y = 0.05 * Math.sin(p * Math.PI);
          } else {
            // Cut in front Z = 5 to Z = 14, moving back to center X = 0
            const p = (cycle - 8) / 4;
            targetX = -2.5 + p * 2.5;
            targetZ = 5.0 + p * 9.0;
            this.rickshaw.rotation.y = -0.3 * (1 - p); // turning back into lane
          }
          rx.set(targetX, 0, targetZ);
        }
        break;

      case "overtake-right":
        // Symmetrical to left pass
        {
          const cycle = (t * 0.5) % 12;
          if (cycle < 4) {
            const p = cycle / 4;
            targetX = 3.0;
            targetZ = -16.0 + p * 11.0;
            this.rickshaw.rotation.y = 0;
          } else if (cycle < 8) {
            const p = (cycle - 4) / 4;
            targetX = 3.0 - p * 0.5;
            targetZ = -5.0 + p * 10.0;
            this.rickshaw.rotation.y = -0.05 * Math.sin(p * Math.PI);
          } else {
            const p = (cycle - 8) / 4;
            targetX = 2.5 - p * 2.5;
            targetZ = 5.0 + p * 9.0;
            this.rickshaw.rotation.y = 0.3 * (1 - p);
          }
          rx.set(targetX, 0, targetZ);
        }
        break;

      case "tailgate":
        // Stay close behind the truck, swaying side to side in Rear No-Zone
        targetX = Math.sin(t * 1.5) * 1.5;
        targetZ = -7.0 + Math.cos(t * 0.7) * 1.0;
        rx.set(targetX, 0, targetZ);
        // Face forward, slightly swaying orientation
        this.rickshaw.rotation.y = Math.sin(t * 1.5) * 0.1;
        break;
    }
  }

  /**
   * Performs geometry checks and updates warning status and live values
   */
  calculateTelemetry(deltaTime) {
    const rx = this.rickshaw.position.x;
    const rz = this.rickshaw.position.z;
    
    // 1. Calculate Range (distance in 2D plane X-Z, from lorry center 0,0)
    // To represent distance from closest boundary, we just do center-to-center for simple telemetry
    const distance = Math.sqrt(rx * rx + rz * rz);
    this.telemetry.range = Math.round(distance * 100); // meters to cm

    // 2. Calculate Speed (relative in km/h)
    if (this.activeTrajectory === "manual") {
      this.telemetry.speed = 0;
    } else {
      // Calculate speed based on position delta
      const dx = rx - this.telemetry.lastPosition.x;
      const dz = rz - this.telemetry.lastPosition.z;
      const deltaDist = Math.sqrt(dx * dx + dz * dz);
      
      // Speed = dist / time. Convert to km/h (1 m/s = 3.6 km/h)
      let currentSpeed = 0;
      if (deltaTime > 0) {
        currentSpeed = (deltaDist / deltaTime) * 3.6;
      }
      
      // Smooth out speed with simple low-pass filter to prevent simulation jitters
      this.telemetry.speed = Math.round(this.telemetry.speed * 0.8 + currentSpeed * 0.2);
    }
    
    // Store current position for next frame delta
    this.telemetry.lastPosition.x = rx;
    this.telemetry.lastPosition.z = rz;

    // 3. Collision Zone Detection & Speed-Adaptive Alert Logic Gate
    let isAnyZoneActive = false;
    
    // VRU Check (Person, Bicycle, Motorcycle)
    const isVRU = (this.activeTargetKey === "pedestrian" || 
                   this.activeTargetKey === "bicycle" || 
                   this.activeTargetKey === "motorcycle");
                   
    // Calculate speed-adaptive danger zone threshold in meters
    // < 40 km/h: 2.0m; > 80 km/h: 6.0m; linear in between
    let dangerThreshold = 2.0;
    if (this.lorrySpeed >= 80) {
      dangerThreshold = 6.0;
    } else if (this.lorrySpeed > 40) {
      dangerThreshold = 2.0 + (this.lorrySpeed - 40) * 0.1;
    }

    // Driver Turn Intent
    const turnIntentLeft = (this.blinker === "LEFT" || this.steeringAngle < -5);
    const turnIntentRight = (this.blinker === "RIGHT" || this.steeringAngle > 5);

    for (const key of Object.keys(ZONES)) {
      const zone = ZONES[key];
      const isInside = isPointInPolygon(rx, rz, zone.polygon);
      this.telemetry.activeZones[key] = isInside;
      if (isInside) {
        isAnyZoneActive = true;
      }
      
      // Default to NONE
      this.telemetry.alertState[key] = "NONE";
      
      if (isInside && isVRU) {
        // VRU detected in blind spot -> Awareness stage
        this.telemetry.alertState[key] = "AWARENESS";
        
        // Critical stage logic gate
        const isWithinDangerZone = (distance < dangerThreshold);
        const hasTurnIntent = (key === "LEFT" ? turnIntentLeft : turnIntentRight);
        
        if (isWithinDangerZone && hasTurnIntent) {
          this.telemetry.alertState[key] = "CRITICAL";
        }
      }
    }

    // 4. Calculate Time-to-Collision (TTC)
    // If the rickshaw is moving closer to the truck, estimate collision
    const relativeSpeedMS = (this.telemetry.speed / 3.6); // km/h to m/s
    
    if (isAnyZoneActive && relativeSpeedMS > 0.5) {
      // Approaching
      const ttcVal = distance / relativeSpeedMS;
      if (ttcVal < 15.0) {
        this.telemetry.ttc = ttcVal.toFixed(1) + "s";
      } else {
        this.telemetry.ttc = "> 15s";
      }
    } else if (isAnyZoneActive) {
      this.telemetry.ttc = "Stationary";
    } else {
      this.telemetry.ttc = "Safe";
    }
  }
}
