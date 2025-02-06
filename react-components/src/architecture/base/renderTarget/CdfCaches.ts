/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk/dist/src';
import { AssetMappingAndNode3DCache } from '../../../components/CacheProvider/AssetMappingAndNode3DCache';
import { FdmNodeCache } from '../../../components/CacheProvider/FdmNodeCache';
import { FdmSDK } from '../../../data-providers/FdmSDK';
import { PointCloudAnnotationCache } from '../../../components/CacheProvider/PointCloudAnnotationCache';
import { Image360AnnotationCache } from '../../../components/CacheProvider/Image360AnnotationCache';
import { type Cognite3DViewer, type DataSourceType } from '@cognite/reveal';
import { CoreDm3dFdm3dDataProvider } from '../../../data-providers/core-dm-provider/CoreDm3dDataProvider';
import { LegacyFdm3dDataProvider } from '../../../data-providers/legacy-fdm-provider/LegacyFdm3dDataProvider';
import { type Fdm3dDataProvider } from '../../../data-providers/Fdm3dDataProvider';

export type CdfCachesOptions = {
  coreDmOnly: boolean;
};

export class CdfCaches {
  private readonly _assetMappingAndNode3dCache: AssetMappingAndNode3DCache;
  private readonly _fdmNodeCache: FdmNodeCache;
  private readonly _pointCloudAnnotationCache: PointCloudAnnotationCache;
  private readonly _image360AnnotationCache: Image360AnnotationCache;

  private readonly _coreDmOnly: boolean;

  private readonly _cogniteClient: CogniteClient;
  private readonly _fdm3dDataProvider: Fdm3dDataProvider;

  constructor(
    cdfClient: CogniteClient,
    viewer: Cognite3DViewer<DataSourceType>,
    { coreDmOnly }: CdfCachesOptions
  ) {
    const fdmClient = new FdmSDK(cdfClient);

    const fdm3dDataProvider = coreDmOnly
      ? new CoreDm3dFdm3dDataProvider([], fdmClient)
      : new LegacyFdm3dDataProvider(fdmClient, cdfClient);

    this._assetMappingAndNode3dCache = new AssetMappingAndNode3DCache(cdfClient, coreDmOnly);
    this._fdmNodeCache = new FdmNodeCache(cdfClient, fdmClient, fdm3dDataProvider);
    this._pointCloudAnnotationCache = new PointCloudAnnotationCache(cdfClient);
    this._image360AnnotationCache = new Image360AnnotationCache(cdfClient, viewer);

    this._cogniteClient = cdfClient;
    this._fdm3dDataProvider = fdm3dDataProvider;
    this._coreDmOnly = coreDmOnly;
  }

  public get assetMappingAndNode3dCache(): AssetMappingAndNode3DCache {
    return this._assetMappingAndNode3dCache;
  }

  public get fdmNodeCache(): FdmNodeCache {
    return this._fdmNodeCache;
  }

  public get pointCloudAnnotationCache(): PointCloudAnnotationCache {
    return this._pointCloudAnnotationCache;
  }

  public get image360Cache(): Image360AnnotationCache {
    return this._image360AnnotationCache;
  }

  public get cogniteClient(): CogniteClient {
    return this._cogniteClient;
  }

  public get fdm3dDataProvider(): Fdm3dDataProvider {
    return this._fdm3dDataProvider;
  }

  public get coreDmOnly(): boolean {
    return this._coreDmOnly;
  }
}
