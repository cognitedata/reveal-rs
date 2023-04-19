/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { SceneHandler } from '@reveal/utilities';
import assert from 'assert';
import { Image360Face, Image360Texture } from '@reveal/data-providers';
import { Image360Visualization } from './Image360Visualization';
import { ImageAnnotationObject } from '../annotation/ImageAnnotationObject';

type VisualizationState = {
  opacity: number;
  visible: boolean;
  scale: THREE.Vector3;
  renderOrder: number;
};

export class Image360VisualizationBox implements Image360Visualization {
  private readonly _worldTransform: THREE.Matrix4;
  private _visualizationMesh: THREE.Mesh | undefined;
  private _faceMaterials: THREE.MeshBasicMaterial[] = [];
  private readonly _sceneHandler: SceneHandler;
  private readonly _visualizationState: VisualizationState;
  private readonly _textureLoader: THREE.TextureLoader;
  private readonly _faceMaterialOrder: Image360Face['face'][] = ['left', 'right', 'top', 'bottom', 'front', 'back'];
  private readonly _meshPromise: Promise<THREE.Object3D>;
  private readonly _annotationsPromise: Promise<ImageAnnotationObject[]>;

  private _meshResolve!: (o: THREE.Object3D) => void;
  private _annotationResolve!: (a: ImageAnnotationObject[]) => void;

  get opacity(): number {
    return this._visualizationState.opacity;
  }

  set opacity(alpha: number) {
    this._visualizationState.opacity = alpha;

    this._faceMaterials.forEach(material => {
      material.opacity = alpha;
    });
  }

  get visible(): boolean {
    return this._visualizationState.visible;
  }

  set visible(isVisible: boolean) {
    this._visualizationState.visible = isVisible;

    if (this._visualizationMesh === undefined) {
      return;
    }
    this._visualizationMesh.visible = isVisible;
  }

  set scale(newScale: THREE.Vector3) {
    this._visualizationState.scale = newScale;

    if (this._visualizationMesh === undefined) {
      return;
    }

    this._visualizationMesh.scale.copy(newScale);
  }

  set renderOrder(newRenderOrder: number) {
    this._visualizationState.renderOrder = newRenderOrder;

    if (this._visualizationMesh === undefined) {
      return;
    }

    this._visualizationMesh.renderOrder = newRenderOrder;
  }

  setAnnotations(annotations: ImageAnnotationObject[]): void {
    this._annotationResolve(annotations);
  }

  constructor(worldTransform: THREE.Matrix4, sceneHandler: SceneHandler) {
    this._worldTransform = worldTransform;
    this._sceneHandler = sceneHandler;
    this._textureLoader = new THREE.TextureLoader();
    this._visualizationState = {
      opacity: 1,
      renderOrder: 3,
      scale: new THREE.Vector3(1, 1, 1),
      visible: true
    };

    this._meshPromise = new Promise<THREE.Object3D>((res, _rej) => {
      this._meshResolve = res;
    });

    this._annotationsPromise = new Promise<ImageAnnotationObject[]>((res, _rej) => {
      this._annotationResolve = res;
    });

    Promise.all([this._meshPromise, this._annotationsPromise]).then(
      ([mesh, annotations]: [THREE.Object3D, ImageAnnotationObject[]]) =>
        annotations.forEach(a => mesh.add(a.getObject()))
    );
  }

  public loadImages(textures: Image360Texture[]): void {
    if (this._visualizationMesh) {
      this._faceMaterialOrder.forEach((face, index) => {
        this._faceMaterials[index].map = getFaceTexture(face);
      });
      return;
    }

    this._faceMaterials = this._faceMaterialOrder.map(
      face =>
        new THREE.MeshBasicMaterial({
          side: THREE.BackSide,
          map: getFaceTexture(face),
          depthTest: false,
          opacity: this._visualizationState.opacity,
          transparent: true
        })
    );

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const visualizationMesh = new THREE.Mesh(boxGeometry, this._faceMaterials);
    visualizationMesh.renderOrder = this._visualizationState.renderOrder;
    visualizationMesh.applyMatrix4(this._worldTransform);
    visualizationMesh.scale.copy(this._visualizationState.scale);
    visualizationMesh.visible = this._visualizationState.visible;
    this._visualizationMesh = visualizationMesh;

    this._sceneHandler.addCustomObject(this._visualizationMesh);

    this._meshResolve(this._visualizationMesh);

    function getFaceTexture(face: Image360Face['face']) {
      const texture = textures.find(p => p.face === face);
      assert(texture !== undefined);
      return texture.texture;
    }
  }

  public loadFaceTextures(faces: Image360Face[]): Promise<Image360Texture[]> {
    return Promise.all(
      faces.map(async image360Face => {
        const blob = new Blob([image360Face.data], { type: image360Face.mimeType });
        const url = window.URL.createObjectURL(blob);
        const faceTexture = await this._textureLoader.loadAsync(url);
        // Need to horizontally flip the texture since it is being rendered inside a cube
        faceTexture.center.set(0.5, 0.5);
        faceTexture.repeat.set(-1, 1);
        return { face: image360Face.face, texture: faceTexture };
      })
    );
  }

  public unloadImages(): void {
    if (this._visualizationMesh === undefined) {
      return;
    }
    this._sceneHandler.removeCustomObject(this._visualizationMesh);
    const imageContainerMaterial = this._visualizationMesh.material;
    const materials =
      imageContainerMaterial instanceof THREE.Material ? [imageContainerMaterial] : imageContainerMaterial;

    materials
      .map(material => material as THREE.MeshBasicMaterial)
      .forEach(material => {
        material.map?.dispose();
        material.dispose();
      });

    this._visualizationMesh.geometry.dispose();
    this._visualizationMesh = undefined;
    this._faceMaterials = [];
  }
}
