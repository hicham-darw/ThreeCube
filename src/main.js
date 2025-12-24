import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

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

//display axes for debugging
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
camera.position.set(0, 2, 5);

// orbit for cotrol view from camera by mouse
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

//geometry and materials for box
const boxGeometry = new THREE.BoxGeometry();
const boxMaterial = new THREE.MeshBasicMaterial({color: 0xfffff0});
const box = new THREE.Mesh(boxGeometry, boxMaterial)
scene.add(box);

const planeGeometry = new THREE.PlaneGeometry(20, 20);
const planeMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
const gridHelper = new THREE.GridHelper(20, 20);
plane.rotateX(-Math.PI / 2);
scene.add(gridHelper)

scene.add(plane)


function animate(){
  box.rotation.x += 0.01
  box.rotation.y += 0.01
  renderer.render(scene, camera);
};

renderer.setAnimationLoop(animate);