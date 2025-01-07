import { Image360RevisionId, ImageAssetLinkAnnotationInfo } from '../types';
import { ClassicDataSourceType, DataSourceType } from '../DataSourceType';
import { Image360DataModelIdentifier } from 'api-entry-points/core';
import {
  AnnotationData,
  AnnotationModel,
  AnnotationsCogniteAnnotationTypesImagesAssetLink,
  Metadata
} from '@cognite/sdk/dist/src';
import { Image360LegacyDataModelIdentifier } from './descriptor-providers/datamodels/system-space/Cdf360DataModelsDescriptorProvider';
import { isDmIdentifier } from '@reveal/utilities';

export function isClassicMetadata360Identifier(id: DataSourceType['image360Identifier']): id is Metadata {
  return (id as Metadata).site_id !== undefined;
}

export function isClassic360Identifier(
  id: DataSourceType['image360Identifier']
): id is ClassicDataSourceType['image360Identifier'] {
  return isLegacyDM360Identifier(id) || isClassicMetadata360Identifier(id);
}

export function isLegacyDM360Identifier(
  id: DataSourceType['image360Identifier']
): id is Image360LegacyDataModelIdentifier {
  return (
    (id as Image360DataModelIdentifier).image360CollectionExternalId !== undefined &&
    (id as Image360DataModelIdentifier).space !== undefined &&
    (id as Image360DataModelIdentifier).source === 'dm'
  );
}

export function isCoreDmImage360Identifier(
  id: DataSourceType['image360Identifier']
): id is Image360DataModelIdentifier {
  return (
    (id as Image360DataModelIdentifier).image360CollectionExternalId !== undefined &&
    (id as Image360DataModelIdentifier).space !== undefined &&
    (id as Image360DataModelIdentifier).source === 'cdm'
  );
}
export function isFdm360ImageCollectionIdentifier(
  id: DataSourceType['image360Identifier']
): id is Image360DataModelIdentifier {
  return isLegacyDM360Identifier(id) || isCoreDmImage360Identifier(id);
}

export function isSameImage360RevisionId<T extends DataSourceType>(
  id0: Image360RevisionId<T>,
  id1: Image360RevisionId<T>
): boolean {
  if (isDmIdentifier(id0) && isDmIdentifier(id1)) {
    return id0.externalId === id1.externalId && id0.space === id1.space;
  } else if (typeof id0 === 'string' && typeof id1 === 'string') {
    return id0 === id1;
  }

  return false;
}

export function isImageAssetLinkAnnotation(annotation: AnnotationModel): annotation is ImageAssetLinkAnnotationInfo {
  return isAssetLinkAnnotationData(annotation.data);
}

function isAssetLinkAnnotationData(
  annotationData: AnnotationData
): annotationData is AnnotationsCogniteAnnotationTypesImagesAssetLink {
  const data = annotationData as AnnotationsCogniteAnnotationTypesImagesAssetLink;
  return data.text !== undefined && data.textRegion !== undefined && data.assetRef !== undefined;
}
