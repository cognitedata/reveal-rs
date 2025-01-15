/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient, type Asset, type IdEither } from '@cognite/sdk';
import { uniqBy, chunk, partition } from 'lodash';
import { isDefined } from '../../utilities/isDefined';
import { type AnnotationId, type PointCloudAnnotationModel } from './types';
import { getInstanceReferenceFromPointCloudAnnotation } from './utils';
import { type AssetProperties } from '../../data-providers/core-dm-provider/utils/filters';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { type FdmNode, FdmSDK } from '../../data-providers/FdmSDK';
import {
  COGNITE_ASSET_VIEW_VERSION_KEY,
  CORE_DM_SPACE
} from '../../data-providers/core-dm-provider/dataModels';
import { type InstanceReference, isIdEither } from '../../utilities/instanceIds';
import { isSameIdEither } from '../../utilities/instanceIds/equality';

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
): Promise<Array<Asset | FdmNode<AssetProperties>>> {
  const [classicIds, dmIds] = partition(assetIds, isIdEither);

  return ([] as Array<Asset | FdmNode<AssetProperties>>)
    .concat(await fetchAssetsForAssetIds(classicIds, sdk))
    .concat(await fetchAssetsForDmsIds(dmIds, sdk));
}

async function fetchAssetsForDmsIds(
  dmsIds: DmsUniqueIdentifier[],
  sdk: CogniteClient
): Promise<Array<FdmNode<AssetProperties>>> {
  const fdmSdk = new FdmSDK(sdk);

  const response = await fdmSdk.getByExternalIds<AssetProperties>(
    dmsIds.map((id) => ({ ...id, instanceType: 'node' as const }))
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
