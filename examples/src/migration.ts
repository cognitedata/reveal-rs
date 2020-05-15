/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import * as reveal from '@cognite/reveal';
import { CogniteClient } from '@cognite/sdk';
import dat from 'dat.gui';

async function main() {
  const urlParams = new URL(location.href).searchParams;
  const project = urlParams.get('project');
  if (!project) {
    throw new Error('Must provide "project"as URL parameter');
  }
  const domElement = document.getElementById('canvas-container')!;

  const slicingParams = {
    enabled: false,
    width: 100,
    height: 100,
    depth: 100,
    x: 0,
    y: 0,
    z: 0,
    showHelpers: false
  };

  const boxClipper = new reveal.utilities.BoundingBoxClipper(
    new THREE.Box3(
      new THREE.Vector3(
        slicingParams.x - slicingParams.width / 2,
        slicingParams.y - slicingParams.height / 2,
        slicingParams.z - slicingParams.depth / 2
      ),
      new THREE.Vector3(
        slicingParams.x + slicingParams.width / 2,
        slicingParams.y + slicingParams.height / 2,
        slicingParams.z + slicingParams.depth / 2
      )
    ),
    false
  );

  // Login
  const client = new CogniteClient({ appId: 'cognite.reveal.example' });
  client.loginWithOAuth({ project });
  await client.authenticate();

  // Prepare viewer
  const viewer = new reveal.migration.Cognite3DViewer({ sdk: client, domElement });
  (window as any).viewer = viewer;

  async function addModel(options: reveal.migration.AddModelOptions) {
    switch (await viewer.determineModelType(options.modelId, options.revisionId)) {
      case reveal.migration.SupportedModelTypes.CAD:
        const model = await viewer.addModel(options);
        viewer.fitCameraToModel(model);
        cadModels.push(model);
        break;

      case reveal.migration.SupportedModelTypes.PointCloud:
        const pointCloud = await viewer.addPointCloudModel(options);
        viewer.fitCameraToModel(pointCloud);
        break;

      default:
        alert(`Model ID is invalid or is not supported`);
    }
  }

  // Add GUI for loading models and such
  const cadModels: reveal.migration.Cognite3DModel[] = [];
  const guiState = { modelId: 0, revisionId: 0, showSectorBoundingBoxes: false };
  function applySettingsToModels() {
    cadModels.forEach(m => {
      m.renderHints = { ...m.renderHints, showSectorBoundingBoxes: guiState.showSectorBoundingBoxes };
    });
  }
  const guiActions = {
    addModel: () =>
      addModel({
        modelId: guiState.modelId,
        revisionId: guiState.revisionId
      })
  };
  const gui = new dat.GUI();
  const settingsGui = gui.addFolder('settings');
  settingsGui
    .add(guiState, 'showSectorBoundingBoxes')
    .name('Show bounding boxes')
    .onChange(applySettingsToModels);
  gui.add(guiState, 'modelId').name('Model ID');
  gui.add(guiState, 'revisionId').name('Revision ID');
  gui.add(guiActions, 'addModel').name('Load model');

  const slicing = gui.addFolder('Slicing');
  slicing
    .add(slicingParams, 'enabled')
    .name('enabled')
    .onChange(enabled => {
      viewer.setSlicingPlanes(enabled ? boxClipper.clippingPlanes : []);
    });

  slicing
    .add(slicingParams, 'x', -600, 600)
    .step(0.1)
    .name('x')
    .onChange(_ => {
      boxClipper.minX = slicingParams.x - slicingParams.width / 2;
      boxClipper.maxX = slicingParams.x + slicingParams.width / 2;
      viewer.setSlicingPlanes(slicingParams.enabled ? boxClipper.clippingPlanes : []);
    });

  slicing
    .add(slicingParams, 'y', -600, 600)
    .step(0.1)
    .name('y')
    .onChange(_ => {
      boxClipper.minY = slicingParams.y - slicingParams.height / 2;
      boxClipper.maxY = slicingParams.y + slicingParams.height / 2;
      viewer.setSlicingPlanes(slicingParams.enabled ? boxClipper.clippingPlanes : []);
    });

  slicing
    .add(slicingParams, 'z', -600, 600)
    .step(0.1)
    .name('z')
    .onChange(_ => {
      boxClipper.minZ = slicingParams.z - slicingParams.depth / 2;
      boxClipper.maxZ = slicingParams.z + slicingParams.depth / 2;
      viewer.setSlicingPlanes(slicingParams.enabled ? boxClipper.clippingPlanes : []);
    });

  slicing
    .add(slicingParams, 'width', 0, 100)
    .step(0.1)
    .name('width')
    .onChange(_ => {
      boxClipper.minX = slicingParams.x - slicingParams.width / 2;
      boxClipper.maxX = slicingParams.x + slicingParams.width / 2;
      viewer.setSlicingPlanes(slicingParams.enabled ? boxClipper.clippingPlanes : []);
    });

  slicing
    .add(slicingParams, 'height', 0, 100)
    .step(0.1)
    .name('height')
    .onChange(_ => {
      boxClipper.minY = slicingParams.y - slicingParams.height / 2;
      boxClipper.maxY = slicingParams.y + slicingParams.height / 2;
      viewer.setSlicingPlanes(slicingParams.enabled ? boxClipper.clippingPlanes : []);
    });

  slicing
    .add(slicingParams, 'depth', 0, 100)
    .step(0.1)
    .name('depth')
    .onChange(_ => {
      boxClipper.minZ = slicingParams.z - slicingParams.depth / 2;
      boxClipper.maxZ = slicingParams.z + slicingParams.depth / 2;
      viewer.setSlicingPlanes(slicingParams.enabled ? boxClipper.clippingPlanes : []);
    });

  // Load model if provided by URL
  const modelIdStr = urlParams.get('modelId');
  const revisionIdStr = urlParams.get('revisionId');
  if (modelIdStr && revisionIdStr) {
    const modelId = Number.parseInt(modelIdStr, 10);
    const revisionId = Number.parseInt(revisionIdStr, 10);
    addModel({ modelId, revisionId });
  }
  viewer.on('click', function(event) {
    const { offsetX, offsetY } = event;
    console.log('2D coordinates', event);
    const intersection = viewer.getIntersectionFromPixel(offsetX, offsetY);
    if (intersection !== null) {
      const { nodeId, point, model } = intersection;
      console.log(`Clicked node ${nodeId} at`, point);
      // highlight the object
      model.setNodeColor(nodeId, 0, 255, 0);
      // TODO make the camera zoom to the object
      // const boundingBox = model.getBoundingBox(nodeId);
      // viewer.fitCameraToBoundingBox(boundingBox, 2000); // 2 sec
    }
  });
}

main();
