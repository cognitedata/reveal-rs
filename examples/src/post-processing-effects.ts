/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as reveal_threejs from '@cognite/reveal/threejs';

import CameraControls from 'camera-controls';
import { loadCadModelFromCdfOrUrl, createModelIdentifierFromUrlParams, createClientIfNecessary } from './utils/loaders';

const postprocessing = require('postprocessing');

CameraControls.install({ THREE });

async function main() {
  const urlParams = new URL(location.href).searchParams;
  const modelId = createModelIdentifierFromUrlParams(urlParams, '/primitives');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer();
  renderer.setClearColor('#000000');
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const cadModel = await loadCadModelFromCdfOrUrl(modelId, await createClientIfNecessary(modelId));
  const cadModelNode = new reveal_threejs.CadNode(cadModel);
  let modelNeedsUpdate = false;
  cadModelNode.addEventListener('update', () => {
    modelNeedsUpdate = true;
  });
  scene.add(cadModelNode);

  const controls = new CameraControls(camera, renderer.domElement);
  const pos = new THREE.Vector3(100, 100, 100);
  const target = new THREE.Vector3(0, 0, 0);
  controls.setLookAt(pos.x, pos.y, pos.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();
  cadModelNode.update(camera);

  // See https://vanruesc.github.io/postprocessing/public/docs/identifiers.html
  const effectPass = new postprocessing.EffectPass(camera, new postprocessing.DotScreenEffect());
  effectPass.renderToScreen = true;
  const effectComposer = new postprocessing.EffectComposer(renderer);
  effectComposer.addPass(new postprocessing.RenderPass(scene, camera));
  effectComposer.addPass(effectPass);

  const clock = new THREE.Clock();
  const render = () => {
    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    if (controlsNeedUpdate) {
      cadModelNode.update(camera);
    }

    const needsUpdate = controlsNeedUpdate || modelNeedsUpdate;
    if (needsUpdate) {
      effectComposer.render(delta);
    }
    requestAnimationFrame(render);
  };
  render();

  (window as any).scene = scene;
  (window as any).THREE = THREE;
  (window as any).camera = camera;
  (window as any).controls = controls;
}

main();
