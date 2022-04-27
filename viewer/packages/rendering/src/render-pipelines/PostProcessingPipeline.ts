/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { transparentBlendOptions } from '../render-passes/types';
import { RenderPass } from '../RenderPass';
import { createFullScreenTriangleMesh, getBlitMaterial } from '../utilities/renderUtilities';
import { PostProcessingPipelineOptions } from './types';

export class PostProcessingPipeline implements RenderPass {
  private readonly _postProcessingScene: THREE.Scene;
  private readonly _customObjects: THREE.Object3D[];
  private _takenCustomObjects: { object: THREE.Object3D; parent: THREE.Object3D }[];

  constructor(postProcessingPipelineOptions: PostProcessingPipelineOptions, customObjects: THREE.Object3D[]) {
    this._postProcessingScene = new THREE.Scene();
    this._customObjects = customObjects;
    this._takenCustomObjects = [];

    const inFrontEarlyZBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.inFront.texture,
      depthTexture: postProcessingPipelineOptions.inFront.depthTexture,
      overrideAlpha: 1.0,
      writeColor: false
    });

    const inFrontEarlyZBlitObject = createFullScreenTriangleMesh(inFrontEarlyZBlitMaterial);
    inFrontEarlyZBlitObject.renderOrder = 0;
    inFrontEarlyZBlitObject.frustumCulled = false;

    const backBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.back.texture,
      depthTexture: postProcessingPipelineOptions.back.depthTexture,
      ssaoTexture: postProcessingPipelineOptions.ssaoTexture,
      overrideAlpha: 1.0,
      edges: postProcessingPipelineOptions.edges,
      outline: true
    });
    const backBlitObject = createFullScreenTriangleMesh(backBlitMaterial);
    backBlitObject.renderOrder = 2;
    backBlitObject.frustumCulled = false;

    const ghostBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.ghost.texture,
      depthTexture: postProcessingPipelineOptions.ghost.depthTexture,
      blendOptions: transparentBlendOptions
    });

    const ghostBlitObject = createFullScreenTriangleMesh(ghostBlitMaterial);
    ghostBlitObject.renderOrder = 3;
    ghostBlitObject.frustumCulled = false;

    const inFrontBlitMaterial = getBlitMaterial({
      texture: postProcessingPipelineOptions.inFront.texture,
      blendOptions: transparentBlendOptions,
      overrideAlpha: 0.5,
      outline: true
    });
    const inFrontBlitObject = createFullScreenTriangleMesh(inFrontBlitMaterial);
    inFrontBlitObject.renderOrder = 4;
    inFrontBlitObject.frustumCulled = false;

    this._postProcessingScene.add(inFrontEarlyZBlitObject);
    this._postProcessingScene.add(backBlitObject);
    this._postProcessingScene.add(ghostBlitObject);
    this._postProcessingScene.add(inFrontBlitObject);
  }

  public render(renderer: THREE.WebGLRenderer, camera: THREE.Camera): void {
    this.takeCustomObjects();
    renderer.sortObjects = true;
    renderer.render(this._postProcessingScene, camera);
    this.releaseCustomObjects();
  }

  private takeCustomObjects(): void {
    this._customObjects.forEach(customObject => {
      this._takenCustomObjects.push({ object: customObject, parent: customObject.parent });
      this._postProcessingScene.add(customObject);
      customObject.updateMatrixWorld(true);
      customObject.renderOrder = customObject.renderOrder > 0 ? customObject.renderOrder + 4 : 1;
    });
  }

  private releaseCustomObjects(): void {
    this._takenCustomObjects.forEach(takenCustomObject => {
      const { object, parent } = takenCustomObject;
      parent.add(object);
      object.renderOrder = object.renderOrder > 1 ? object.renderOrder - 4 : 0;
    });
    this._takenCustomObjects = [];
  }
}
