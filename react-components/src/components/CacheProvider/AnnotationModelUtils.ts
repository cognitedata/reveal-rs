/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient, type Asset, type IdEither } from '@cognite/sdk';
import { uniqBy, chunk } from 'lodash';
import { isDefined } from '../../utilities/isDefined';
import { type AnnotationId, type PointCloudAnnotationModel } from './types';
import { getInstanceReferenceFromPointCloudAnnotation } from './utils';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { type FdmNode, FdmSDK } from '../../data-providers/FdmSDK';
import {
  COGNITE_ASSET_SOURCE,
  COGNITE_ASSET_VIEW_VERSION_KEY,
  CORE_DM_SPACE
} from '../../data-providers/core-dm-provider/dataModels';
import {
  type InstanceReference,
  isAssetInstanceReference,
  isDmsInstance,
  isHybridAssetCoreDmsInstance,
  isIdEither
} from '../../utilities/instanceIds';
import { isSameIdEither } from '../../utilities/instanceIds/equality';
import { type AssetInstance } from '../../utilities/instances';

export async function fetchPointCloudAnnotationAssets(
  annotations: PointCloudAnnotationModel[],
  sdk: CogniteClient
): Promise<Map<AnnotationId, Asset>> {
  const annotationMapping = annotations.map((annotation) => {
    const assetId = getInstanceReferenceFromPointCloudAnnotation(annotation);
    if (assetId === undefined) {
      return undefined;
    }
    return {
      annotationId: annotation.id,
      assetId
    };
  });
  const filteredAnnotationMapping = annotationMapping.filter(isDefined);

  const uniqueAnnotationMapping = uniqBy(
    filteredAnnotationMapping,
    (annotationMapping) => annotationMapping.assetId
  );
  const assetIds = uniqueAnnotationMapping.map((mapping) => mapping.assetId);
  const assets = await fetchAssetsForAssetIds(assetIds, sdk);

  const annotationIdToAssetMap = new Map<number, Asset>();
  assets.forEach((asset) => {
    filteredAnnotationMapping.forEach((mapping) => {
      if (isSameIdEither(mapping.assetId, asset)) {
        annotationIdToAssetMap.set(mapping.annotationId, asset);
      }
    });
  });
  return annotationIdToAssetMap;
}

export async function fetchAssetsForAssetReferences(
  assetIds: InstanceReference[],
  sdk: CogniteClient
): Promise<AssetInstance[]> {
  const classicAssetIds = assetIds.filter(isIdEither);
  const assetIdReference = assetIds.filter(isAssetInstanceReference);

  const dmIds = assetIds.filter(isDmsInstance);
  const hybridAssetIdReference = assetIds.filter(isHybridAssetCoreDmsInstance);

  const combinedDMSAssets = dmIds.concat(
    hybridAssetIdReference.map((hybrid) => hybrid.assetInstanceId)
  );

  const combinedClassicAssets = classicAssetIds.concat(
    assetIdReference.map((assetId) => ({ id: assetId.assetId }))
  );

  return ([] as AssetInstance[])
    .concat(await fetchAssetsForAssetIds(combinedClassicAssets, sdk))
    .concat(await fetchAssetsForDmsIds(combinedDMSAssets, sdk));
}

async function fetchAssetsForDmsIds(
  dmsIds: DmsUniqueIdentifier[],
  sdk: CogniteClient
): Promise<Array<FdmNode<AssetProperties>>> {
  if (dmsIds.length === 0) {
    return [];
  }

  const fdmSdk = new FdmSDK(sdk);

  const response = await fdmSdk.getByExternalIds<AssetProperties>(
    dmsIds.map((id) => ({ ...id, instanceType: 'node' as const })),
    [COGNITE_ASSET_SOURCE]
  );

  return response.items.map((item) => ({
    ...item,
    properties: item.properties[CORE_DM_SPACE][COGNITE_ASSET_VIEW_VERSION_KEY]
  }));
}

export async function fetchAssetsForAssetIds(
  assetIds: IdEither[],
  sdk: CogniteClient
): Promise<Asset[]> {
  const assetsResult = await Promise.all(
    chunk(assetIds, 1000).map(async (assetIdsChunck) => {
      const retrievedAssets = await sdk.assets.retrieve(assetIdsChunck, { ignoreUnknownIds: true });
      return retrievedAssets;
    })
  );

  return assetsResult.flat();
}
