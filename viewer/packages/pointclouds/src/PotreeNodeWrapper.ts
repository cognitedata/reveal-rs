/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

export type PotreeClassification = { [pointClass: number]: { x: number; y: number; z: number; w: number } };

import { PointCloudOctree, PotreePointColorType, PotreePointShape, IClassification } from './potree-three-loader';
import { WellKnownAsprsPointClassCodes } from './types';

import { createPointClassKey } from './createPointClassKey';
import { StyledPointCloudObjectCollection } from './styling/StyledPointCloudObjectCollection';
import { PointCloudObjectAnnotation, PointCloudObjectAnnotationsWithIndexMap } from './annotationTypes';

/**
 * Wrapper around `Potree.PointCloudOctree` with some convenience functions.
 */
export class PotreeNodeWrapper {
  readonly octree: PointCloudOctree;
  private _needsRedraw = false;
  private readonly _classification: IClassification = {} as IClassification;

  private readonly _annotations: PointCloudObjectAnnotation[];
  private readonly _annotationIdToIndexMap: Map<number, number>;

  get needsRedraw(): boolean {
    return this._needsRedraw;
  }

  constructor(octree: PointCloudOctree, annotationsInfo?: PointCloudObjectAnnotationsWithIndexMap | undefined) {
    this.octree = octree;
    this.pointSize = 2;
    this.pointColorType = PotreePointColorType.Rgb;
    this.pointShape = PotreePointShape.Circle;
    this._classification = octree.material.classification;
    this._annotations = annotationsInfo?.annotations ?? [];
    this._annotationIdToIndexMap = annotationsInfo?.annotationIdToIndexMap ?? new Map();
  }

  get pointSize(): number {
    return this.octree.material.size;
  }
  set pointSize(size: number) {
    this.octree.material.size = size;
    this._needsRedraw = true;
  }

  get visiblePointCount(): number {
    return this.octree.numVisiblePoints || 0;
  }

  get boundingBox(): THREE.Box3 {
    const box: THREE.Box3 =
      this.octree.pcoGeometry.tightBoundingBox || this.octree.pcoGeometry.boundingBox || this.octree.boundingBox;
    // Apply transformation to switch axes
    const min = new THREE.Vector3(box.min.x, box.min.z, -box.min.y);
    const max = new THREE.Vector3(box.max.x, box.max.z, -box.max.y);
    return new THREE.Box3().setFromPoints([min, max]);
  }

  get pointColorType(): PotreePointColorType {
    return this.octree.material.pointColorType;
  }
  set pointColorType(type: PotreePointColorType) {
    this.octree.material.pointColorType = type;
    this._needsRedraw = true;
  }

  get pointShape(): PotreePointShape {
    return this.octree.material.shape;
  }
  set pointShape(shape: PotreePointShape) {
    this.octree.material.shape = shape;
    this._needsRedraw = true;
  }

  get classification(): PotreeClassification {
    return this._classification;
  }

  get stylableObjectAnnotationIds(): Iterable<number> {
    return this._annotationIdToIndexMap.keys();
  }

  get stylableObjects(): PointCloudObjectAnnotation[] {
    return this._annotations;
  }

  setObjectStyle(styledCollection: StyledPointCloudObjectCollection): void {
    this.octree.material.objectAppearanceTexture.assignStyledObjectSet(styledCollection);
    this._needsRedraw = true;
  }

  setClassificationAndRecompute(pointClass: number | WellKnownAsprsPointClassCodes, visible: boolean): void {
    const key = createPointClassKey(pointClass);

    this._classification[key].w = visible ? 1.0 : 0.0;
    this.octree.material.classification = this._classification;
  }

  resetRedraw(): void {
    this._needsRedraw = false;
  }
}
