import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

// Display axes for debugging
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
camera.position.set(0, 2, 5);

// Orbit for control view from camera by mouse
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

// Create plane
const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);
plane.rotation.x = 0.5 * -Math.PI;

const gridHelper = new THREE.GridHelper(40, 40);
scene.add(gridHelper);

// Lighting
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const directionalLight = new THREE.DirectionalLight(0xffffff, 10);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Player variables
let player = null;
const playerSpeed = 0.1;
const playerRotationSpeed = 0.05;

// Movement state
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  q: false, // rotate left
  e: false  // rotate right
};

// Load player model
const loader = new GLTFLoader();
loader.load(
  "solider_walk.glb",
  (gltf) => {
    player = gltf.scene;
    player.scale.set(0.01, 0.01, 0.01);
    player.position.set(0, 0, 0);
    
    // Optional: Store the initial rotation for reference
    player.userData.initialRotation = player.rotation.y;
    
    scene.add(player);
    
    // Add a player helper (small cube at player's position for debugging)
    const playerHelper = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.2, 0.2),
      new THREE.MeshBasicMaterial({ color: 0xff0000 })
    );
    playerHelper.position.y = 1;
    player.add(playerHelper);
  },
  undefined,
  (error) => {
    console.error("GLTF error:", error);
  }
);

// Set up keyboard controls
document.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (keys.hasOwnProperty(key)) {
    keys[key] = true;
  }
});

document.addEventListener('keyup', (event) => {
  const key = event.key.toLowerCase();
  if (keys.hasOwnProperty(key)) {
    keys[key] = false;
  }
});

// Movement functions
function movePlayer() {
  if (!player) return;
  
  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  
  // Get forward and right vectors based on player's rotation
  player.getWorldDirection(forward);
  forward.y = 0; // Keep movement horizontal
  forward.normalize();
  
  right.crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();
  
  // Movement based on keys
  if (keys.w) {
    player.position.addScaledVector(forward, playerSpeed);
  }
  if (keys.s) {
    player.position.addScaledVector(forward, -playerSpeed);
  }
  if (keys.a) {
    player.position.addScaledVector(right, -playerSpeed);
  }
  if (keys.d) {
    player.position.addScaledVector(right, playerSpeed);
  }
  
  // Rotation
  if (keys.q) {
    player.rotation.y += playerRotationSpeed;
  }
  if (keys.e) {
    player.rotation.y -= playerRotationSpeed;
  }
  
  // Optional: Keep player on plane
  if (player.position.x > 14) player.position.x = 14;
  if (player.position.x < -14) player.position.x = -14;
  if (player.position.z > 14) player.position.z = 14;
  if (player.position.z < -14) player.position.z = -14;
}

// Camera follow options (uncomment one method)

// Method 1: Fixed camera position (current orbit controls)
// Camera stays where you position it with mouse

// Method 2: Third-person follow camera
function setupThirdPersonCamera() {
  if (!player) return;
  
  // Set camera to follow behind player
  const cameraOffset = new THREE.Vector3(0, 2, 5);
  cameraOffset.applyQuaternion(player.quaternion);
  camera.position.copy(player.position).add(cameraOffset);
  
  // Make camera look at player
  camera.lookAt(player.position);
  camera.position.y = Math.max(camera.position.y, 1); // Keep camera above ground
}

// Method 3: Top-down camera
function setupTopDownCamera() {
  if (!player) return;
  
  camera.position.set(player.position.x, 10, player.position.z);
  camera.lookAt(player.position);
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  
  // Update player movement
  movePlayer();
  
  // Choose camera mode (uncomment one):
  // setupThirdPersonCamera(); // Third-person follow
  // setupTopDownCamera();     // Top-down view
  
  // Update orbit controls if using them
  orbit.update();
  
  renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add UI instructions
function addInstructions() {
  const instructions = document.createElement('div');
  instructions.style.position = 'absolute';
  instructions.style.top = '10px';
  instructions.style.left = '10px';
  instructions.style.color = 'white';
  instructions.style.backgroundColor = 'rgba(0,0,0,0.5)';
  instructions.style.padding = '10px';
  instructions.style.fontFamily = 'Arial, sans-serif';
  instructions.style.fontSize = '14px';
  instructions.innerHTML = `
    <strong>Controls:</strong><br>
    W/A/S/D - Move<br>
    Q/E - Rotate<br>
    Mouse drag - Rotate camera<br>
    Mouse wheel - Zoom
  `;
  document.body.appendChild(instructions);
}

// Initialize
renderer.setAnimationLoop(animate);
addInstructions();