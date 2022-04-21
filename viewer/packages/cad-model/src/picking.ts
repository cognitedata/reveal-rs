/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadNode, RenderMode } from '@reveal/rendering';
import { IntersectInput } from '@reveal/model-base';
import { WebGLRendererStateHelper } from '@reveal/utilities';

export interface PickingInput {
  normalizedCoords: {
    x: number;
    y: number;
  };
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  domElement: HTMLElement;
}

export interface TreeIndexPickingInput extends PickingInput {
  cadNode: CadNode;
}

export interface IntersectCadNodesResult {
  distance: number;
  point: THREE.Vector3;
  treeIndex: number;
  cadNode: CadNode;
  object: THREE.Object3D; // always CadNode
}

const clearColor = new THREE.Color('black');
const clearAlpha = 0.0;

export function intersectCadNodes(cadNodes: CadNode[], input: IntersectInput): IntersectCadNodesResult[] {
  const results: IntersectCadNodesResult[] = [];
  for (const cadNode of cadNodes) {
    const result = intersectCadNode(cadNode, input);
    if (result) {
      results.push(result);
    }
  }
  return results.sort((l, r) => l.distance - r.distance);
}

export function intersectionCadNodesFromStoredPixel(cadNodes: CadNode[], input: IntersectInput): THREE.Vector3 {
  let result = new THREE.Vector3();
  for (const cadNode of cadNodes) {
    result = intersectCadNodeFromStoredPixel(cadNode, input);
  }
  return result;
}

export function intersectCadNode(cadNode: CadNode, input: IntersectInput): IntersectCadNodesResult | undefined {
  const { camera, normalizedCoords, renderer, domElement } = input;
  const pickingScene = new THREE.Scene();
  // TODO consider case where parent does not exist
  // TODO add warning if parent has transforms
  const oldParent = cadNode.parent;
  pickingScene.add(cadNode);
  try {
    const pickInput = {
      normalizedCoords,
      camera,
      renderer,
      domElement,
      scene: pickingScene,
      cadNode
    };
    const treeIndex = pickTreeIndex(pickInput);
    if (treeIndex === undefined) {
      return undefined;
    }
    const depth = pickDepth(pickInput);

    const viewZ = perspectiveDepthToViewZ(depth, camera.near, camera.far);
    const point = getPosition(pickInput, viewZ);
    const distance = new THREE.Vector3().subVectors(point, camera.position).length();
    isDepthFilled = false;
    return {
      distance,
      point,
      treeIndex,
      object: cadNode,
      cadNode
    };
  } finally {
    // Re-add cadNode to previous parent
    if (oldParent) {
      oldParent.add(cadNode);
    }
  }
}

let depthArray = new Uint8Array();
let isDepthFilled = false;

export function intersectCadNodeFromStoredPixel(cadNode: CadNode, input: IntersectInput): THREE.Vector3 | undefined {
  const { camera, normalizedCoords, renderer, domElement } = input;
  const pickingScene = new THREE.Scene();
  // TODO consider case where parent does not exist
  // TODO add warning if parent has transforms
  const oldParent = cadNode.parent;
  pickingScene.add(cadNode);
  try {
    const pickInput = {
      normalizedCoords,
      camera,
      renderer,
      domElement,
      scene: pickingScene,
      cadNode
    };

    if (!isDepthFilled) {
      const previousRenderMode = cadNode.renderMode;
      cadNode.renderMode = RenderMode.Depth;
      depthArray = pickPixelBufferColor(pickInput, clearColor, clearAlpha);
      cadNode.renderMode = previousRenderMode;
      isDepthFilled = true;
    }
    const absoluteCoords = {
      x: Math.round(((normalizedCoords.x + 1.0) / 2.0) * domElement.clientWidth),
      y: Math.round(((1.0 - normalizedCoords.y) / 2.0) * domElement.clientHeight)
    };
    const depthArrayLocation = Math.round(
      ((domElement.clientHeight - absoluteCoords.y) * domElement.clientWidth + absoluteCoords.x) * 4
    );
    const depthPixel = depthArray.subarray(depthArrayLocation, depthArrayLocation + 4);
    const depth = unpackRGBAToDepth(depthPixel);

    const viewZ = perspectiveDepthToViewZ(depth, camera.near, camera.far);
    const point = getPosition(pickInput, viewZ);

    return point;
  } finally {
    // Re-add cadNode to previous parent
    if (oldParent) {
      oldParent.add(cadNode);
    }
  }
}

