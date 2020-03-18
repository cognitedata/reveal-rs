/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as reveal from '@cognite/reveal';
import * as reveal_threejs from '@cognite/reveal/threejs';

import CameraControls from 'camera-controls';
import dat from 'dat.gui';
import {
  createRendererDebugWidget,
  applyRenderingFilters,
  RenderMode,
  RenderOptions
} from './utils/renderer-debug-widget';
import { loadCadModelFromCdfOrUrl, createModelIdentifierFromUrlParams } from './utils/loaders';

CameraControls.install({ THREE });

function initializeModel(
  cadModel: reveal.CadModel,
  canvas: HTMLCanvasElement,
  gui: dat.GUI
): [THREE.WebGLRenderer, THREE.Scene, reveal_threejs.CadNode, RenderOptions] {
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setClearColor('#444');
  renderer.setSize(canvas.width, canvas.height);

  const sectorScene = cadModel.scene;
  const scene = new THREE.Scene();
  const sectorModelNode = new reveal_threejs.CadNode(cadModel);
  scene.add(sectorModelNode);
  const options = createRendererDebugWidget(sectorScene.root, renderer, sectorModelNode, gui);

  return [renderer, scene, sectorModelNode, options];
}

async function main() {
  const params = new URL(location.href).searchParams;
  const modelIdentifier1 = createModelIdentifierFromUrlParams(params, '/primitives', 'model1', 'project', 'modelUrl1');
  const modelIdentifier2 = createModelIdentifierFromUrlParams(
    params,
    modelIdentifier1,
    'model2',
    'project',
    'modelUrl2'
  );
  const modelHeader1 = params.get('modelUrl1') || `${params.get('model1')}@${params.get('project')}`;
  const modelHeader2 = params.get('modelUrl2') || `${params.get('model2')}@${params.get('project')}`;

  // Page layout
  const gui1 = new dat.GUI({ autoPlace: false, width: 300 });
  const gui2 = new dat.GUI({ autoPlace: false, width: 300 });
  document.getElementById('gui1')!.appendChild(gui1.domElement);
  document.getElementById('gui2')!.appendChild(gui2.domElement);
  document.getElementById('header1')!.appendChild(document.createTextNode(modelHeader1));
  document.getElementById('header2')!.appendChild(document.createTextNode(modelHeader2));
  const leftCanvas = document.getElementById('leftCanvas')! as HTMLCanvasElement;
  const rightCanvas = document.getElementById('rightCanvas')! as HTMLCanvasElement;

  // Initialize models
  const model1 = await loadCadModelFromCdfOrUrl(modelIdentifier1);
  const model2 = await loadCadModelFromCdfOrUrl(modelIdentifier2);
  const [renderer1, scene1, modelNode1, options1] = initializeModel(model1, leftCanvas, gui1);
  const [renderer2, scene2, modelNode2, options2] = initializeModel(model2, rightCanvas, gui2);

  const { position, target, near, far } = modelNode1.suggestCameraConfig();
  const camera = new THREE.PerspectiveCamera(75, leftCanvas.width / leftCanvas.height, near, far);
  const controls = new CameraControls(camera, leftCanvas);
  controls.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z);
  controls.update(0.0);
  camera.updateMatrixWorld();

  const clock = new THREE.Clock();
  const render = async () => {
    requestAnimationFrame(render);

    const delta = clock.getDelta();
    const controlsNeedUpdate = controls.update(delta);
    const sectors1NeedUpdate = options1.loadingEnabled && (await modelNode1.update(camera));
    const sectors2NeedUpdate = options2.loadingEnabled && (await modelNode2.update(camera));

    if (
      options1.renderMode === RenderMode.AlwaysRender ||
      (options1.renderMode === RenderMode.WhenNecessary && (controlsNeedUpdate || sectors1NeedUpdate))
    ) {
      applyRenderingFilters(scene1, options1.renderFilter);
      renderer1.render(scene1, camera);
    }
    if (
      options2.renderMode === RenderMode.AlwaysRender ||
      (options2.renderMode === RenderMode.WhenNecessary && (controlsNeedUpdate || sectors2NeedUpdate))
    ) {
      applyRenderingFilters(scene2, options2.renderFilter);
      renderer2.render(scene2, camera);
    }
  };
  render();
}

main();
