/*!
 * Copyright 2021 Cognite AS
 */

import { PointCloudNode } from './PointCloudNode';
import { PointCloudMetadata } from './PointCloudMetadata';

import { Potree } from './potree-three-loader';
import { DEFAULT_POINT_CLOUD_METADATA_FILE } from './constants';
import { DMDataSourceType, DataSourceType, PointCloudStylableObjectProvider } from '@reveal/data-providers';
import { IPointClassificationsProvider } from './classificationsProviders/IPointClassificationsProvider';

import { PointCloudMaterialManager } from '@reveal/rendering';
import { createObjectIdMaps } from './potree-three-loader/utils/createObjectIdMaps';

export class PointCloudFactory {
  private readonly _potreeInstance: Potree;
  private readonly _pointCloudObjectProvider: PointCloudStylableObjectProvider;
  private readonly _pointCloudDMProvider: PointCloudStylableObjectProvider<DMDataSourceType>;
  private readonly _classificationsProvider: IPointClassificationsProvider;
  private readonly _pointCloudMaterialManager: PointCloudMaterialManager;

  constructor(
    potreeInstance: Potree,
    pointCloudObjectProvider: PointCloudStylableObjectProvider,
    pointCloudDMProvider: PointCloudStylableObjectProvider<DMDataSourceType>,
    classificationsProvider: IPointClassificationsProvider,
    pointCloudMaterialManager: PointCloudMaterialManager
  ) {
    this._potreeInstance = potreeInstance;
    this._pointCloudObjectProvider = pointCloudObjectProvider;
    this._pointCloudDMProvider = pointCloudDMProvider;
    this._classificationsProvider = classificationsProvider;
    this._pointCloudMaterialManager = pointCloudMaterialManager;
  }

  dispose(): void {
    this._pointCloudMaterialManager.dispose();
  }

  async createModel<T extends DataSourceType>(
    modelMetadata: PointCloudMetadata,
    revisionSpace?: string
  ): Promise<PointCloudNode<T>> {
    const { modelBaseUrl, modelIdentifier, modelMatrix, cameraConfiguration } = modelMetadata;

    const pointCloudProvider =
      revisionSpace !== undefined && revisionSpace !== '' ? this._pointCloudDMProvider : this._pointCloudObjectProvider;

    const annotationInfoPromise = pointCloudProvider.getPointCloudObjects(modelIdentifier, revisionSpace);
    const classSchemaPromise = this._classificationsProvider.getClassifications(modelMetadata);

    const [annotationInfo, classSchema] = await Promise.all([annotationInfoPromise, classSchemaPromise]);

    const stylableObject = annotationInfo.map(obj => obj.stylableObject);

    this._pointCloudMaterialManager.addModelMaterial(
      modelIdentifier.revealInternalId,
      createObjectIdMaps<DataSourceType>(annotationInfo)
    );

    const pointCloudOctree = await this._potreeInstance.loadPointCloud(
      modelBaseUrl,
      DEFAULT_POINT_CLOUD_METADATA_FILE,
      stylableObject,
      modelIdentifier.revealInternalId
    );

    pointCloudOctree.name = `PointCloudOctree: ${modelBaseUrl}`;
    return new PointCloudNode<T>(
      modelIdentifier.revealInternalId,
      modelMatrix,
      pointCloudOctree,
      annotationInfo,
      classSchema,
      cameraConfiguration
    );
  }
}
