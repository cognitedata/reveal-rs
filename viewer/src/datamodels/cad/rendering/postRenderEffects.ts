/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { RenderMode } from './RenderMode';
import { MaterialManager } from '../MaterialManager';

export function addPostRenderEffects(
  materialManager: MaterialManager,
  renderer: THREE.WebGLRenderer,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene
) {
  const currentRenderMode = materialManager.getRenderMode();
  materialManager.setRenderMode(RenderMode.Effects);
  renderer.clearDepth();
  renderer.autoClearColor = false;
  renderer.render(scene, camera);
  renderer.autoClearColor = true;
  materialManager.setRenderMode(currentRenderMode);
}
