/*!
 * Copyright 2024 Cognite AS
 */

import { type Asset, type CogniteClient } from '@cognite/sdk';
import { type Image360AnnotationAssetInfo } from './types';
import {
  getAssetIdKeyForImage360Annotation,
  getInstanceReferenceFromImage360Annotation,
  getIdKeyForImage360Annotation
} from './utils';
import {
  type DataSourceType,
  type AssetAnnotationImage360Info,
  type Cognite3DViewer,
  type Image360Collection
} from '@cognite/reveal';
import { fetchAssetsForAssetReferences } from './AnnotationModelUtils';
import { isDefined } from '../../utilities/isDefined';
import { assetInstanceToKey } from '../../utilities/assetInstancetoKey';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import { type InstanceReference } from '../../utilities/instanceIds';
import { createInstanceReferenceKey } from '../../utilities/instanceIds/toKey';
import { uniqBy } from 'lodash';
import { type FdmNode } from '../../data-providers/FdmSDK';

export class Image360AnnotationCache {
  private readonly _sdk: CogniteClient;
  private readonly _viewer: Cognite3DViewer<DataSourceType> | undefined;
  private readonly _annotationToAssetMappings = new Map<string, Image360AnnotationAssetInfo[]>();

  constructor(sdk: CogniteClient, viewer: Cognite3DViewer<DataSourceType> | undefined) {
    this._sdk = sdk;
    this._viewer = viewer;
  }

  public async getReveal360Annotations(siteIds: string[]): Promise<Image360AnnotationAssetInfo[]> {
    const key = siteIds.sort().join();
    const cachedResult = this._annotationToAssetMappings.get(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const annotationAssets = await this.getReveal360AnnotationInfo();
    if (annotationAssets.length === 0) {
      return [];
    }
    this._annotationToAssetMappings.set(key, annotationAssets);

    return annotationAssets;
  }

  private async getReveal360AnnotationInfo(): Promise<Image360AnnotationAssetInfo[]> {
    if (this._viewer === undefined) {
      return [];
    }
    const image360Collections = this._viewer.get360ImageCollections();

    const annotationsInfoPromise = await Promise.all(
      image360Collections.map(async (image360Collection: Image360Collection<DataSourceType>) => {
        const annotations = await image360Collection.getAnnotationsInfo('assets');
        return annotations;
      })
    );

    const annotationsInfo = annotationsInfoPromise.flat();

    const assetIds = new Array<InstanceReference>();
    annotationsInfo.forEach((annotation) => {
      const assetRef = getInstanceReferenceFromImage360Annotation(annotation.annotationInfo);
      if (assetRef !== undefined) {
        assetIds.push(assetRef);
      }
    });

    const uniqueAssetIds = uniqBy(assetIds, createInstanceReferenceKey);

    const assetsArray = await fetchAssetsForAssetReferences(uniqueAssetIds, this._sdk);
    const assets = new Map(assetsArray.map((asset) => [assetInstanceToKey(asset), asset]));
    const assetsWithAnnotations = await this.getAssetWithAnnotationsMapped(annotationsInfo, assets);

    return assetsWithAnnotations;
  }

  private async getAssetWithAnnotationsMapped(
    assetAnnotationImage360Infos: Array<AssetAnnotationImage360Info<DataSourceType>>,
    assets: Map<string, Asset | FdmNode<AssetProperties>>
  ): Promise<Image360AnnotationAssetInfo[]> {
    const assetsWithAnnotationsPromises = assetAnnotationImage360Infos
      .filter((assetAnnotationImageInfo) => {
        const idRef = getAssetIdKeyForImage360Annotation(assetAnnotationImageInfo.annotationInfo);
        return idRef !== undefined && assets.has(idRef);
      })
      .map(async (assetAnnotationImageInfo) => {
        const idRef = getAssetIdKeyForImage360Annotation(assetAnnotationImageInfo.annotationInfo);
        if (idRef === undefined) {
          return undefined;
        }
        const asset = assets.get(idRef);
        if (asset === undefined) {
          return undefined;
        }
        const transform = assetAnnotationImageInfo.imageEntity.transform;
        const revisionAnnotations = await assetAnnotationImageInfo.imageRevision.getAnnotations();

        const annotationIdKey = getIdKeyForImage360Annotation(
          assetAnnotationImageInfo.annotationInfo
        );
        const correspondingRevisionAnnotation = revisionAnnotations.find((revisionAnnotation) => {
          return getIdKeyForImage360Annotation(revisionAnnotation.annotation) === annotationIdKey;
        });

        if (correspondingRevisionAnnotation === undefined) {
          return undefined;
        }

        const centerPosition = correspondingRevisionAnnotation.getCenter().applyMatrix4(transform);

        return {
          asset,
          assetAnnotationImage360Info: assetAnnotationImageInfo,
          position: centerPosition
        };
      });

    const assetsWithAnnotations = (await Promise.all(assetsWithAnnotationsPromises)).filter(
      isDefined
    );

    return assetsWithAnnotations;
  }
}
