/*!
 * Copyright 2024 Cognite AS
 */

import {
  CadIntersection,
  ClassicDataSourceType,
  Cognite3DViewer,
  DataSourceType,
  DMDataSourceType,
  PointCloudIntersection
} from '@cognite/reveal';
import { InstanceReference } from '../data-providers';
import { CdfCaches } from '../architecture/base/renderTarget/CdfCaches';
import { fetchAncestorNodesForTreeIndex } from '../components/CacheProvider/requests';
import { EMPTY_ARRAY } from './constants';
import { fetchAnnotationsForModel } from '../hooks/pointClouds/fetchAnnotationsForModel';
import { isDMIdentifier } from '../components';
import { is360ImageAnnotation } from './is360ImageAnnotation';
import { assertNever } from './assertNever';
import { RevealRenderTarget } from '../architecture';

export async function getInstancesFromClick(
  renderTarget: RevealRenderTarget,
  event: PointerEvent
): Promise<InstanceReference[] | undefined> {
  const viewer = renderTarget.viewer;
  const caches = renderTarget.cdfCaches;

  const pixelCoordinates = viewer.getPixelCoordinatesFromEvent(event);
  const intersection = await viewer.getAnyIntersectionFromPixel(pixelCoordinates);
  const image360AnnotationIntersection = await viewer.get360AnnotationIntersectionFromPixel(
    event.offsetX,
    event.offsetY
  );

  const image360AnnotationData = image360AnnotationIntersection?.annotation.annotation.data;
  const has360Asset =
    image360AnnotationData !== undefined && is360ImageAnnotation(image360AnnotationData);

  if (has360Asset && image360AnnotationData.assetRef.id !== undefined) {
    return [{ assetId: image360AnnotationData.assetRef.id }];
  }

  if (intersection === undefined) {
    return undefined;
  }

  if (intersection.type === 'cad') {
    return getInstancesFromCadIntersection(intersection, caches);
  } else if (intersection.type === 'pointcloud') {
    return getInstancesFromPointCloudIntersection(intersection, caches);
  }
}

async function getInstancesFromPointCloudIntersection(
  intersection: PointCloudIntersection<DataSourceType>,
  caches: CdfCaches
): Promise<InstanceReference[]> {
  if (isDMIdentifier(intersection.model.modelIdentifier)) {
    return getPointCloudFdmInstancesFromIntersection(
      intersection as PointCloudIntersection<DMDataSourceType>
    );
  } else {
    return getPointCloudAnnotationMappingsFromIntersection(
      intersection as PointCloudIntersection<ClassicDataSourceType>,
      caches
    );
  }
}

async function getPointCloudAnnotationMappingsFromIntersection(
  intersection: PointCloudIntersection,
  caches: CdfCaches
): Promise<InstanceReference[]> {
  if (intersection.volumeMetadata?.assetRef?.id !== undefined) {
    return [{ assetId: intersection.volumeMetadata.assetRef.id }];
  }
  const assetExternalId = intersection.volumeMetadata?.assetRef?.externalId;

  if (assetExternalId === undefined) {
    return [];
  }

  const annotations = await fetchAnnotationsForModel(
    intersection.model.modelIdentifier.modelId,
    intersection.model.modelIdentifier.revisionId,
    [assetExternalId],
    caches.pointCloudAnnotationCache
  );

  return annotations?.map((annotation) => ({ assetId: annotation.asset.id })) ?? EMPTY_ARRAY;
}

async function getPointCloudFdmInstancesFromIntersection(
  intersection: PointCloudIntersection<DMDataSourceType>
): Promise<InstanceReference[]> {
  return intersection.volumeMetadata?.assetRef === undefined
    ? EMPTY_ARRAY
    : [intersection.volumeMetadata.assetRef];
}

async function getInstancesFromCadIntersection(
  intersection: CadIntersection,
  caches: CdfCaches
): Promise<InstanceReference[]> {
  const fdmDataPromise = getCadFdmDataPromise(intersection, caches);

  const assetMappingPromise = getAssetMappingPromise(intersection, caches);

  const [fdmData, assetMapping] = await Promise.all([fdmDataPromise, assetMappingPromise] as const);
  return [...fdmData, ...assetMapping];
}

async function getCadFdmDataPromise(
  intersection: CadIntersection,
  caches: CdfCaches
): Promise<InstanceReference[]> {
  const fdmNodeDataPromises = caches.fdmNodeCache.getClosestParentDataPromises(
    intersection.model.modelId,
    intersection.model.revisionId,
    intersection.treeIndex
  );

  return (await fdmNodeDataPromises.cadAndFdmNodesPromise)?.fdmIds ?? EMPTY_ARRAY;
}

async function getAssetMappingPromise(
  intersection: CadIntersection,
  caches: CdfCaches
): Promise<InstanceReference[]> {
  const ancestors = await fetchAncestorNodesForTreeIndex(
    intersection.model.modelId,
    intersection.model.revisionId,
    intersection.treeIndex,
    caches.cogniteClient
  );

  const nodeAssetResult = await caches.assetMappingAndNode3dCache.getAssetMappingsForLowestAncestor(
    intersection.model.modelId,
    intersection.model.revisionId,
    ancestors
  );

  return nodeAssetResult.mappings.map((mapping) => ({ assetId: mapping.assetId }));
}
