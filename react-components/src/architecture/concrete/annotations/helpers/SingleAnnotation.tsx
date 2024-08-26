/*!
 * Copyright 2024 Cognite AS
 */

import {
  type AnnotationsBoundingVolume,
  type AnnotationsBox,
  type AnnotationsCogniteAnnotationTypesPrimitivesGeometry3DGeometry as AnnotationGeometry
} from '@cognite/sdk';

import { type PointCloudAnnotation } from '../utils/types';
import { isAnnotationsBoundingVolume } from '../utils/annotationGeometryUtils';
import { remove } from '../../../base/utilities/extensions/arrayExtensions';
import { Quaternion, Vector3, type Matrix4 } from 'three';
import { getRandomInt } from '../../../base/utilities/extensions/mathExtensions';
import { getAnnotationMatrixByGeometry } from '../utils/getMatrixUtils';

export class SingleAnnotation {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public annotation: PointCloudAnnotation;
  public geometry: AnnotationGeometry;

  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  constructor(annotation: PointCloudAnnotation, geometry: AnnotationGeometry) {
    this.annotation = annotation;
    this.geometry = geometry;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public get isSingle(): boolean {
    const region = this.region;
    return region !== undefined && region.length === 1;
  }

  private get region(): AnnotationGeometry[] | undefined {
    const volume = this.annotation.geometry;
    if (!isAnnotationsBoundingVolume(volume)) {
      return undefined;
    }
    if (volume === undefined || volume.region.length === 0) {
      return undefined;
    }
    return volume.region;
  }

  public *getGeometries(): Generator<AnnotationGeometry> {
    const region = this.region;
    if (region === undefined) {
      return;
    }
    for (const geometry of region) {
      yield geometry;
    }
  }

  public equals(other: SingleAnnotation | undefined): boolean {
    if (other === undefined) {
      return false;
    }
    return this.annotation === other.annotation && this.geometry === other.geometry;
  }

  public removeGeometry(): boolean {
    const region = this.region;
    if (region === undefined) {
      return false;
    }
    return remove(region, this.geometry);
  }

  public updateFromMatrix(matrix: Matrix4): void {
    const { geometry } = this;
    if (geometry.box !== undefined) {
      geometry.box.matrix = matrix.clone().transpose().elements;
    }
    if (geometry.cylinder !== undefined) {
      const centerA = new Vector3(0, 1, 0).applyMatrix4(matrix);
      const centerB = new Vector3(0, -1, 0).applyMatrix4(matrix);
      const scale = new Vector3();
      matrix.decompose(new Vector3(), new Quaternion(), scale);

      geometry.cylinder.centerA = centerA.toArray();
      geometry.cylinder.centerB = centerB.toArray();
      geometry.cylinder.radius = scale.x;
    }
  }

  public getMatrix(): Matrix4 | undefined {
    const { geometry } = this;
    const matrix = getAnnotationMatrixByGeometry(geometry, 0);
    if (matrix === undefined) {
      return undefined;
    }
    return matrix;
  }

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static areEqual(
    a: SingleAnnotation | undefined,
    b: SingleAnnotation | undefined
  ): boolean {
    if (a === undefined && b === undefined) {
      return true;
    }
    if (a === undefined) {
      return false;
    }
    return a.equals(b);
  }

  public static createBoxFromMatrix(matrix: Matrix4): SingleAnnotation {
    const box = createBox(matrix);
    const geometry = { box };
    const volume: AnnotationsBoundingVolume = {
      confidence: 0.5,
      label: 'test',
      region: [geometry]
    };
    const annotation: PointCloudAnnotation = {
      source: 'asset-centric',
      id: getRandomInt(),
      status: 'approved',
      geometry: volume,
      assetRef: { source: 'asset-centric', id: 0 },
      creatingApp: '3d-management'
    };
    return new SingleAnnotation(annotation, geometry);

    function createBox(matrix: Matrix4): AnnotationsBox {
      const box: AnnotationsBox = {
        confidence: 1,
        label: '',
        matrix: matrix.clone().transpose().elements
      };
      return box;
    }
  }
}
