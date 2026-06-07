import * as THREE from 'three';

// Define positions in lorryGroup space
const camPos = new THREE.Vector3(9, 6, 11);
const camTarget = new THREE.Vector3(0, 1.2, 0);

// Warning light position
const rightLightPos = new THREE.Vector3(1.21, 1.6 + 1.25, 2.4 + 0.83); // (1.21, 2.85, 3.23)

// Mirror plate position
const rightMirrorPos = new THREE.Vector3(1.7, 2.4, 2.8);

// Mirror plate size: 0.04 width, 0.35 height, 0.2 depth
// Let's check the bounding box of the mirror plate
const mirrorMin = new THREE.Vector3(1.7 - 0.02, 2.4 - 0.175, 2.8 - 0.1);
const mirrorMax = new THREE.Vector3(1.7 + 0.02, 2.4 + 0.175, 2.8 + 0.1);

console.log("Right Light Position:", rightLightPos);
console.log("Mirror Bounding Box: Min:", mirrorMin, "Max:", mirrorMax);

// Let's set up the camera projection matrix
const aspect = 1.777; // e.g. 16:9
const camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
camera.position.copy(camPos);
camera.lookAt(camTarget);
camera.updateMatrixWorld();
camera.updateProjectionMatrix();

// Project positions to screen coordinates (Normalized Device Coordinates: NDC)
const rightLightProj = rightLightPos.clone().project(camera);
const mirrorProj = rightMirrorPos.clone().project(camera);

console.log("Right Light NDC:", rightLightProj);
console.log("Mirror Center NDC:", mirrorProj);

// Let's check if the ray from camera to rightLightPos intersects the mirror bounding box
const rayDirection = new THREE.Vector3().subVectors(rightLightPos, camPos).normalize();
const ray = new THREE.Ray(camPos, rayDirection);

const bbox = new THREE.Box3(mirrorMin, mirrorMax);
const intersectionPoint = new THREE.Vector3();
const intersects = ray.intersectBox(bbox, intersectionPoint);

console.log("Intersects mirror bounding box?", intersects !== null);
if (intersects) {
  console.log("Intersection point:", intersectionPoint);
  const distToInter = camPos.distanceTo(intersectionPoint);
  const distToLight = camPos.distanceTo(rightLightPos);
  console.log("Distance to intersection:", distToInter);
  console.log("Distance to light:", distToLight);
  if (distToInter < distToLight) {
    console.log("OCCLUSION CONFIRMED: The mirror plate blocks the warning light from the camera!");
  } else {
    console.log("No occlusion: The intersection is behind the light.");
  }
} else {
  console.log("No intersection with mirror bounding box.");
}
