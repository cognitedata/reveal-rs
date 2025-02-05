/*!
 * Copyright 2024 Cognite AS
 */

import {
  type CadIntersection,
  type ClassicDataSourceType,
  type DataSourceType,
  type DMDataSourceType,
  type PointCloudIntersection
} from '@cognite/reveal';
import { type CdfCaches } from '../architecture/base/renderTarget/CdfCaches';
import { fetchAncestorNodesForTreeIndex } from '../components/CacheProvider/requests';
import { EMPTY_ARRAY } from './constants';
import { fetchAnnotationsForModel } from '../hooks/pointClouds/fetchAnnotationsForModel';
import { isDM3DModelIdentifier } from '../components';
import { type RevealRenderTarget } from '../architecture';
import { getInstanceReferenceFromImage360Annotation } from '../components/CacheProvider/utils';
import { type InstanceReference, isIdEither } from './instanceIds';

export async function getInstancesFromClick(
  renderTarget: RevealRenderTarget,
  event: PointerEvent
): Promise<InstanceReference[] | undefined> {
  const viewer = renderTarget.viewer;
  const caches = renderTarget.cdfCaches;
  const coreDmOnly = caches.coreDmOnly;

  const pixelCoordinates = viewer.getPixelCoordinatesFromEvent(event);
  const intersection = await viewer.getAnyIntersectionFromPixel(pixelCoordinates);
  const image360AnnotationIntersection = await viewer.get360AnnotationIntersectionFromPixel(
    event.offsetX,
    event.offsetY
  );

  const image360Annotation = image360AnnotationIntersection?.annotation.annotation;
  const annotationAsset =
    image360Annotation !== undefined
      ? getInstanceReferenceFromImage360Annotation(image360Annotation)
      : undefined;

  if (!coreDmOnly && annotationAsset !== undefined) {
    return [annotationAsset];
  }

  if (intersection === undefined) {
    return undefined;
  }

  if (intersection.type === 'cad') {
    return await getInstancesFromCadIntersection(intersection, caches);
  } else if (intersection.type === 'pointcloud') {
    return await getInstancesFromPointCloudIntersection(intersection, caches);
  }

  return undefined;
}

async function getInstancesFromPointCloudIntersection(
  intersection: PointCloudIntersection<DataSourceType>,
  caches: CdfCaches
): Promise<InstanceReference[]> {
  if (isDM3DModelIdentifier(intersection.model.modelIdentifier)) {
    return getPointCloudFdmInstancesFromIntersection(
      intersection as PointCloudIntersection<DMDataSourceType>
    );
  } else {
    return await getPointCloudAnnotationMappingsFromIntersection(
      intersection as PointCloudIntersection<ClassicDataSourceType>,
      caches
    );
  }
}

async function getPointCloudAnnotationMappingsFromIntersection(
  intersection: PointCloudIntersection,
  caches: CdfCaches
): Promise<InstanceReference[]> {
  if (caches.coreDmOnly) {
    return [];
  }

  if (
    intersection.volumeMetadata?.assetRef !== undefined &&
    isIdEither(intersection.volumeMetadata.assetRef)
  ) {
    return [intersection.volumeMetadata.assetRef];
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

  return annotations?.map((annotation) => ({ id: annotation.asset.id })) ?? EMPTY_ARRAY;
}

function getPointCloudFdmInstancesFromIntersection(
  intersection: PointCloudIntersection<DMDataSourceType>
): InstanceReference[] {
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
  if (caches.coreDmOnly) {
    return [];
  }

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

  return nodeAssetResult.mappings.map((mapping) => ({ id: mapping.assetId }));
}
