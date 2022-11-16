/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';
import { CameraConfiguration } from '@reveal/utilities';

import { PotreeNodeWrapper } from './PotreeNodeWrapper';
import { WellKnownAsprsPointClassCodes } from './types';

import { PickPoint } from './potree-three-loader';
import { PointColorType, PointShape, PointSizeType } from '@reveal/rendering';

import { CompletePointCloudAppearance, StyledPointCloudObjectCollection } from '@reveal/pointcloud-styling';

export class PointCloudNode extends THREE.Group {
  private readonly _potreeNode: PotreeNodeWrapper;
  private readonly _cameraConfiguration?: CameraConfiguration;

  constructor(
    potreeNode: PotreeNodeWrapper,
    cameraConfiguration?: CameraConfiguration
  ) {
    super();
    this.name = 'PointCloudNode';
    this._potreeNode = potreeNode;
    this._cameraConfiguration = cameraConfiguration;
    this.add(this._potreeNode.octree);

    this.matrixAutoUpdate = false;
  }

  get potreeNode(): PotreeNodeWrapper {
    return this._potreeNode;
  }

  get hasCameraConfiguration(): boolean {
    return this._cameraConfiguration !== undefined;
  }

  get cameraConfiguration(): CameraConfiguration | undefined {
    return this._cameraConfiguration;
  }

  get pointSize(): number {
    return this._potreeNode.pointSize;
  }

  set pointSize(size: number) {
    this._potreeNode.pointSize = size;
  }

  get pointSizeType(): PointSizeType {
    return this._potreeNode.octree.pointSizeType;
  }

  set pointSizeType(pointSizeType: PointSizeType) {
    this._potreeNode.octree.pointSizeType = pointSizeType;
  }

  get visiblePointCount(): number {
    return this._potreeNode.visiblePointCount;
  }

  get pointColorType(): PointColorType {
    return this._potreeNode.pointColorType;
  }

  set pointColorType(type: PointColorType) {
    this._potreeNode.pointColorType = type;
  }

  get pointShape(): PointShape {
    return this._potreeNode.pointShape;
  }

  set pointShape(value: PointShape) {
    this._potreeNode.pointShape = value;
  }

  /**
   * GPU-based picking allowing to get point data based on ray directing from the camera.
   * @param renderer Renderer object used for Reveal rendereing.
   * @param camera Camera object used for Reveal rendering.
   * @param ray Ray representing the direction for picking.
   * @returns Picked point data.
   */
  pick(renderer: THREE.WebGLRenderer, camera: THREE.Camera, ray: THREE.Ray): PickPoint | null {
    return this._potreeNode.pick(renderer, camera, ray);
  }
  /**
   * Sets a visible filter on points of a given class.
   * @param pointClass ASPRS classification class code. Either one of the well known
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @param visible Boolean flag that determines if the point class type should be visible or not.
   * @throws Error if the model doesn't have the class given.
   */
  setClassVisible(pointClass: number | WellKnownAsprsPointClassCodes, visible: boolean): void {
    this._potreeNode.setClassificationAndRecompute(pointClass, visible);
  }

  /**
   * Determines if points from a given class are visible.
   * @param pointClass ASPRS classification class code. Either one of the well known
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @returns true if points from the given class will be visible.
   * @throws Error if the model doesn't have the class given.
   */
  isClassVisible(pointClass: number | WellKnownAsprsPointClassCodes): boolean {
    if (!this.hasClass(pointClass)) {
      throw new Error(`Point cloud model doesn't have class ${pointClass}`);
    }
    const key = this._potreeNode.createPointClassKey(pointClass);
    return this._potreeNode.classification[key].w !== 0.0;
  }

  /**
   * Returns true if the model has values with the given classification class.
   * @param pointClass ASPRS classification class code. Either one of the well known
   * classes from {@link WellKnownAsprsPointClassCodes} or a number for user defined classes.
   * @returns true if model has values in the class given.
   */
  hasClass(pointClass: number | WellKnownAsprsPointClassCodes): boolean {
    const key = this._potreeNode.createPointClassKey(pointClass);
    return this._potreeNode.classification[key] !== undefined;
  }

  /**
   * Returns a list of sorted classification codes present in the model.
   * @returns A sorted list of classification codes from the model.
   */
  getClasses(): Array<{ name: string; code: number | WellKnownAsprsPointClassCodes }> {
    return this._potreeNode.classes;
  }

  getBoundingBox(outBbox: THREE.Box3 = new THREE.Box3()): THREE.Box3 {
    outBbox.copy(this._potreeNode.boundingBox);
    return outBbox;
  }

  setModelTransformation(matrix: THREE.Matrix4): void {
    this.matrix.copy(matrix);
    this.updateMatrixWorld(true);
  }

  getModelTransformation(out = new THREE.Matrix4()): THREE.Matrix4 {
    return out.copy(this.matrix);
  }

  get defaultAppearance(): CompletePointCloudAppearance {
    return this._potreeNode.defaultAppearance;
  }

  set defaultAppearance(appearance: CompletePointCloudAppearance) {
    this._potreeNode.defaultAppearance = appearance;
  }

  assignStyledPointCloudObjectCollection(styledCollection: StyledPointCloudObjectCollection): void {
    this._potreeNode.assignObjectStyle(styledCollection);
  }

  removeAllStyledPointCloudObjects(): void {
    this._potreeNode.octree.material.objectAppearanceTexture.removeAllStyledObjectSets();
  }
}
