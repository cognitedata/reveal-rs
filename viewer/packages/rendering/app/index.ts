/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { CadModelFactory } from '../../cad-model/src/CadModelFactory';
import { AntiAliasingMode, CadMaterialManager, defaultRenderOptions, DefaultRenderPipeline } from '@reveal/rendering';
import { CdfModelDataProvider, CdfModelIdentifier, CdfModelMetadataProvider } from '@reveal/modeldata-api';
import { CadManager } from '../../cad-model/src/CadManager';
import { NumericRange, revealEnv } from '@reveal/utilities';
import dat from 'dat.gui';
import { createApplicationSDK } from '../../../test-utilities/src/appUtils';
import { CadModelUpdateHandler, defaultDesktopCadModelBudget } from '@reveal/cad-geometry-loaders';
import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@reveal/cad-styling';
import { ByScreenSizeSectorCuller } from '@reveal/cad-geometry-loaders/src/sector/culling/ByScreenSizeSectorCuller';
import { StepPipelineExecutor } from '../src/pipeline-executors/StepPipelineExecutor';

revealEnv.publicPath = 'https://apps-cdn.cogniteapp.com/@cognite/reveal-parser-worker/1.2.0/';

init();

async function init() {
  const gui = new dat.GUI();

  const guiData = { drawCalls: 0, steps: 16, canvasColor: '#50728c', clearColor: '#444', clearAlpha: 1 };
  const guiController = gui.add(guiData, 'drawCalls').listen();

  const client = await createApplicationSDK('reveal.example.simple', {
    project: '3d-test',
    cluster: 'greenfield',
    clientId: 'a03a8caf-7611-43ac-87f3-1d493c085579',
    tenantId: '20a88741-8181-4275-99d9-bd4451666d6e'
  });

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  // Defaults to all-primitives model on 3d-test
  const modelId = parseInt(urlParams.get('modelId') ?? '1791160622840317');
  // const modelId = parseInt(urlParams.get('modelId') ?? '5244774438818744');

  const revisionId = parseInt(urlParams.get('revisionId') ?? '498427137020189');
  // const revisionId = parseInt(urlParams.get('revisionId') ?? '2249063501234508');

  const modelIdentifier = new CdfModelIdentifier(modelId, revisionId);
  const cdfModelMetadataProvider = new CdfModelMetadataProvider(client);
  const cdfModelDataProvider = new CdfModelDataProvider(client);

  const materialManager = new CadMaterialManager();
  const cadModelFactory = new CadModelFactory(materialManager, cdfModelMetadataProvider, cdfModelDataProvider);
  const cadModelUpdateHandler = new CadModelUpdateHandler(new ByScreenSizeSectorCuller(), false);

  const cadManager = new CadManager(materialManager, cadModelFactory, cadModelUpdateHandler);
  cadManager.budget = defaultDesktopCadModelBudget;
  const scene = new THREE.Scene();
  const cogniteModels = new THREE.Group();
  const customObjects = new THREE.Group();

  scene.add(cogniteModels);
  scene.add(customObjects);

  const model = await cadManager.addModel(modelIdentifier);
  cogniteModels.add(model);
  model.updateMatrix();
  model.updateWorldMatrix(true, true);

  const bb: THREE.Box3 = (model as any)._cadModelMetadata.scene.getBoundsOfMostGeometry().clone();
  bb.applyMatrix4(model.children[0].matrix);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(guiData.clearColor);
  renderer.setClearAlpha(guiData.clearAlpha);

  const controlsTest = new TransformControls(camera, renderer.domElement);
  controlsTest.attach(model);
  customObjects.add(controlsTest);

  const renderOptions = defaultRenderOptions;
  renderOptions.multiSampleCountHint = 4;

  const pipelineExecutor = new StepPipelineExecutor(renderer);
  pipelineExecutor.numberOfSteps = guiData.steps;

  const defaultRenderPipeline = new DefaultRenderPipeline(
    materialManager,
    scene,
    defaultRenderOptions,
    [{ model, modelIdentifier: model.cadModelIdentifier }],
    customObjects.children
  );
  gui.add(guiData, 'steps', 1, pipelineExecutor.calcNumSteps(defaultRenderPipeline), 1).onChange(async () => {
    pipelineExecutor.numberOfSteps = guiData.steps;
    renderer.setClearColor(guiData.clearColor);
    renderer.setClearAlpha(guiData.clearAlpha);
    await render();
  });

  gui.addColor(guiData, 'clearColor').onChange(async () => {
    renderer.setClearColor(guiData.clearColor);
    renderer.setClearAlpha(guiData.clearAlpha);
    await render();
  });

  gui.add(guiData, 'clearAlpha', 0, 1).onChange(async () => {
    renderer.setClearColor(guiData.clearColor);
    renderer.setClearAlpha(guiData.clearAlpha);
    await render();
  });

  gui.addColor(guiData, 'canvasColor').onChange(async () => {
    renderer.domElement.style.backgroundColor = guiData.canvasColor;
  });

  const grid = new THREE.GridHelper(30, 40);
  grid.position.set(14, -1, -14);
  customObjects.add(grid);

  const customBox = new THREE.Mesh(
    new THREE.BoxGeometry(10, 10, 30),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(1, 0, 0),
      transparent: true,
      opacity: 0.5,
      depthTest: true
    })
  );
  customBox.position.set(15, 0, -15);

  customObjects.add(customBox);

  renderer.domElement.style.backgroundColor = guiData.canvasColor;

  const controls = new OrbitControls(camera, renderer.domElement);

  fitCameraToBoundingBox(bb, camera, controls);

  cadModelUpdateHandler.updateCamera(camera);

  document.body.appendChild(renderer.domElement);

  const nodeAppearanceProvider = materialManager.getModelNodeAppearanceProvider('0');
  nodeAppearanceProvider.assignStyledNodeCollection(
    new TreeIndexNodeCollection(new NumericRange(0, 10)),
    DefaultNodeAppearance.Ghosted
  );

  nodeAppearanceProvider.assignStyledNodeCollection(
    new TreeIndexNodeCollection(new NumericRange(10, 20)),
    DefaultNodeAppearance.Highlighted
  );

  nodeAppearanceProvider.assignStyledNodeCollection(new TreeIndexNodeCollection(new NumericRange(40, 41)), {
    ...DefaultNodeAppearance.Default,
    outlineColor: 6
  });

  const updateRenderOptions = async () => {
    defaultRenderPipeline.renderOptions = renderOptions;
    await render();
  };

  const renderOptionsGUI = gui.addFolder('Render Options');
  renderOptionsGUI.open();

  const edgeDetectionParametersGUI = renderOptionsGUI.addFolder('Edge Detection');
  edgeDetectionParametersGUI.add(renderOptions.edgeDetectionParameters, 'enabled').onChange(updateRenderOptions);
  edgeDetectionParametersGUI.open();

  const antiAliasingGui = renderOptionsGUI.addFolder('Anti Aliasing');
  antiAliasingGui
    .add(renderOptions, 'antiAliasing', { NoAA: AntiAliasingMode.NoAA, FXAA: AntiAliasingMode.FXAA })
    .onChange(updateRenderOptions);
  antiAliasingGui.add(renderOptions, 'multiSampleCountHint', 0, 16, 1).onChange(updateRenderOptions);
  antiAliasingGui.open();

  const ssaoOptionsGui = renderOptionsGUI.addFolder('SSAO');
  ssaoOptionsGui.add(renderOptions.ssaoRenderParameters, 'sampleRadius', 0, 30).onChange(updateRenderOptions);
  ssaoOptionsGui.add(renderOptions.ssaoRenderParameters, 'sampleSize', 1, 256, 1).onChange(updateRenderOptions);
  ssaoOptionsGui.add(renderOptions.ssaoRenderParameters, 'depthCheckBias', 0, 1).onChange(updateRenderOptions);
  ssaoOptionsGui.open();

  controls.addEventListener('change', async () => {
    cadModelUpdateHandler.updateCamera(camera);
    await render();
  });

  const render = async () => {
    await pipelineExecutor.render(defaultRenderPipeline, camera);
    guiData.drawCalls = renderer.info.render.calls;
    guiController.updateDisplay();
  };

  renderer.setAnimationLoop(async () => {
    controls.update();
    if (!cadManager.needsRedraw) {
      return;
    }

    await render();
    cadManager.resetRedraw();
  });
}

function fitCameraToBoundingBox(
  box: THREE.Box3,
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  radiusFactor: number = 2
): void {
  const center = new THREE.Vector3().lerpVectors(box.min, box.max, 0.5);
  const radius = 0.5 * new THREE.Vector3().subVectors(box.max, box.min).length();
  const boundingSphere = new THREE.Sphere(center, radius);

  const target = boundingSphere.center;
  const distance = boundingSphere.radius * radiusFactor;
  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(camera.quaternion);

  const position = new THREE.Vector3();
  position.copy(direction).multiplyScalar(-distance).add(target);

  camera.position.copy(position);
  controls.target.copy(target);
}
