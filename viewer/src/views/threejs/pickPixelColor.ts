/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

export interface PickingInput {
  event: MouseEvent;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
}

const storage = {
  renderTarget: new THREE.WebGLRenderTarget(1, 1),
  pixelBuffer: new Uint8Array(4)
};

export function pickPixelColor(input: PickingInput, clearColor: THREE.Color, clearAlpha: number) {
  const { renderTarget, pixelBuffer } = storage;
  const { scene, camera, event, renderer } = input;

  const pickCamera = camera.clone();

  const canvasRect = renderer.domElement.getBoundingClientRect();
  pickCamera.setViewOffset(
    renderer.domElement.clientWidth,
    renderer.domElement.clientHeight,
    renderer.getPixelRatio() * (event.clientX - canvasRect.left),
    renderer.getPixelRatio() * (event.clientY - canvasRect.top),
    1,
    1
  );

  const currentClearColor = renderer.getClearColor();
  const currentClearAlpha = renderer.getClearAlpha();

  renderer.setRenderTarget(renderTarget);
  renderer.setClearColor(clearColor, clearAlpha);
  renderer.clearColor();
  renderer.render(scene, pickCamera);
  renderer.setRenderTarget(null);

  renderer.setClearColor(currentClearColor, currentClearAlpha);

  renderer.readRenderTargetPixels(renderTarget, 0, 0, 1, 1, pixelBuffer);
  return pixelBuffer;
}