function pickTreeIndex(input: TreeIndexPickingInput): number | undefined {
  const { cadNode } = input;
  const previousRenderMode = cadNode.renderMode;
  cadNode.renderMode = RenderMode.TreeIndex;
  let pixelBuffer: Uint8Array;
  try {
    pixelBuffer = pickPixelColor(input, clearColor, clearAlpha);
  } finally {
    cadNode.renderMode = previousRenderMode;
  }

  if (pixelBuffer[3] === 0) {
    return;
  }

  const treeIndex = pixelBuffer[0] * 255 * 255 + pixelBuffer[1] * 255 + pixelBuffer[2];
  return treeIndex;
}

const rgbaVector = new THREE.Vector4();
const unpackDownscale = 255 / 256;
const unpackFactors = new THREE.Vector4(
  unpackDownscale / (256 * 256 * 256),
  unpackDownscale / (256 * 256),
  unpackDownscale / 256,
  unpackDownscale
);

function unpackRGBAToDepth(rgbaBuffer: Uint8Array) {
  return rgbaVector
    .fromArray(rgbaBuffer)
    .multiplyScalar(1 / 255)
    .dot(unpackFactors);
}

function perspectiveDepthToViewZ(invClipZ: number, near: number, far: number) {
  return (near * far) / ((far - near) * invClipZ - far);
}

function pickDepth(input: TreeIndexPickingInput): number {
  const { cadNode } = input;
  const previousRenderMode = cadNode.renderMode;
  cadNode.renderMode = RenderMode.Depth;
  const pixelBuffer = pickPixelColor(input, clearColor, clearAlpha);
  cadNode.renderMode = previousRenderMode;

  const depth = unpackRGBAToDepth(pixelBuffer);
  return depth;
}

function getPosition(input: TreeIndexPickingInput, viewZ: number): THREE.Vector3 {
  const { camera, normalizedCoords } = input;
  const position = new THREE.Vector3();
  position.set(normalizedCoords.x, normalizedCoords.y, 0.5).applyMatrix4(camera.projectionMatrixInverse);

  position.multiplyScalar(viewZ / position.z);
  position.applyMatrix4(camera.matrixWorld);
  return position;
}

const pickPixelColorStorage = {
  renderTarget: new THREE.WebGLRenderTarget(1, 1),
  pixelBuffer: new Uint8Array(4)
};

function pickPixelColor(input: PickingInput, clearColor: THREE.Color, clearAlpha: number) {
  const { renderTarget, pixelBuffer } = pickPixelColorStorage;
  const { scene, camera, normalizedCoords, renderer, domElement } = input;

  // Prepare camera that only renders the single pixel we are interested in
  const pickCamera = camera.clone() as THREE.PerspectiveCamera;
  const absoluteCoords = {
    x: ((normalizedCoords.x + 1.0) / 2.0) * domElement.clientWidth,
    y: ((1.0 - normalizedCoords.y) / 2.0) * domElement.clientHeight
  };
  pickCamera.setViewOffset(domElement.clientWidth, domElement.clientHeight, absoluteCoords.x, absoluteCoords.y, 1, 1);

  const stateHelper = new WebGLRendererStateHelper(renderer);
  try {
    const { width, height } = renderer.getSize(new THREE.Vector2());
    renderTarget.setSize(width, height);
    stateHelper.setRenderTarget(renderTarget);
    stateHelper.setClearColor(clearColor, clearAlpha);

    renderer.clearColor();
    renderer.render(scene, pickCamera);
    renderer.readRenderTargetPixels(renderTarget, 0, 0, 1, 1, pixelBuffer);
  } finally {
    stateHelper.resetState();
  }
  return pixelBuffer;
}

function pickPixelBufferColor(input: PickingInput, clearColor: THREE.Color, clearAlpha: number) {
  const { scene, camera, renderer, domElement } = input;

  const renderTarget = new THREE.WebGLRenderTarget(domElement.clientWidth, domElement.clientHeight);
  const pixelBuffer = new Uint8Array(domElement.clientWidth * domElement.clientHeight * 4);

  const stateHelper = new WebGLRendererStateHelper(renderer);
  try {
    const { width, height } = renderer.getSize(new THREE.Vector2());
    renderTarget.setSize(width, height);
    stateHelper.setRenderTarget(renderTarget);
    stateHelper.setClearColor(clearColor, clearAlpha);

    renderer.clearColor();
    renderer.render(scene, camera);

    const gl = renderer.getContext();
    gl.readPixels(0, 0, domElement.clientWidth, domElement.clientHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixelBuffer);
  } finally {
    stateHelper.resetState();
  }
  return pixelBuffer;
}
