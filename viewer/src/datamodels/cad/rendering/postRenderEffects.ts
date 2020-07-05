/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { RenderMode } from './RenderMode';
import { RevealManagerBase } from '@/public/RevealManagerBase';

export function addPostRenderEffects(
  materialManager: RevealManagerBase<unknown>,
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene
) {
  const { preserveDrawingBuffer } = renderer.getContextAttributes();

  if (!preserveDrawingBuffer) {
    throw new Error('The renderer must have the parameter: preserveDrawingBuffer set to true');
  }

  const currentRenderMode = materialManager.renderMode;
  materialManager.renderMode = RenderMode.Effects;
  renderer.clearDepth();
  renderer.autoClearColor = false;
  renderer.render(scene, camera);
  renderer.autoClearColor = true;
  materialManager.renderMode = currentRenderMode;
}
