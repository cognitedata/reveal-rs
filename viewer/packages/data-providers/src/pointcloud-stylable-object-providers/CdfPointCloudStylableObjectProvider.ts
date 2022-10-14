/*!
 * Copyright 2022 Cognite AS
 */

import { CogniteClient } from '@cognite/sdk';
import { ModelIdentifier } from '../ModelIdentifier';
import { CdfModelIdentifier } from '../model-identifiers/CdfModelIdentifier';
import { IShape, Box, Cylinder } from '@reveal/utilities';
import assert from 'assert';
import { CdfPointCloudObjectAnnotation, PointCloudObject } from './types';
import { PointCloudStylableObjectProvider } from '../PointCloudStylableObjectProvider';

import * as THREE from 'three';
import { cdfAnnotationsToObjectInfo } from './cdfAnnotationsToObjects';

export class CdfPointCloudStylableObjectProvider implements PointCloudStylableObjectProvider {
  private readonly _sdk: CogniteClient;

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  private annotationGeometryToRevealShapes(geometry: any): IShape {
    if (geometry.box) {
      return new Box(new THREE.Matrix4().fromArray(geometry.box.matrix).transpose());
    }

    if (geometry.cylinder) {
      return new Cylinder(
        new THREE.Vector3().fromArray(geometry.cylinder.centerA),
        new THREE.Vector3().fromArray(geometry.cylinder.centerB),
        geometry.cylinder.radius
      );
    }

    throw Error('Annotation geometry type not recognized');
  }

  private async fetchAnnotations(modelIdentifier: CdfModelIdentifier): Promise<CdfPointCloudObjectAnnotation[]> {
    const modelAnnotations = await this._sdk.annotations
      .list({
        filter: {
          // @ts-ignore
          annotatedResourceType: 'threedmodel',
          annotatedResourceIds: [{ id: modelIdentifier.modelId }]
        },
        limit: 1000
      })
      .autoPagingToArray({ limit: Infinity });

    const annotations = modelAnnotations.map(annotation => {
      const region = (annotation.data as any).region.map((geometry: any) => {
        return this.annotationGeometryToRevealShapes(geometry);
      });

      return {
        annotationId: annotation.id,
        assetId: annotation.annotatedResourceId,
        region
      };
    });

    return annotations;
  }

  async getPointCloudObjects(modelIdentifier: CdfModelIdentifier): Promise<PointCloudObject[]> {
    const annotations = await this.fetchAnnotations(modelIdentifier);

    return cdfAnnotationsToObjectInfo(annotations);
  }
}
