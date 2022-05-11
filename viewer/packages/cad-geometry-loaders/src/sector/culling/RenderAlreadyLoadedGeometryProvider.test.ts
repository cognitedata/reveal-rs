/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { createGlContext } from '../../../../../test-utilities';
import { CadMaterialManager, CadGeometryCustomRenderModePipeline, RenderMode } from '@reveal/rendering';

import { RenderAlreadyLoadedGeometryProvider } from './RenderAlreadyLoadedGeometryProvider';

describe('RenderAlreadyLoadedGeometryProvider', () => {
  let depthRenderPipelineProvider: CadGeometryCustomRenderModePipeline;
  let materialManager: CadMaterialManager;
  let scene: THREE.Scene;
  const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
  const renderer = new THREE.WebGLRenderer({ context });
  let target: THREE.WebGLRenderTarget;

  beforeEach(() => {
    scene = new THREE.Scene();
    materialManager = new CadMaterialManager();
    depthRenderPipelineProvider = new CadGeometryCustomRenderModePipeline(
      RenderMode.DepthBufferOnly,
      materialManager,
      scene
    );

    const size = renderer.getSize(new THREE.Vector2());
    target = new THREE.WebGLRenderTarget(size.width, size.height);
  });

  test('renderOccludingGeometry() renders depth', () => {
    const renderDetailedToDepthOnlySpy = jest.spyOn(depthRenderPipelineProvider, 'pipeline');
    const provider = new RenderAlreadyLoadedGeometryProvider(renderer, depthRenderPipelineProvider);
    provider.renderOccludingGeometry(target, new THREE.PerspectiveCamera());

    expect(renderDetailedToDepthOnlySpy).toBeCalledTimes(1);
  });
});
