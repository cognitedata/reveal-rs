/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { Vector3 } from 'three';
import ComboControls from '../';
import Keyboard from '../src/Keyboard';

let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let controls: ComboControls;
let sphere: THREE.Mesh;
let keyboard: Keyboard;
let cuState: {
  position: THREE.Vector3;
  target: THREE.Vector3;
};

init();

function init() {
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 1000);

  scene = new THREE.Scene();

  keyboard = new Keyboard();

  const grid = new THREE.GridHelper(40, 40);
  scene.add(grid);

  const geometry = new THREE.BoxGeometry(10, 10, 10);
  const material = new THREE.MeshNormalMaterial();

  const sphereGeometry = new THREE.SphereGeometry(1);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color: 'green' });
  sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(sphere);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(0, 5, 0);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(render);

  controls = new ComboControls(camera, renderer.domElement);
  controls.dynamicTarget = false;
  controls.minDistance = 0.1;
  controls.enabled = true;

  controls.setState(new THREE.Vector3(0, 20, 20), new THREE.Vector3());

  sphere.position.copy(controls.getState().target);

  document.body.appendChild(renderer.domElement);
}

function render(time: number) {
  cuState = controls.getState();

  if (keyboard.isPressed('c')) {
    controls.setState(cuState.position, cuState.target.add(new Vector3(-0.05, 0, 0)));
  }
  if (keyboard.isPressed('b')) {
    controls.setState(cuState.position, cuState.target.add(new Vector3(0.05, 0, 0)));
  }
  if (keyboard.isPressed('f')) {
    controls.setState(cuState.position, cuState.target.copy(new Vector3(3, 2, 0)));
  }

  controls.update(time);
  sphere.position.copy(controls.getState().target);
  renderer.render(scene, camera);
}
