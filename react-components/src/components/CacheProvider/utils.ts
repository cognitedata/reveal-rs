/*!
 * Copyright 2024 Cognite AS
 */

import {
  type AnnotationsCogniteAnnotationTypesImagesAssetLink,
  type AnnotationModel,
  type AnnotationsBoundingVolume,
  type AssetMapping3D,
  type IdEither
} from '@cognite/sdk';
import { type CoreDmImage360Annotation, type DataSourceType } from '@cognite/reveal';
import { type InstanceReference, isIdEither } from '../../utilities/instanceIds';
import {
  createInstanceReferenceKey,
  type InstanceReferenceKey
} from '../../utilities/instanceIds/toKey';
import { createFdmKey } from './idAndKeyTranslation';
import { type DmsUniqueIdentifier } from '../../data-providers';

export function getInstanceReferenceFromPointCloudAnnotation(
  annotation: AnnotationModel
): IdEither | undefined {
  const annotationData = annotation.data as AnnotationsBoundingVolume;
  const assetRef = annotationData.assetRef;
  return assetRef !== undefined && isIdEither(assetRef) ? assetRef : undefined;
}

export function getInstanceReferenceFromImage360Annotation(
  annotation: DataSourceType['image360AnnotationType']
): InstanceReference | undefined {
  if (isCoreDmImage360Annotation(annotation)) {
    return annotation.assetRef;
  } else {
    const annotationData = annotation.data as AnnotationsCogniteAnnotationTypesImagesAssetLink;
    const assetRef = annotationData.assetRef;
    return assetRef !== undefined && isIdEither(assetRef as IdEither)
      ? (assetRef as IdEither)
      : undefined;
  }
}

export function getAssetIdKeyForImage360Annotation(
  annotation: DataSourceType['image360AnnotationType']
): InstanceReferenceKey | undefined {
  const instanceRef = getInstanceReferenceFromImage360Annotation(annotation);
  if (instanceRef === undefined) {
    return undefined;
  }
  return createInstanceReferenceKey(instanceRef);
}

export function getIdKeyForImage360Annotation(
  annotation: DataSourceType['image360AnnotationType']
): string | number {
  if (isCoreDmImage360Annotation(annotation)) {
    return createFdmKey(annotation.annotationIdentifier);
  } else {
    return annotation.id;
  }
}

export function getIdForImage360Annotation(
  annotation: DataSourceType['image360AnnotationType']
): DmsUniqueIdentifier | number {
  if (isCoreDmImage360Annotation(annotation)) {
    return annotation.annotationIdentifier;
  } else {
    return annotation.id;
  }
}

// TODO: Implement this in Reveal instead
function isCoreDmImage360Annotation(
  annotation: DataSourceType['image360AnnotationType']
): annotation is CoreDmImage360Annotation {
  return (annotation as CoreDmImage360Annotation).annotationIdentifier?.externalId !== undefined;
}

export function isValidAssetMapping(assetMapping: AssetMapping3D): assetMapping is AssetMapping3D {
  return assetMapping.treeIndex !== undefined && assetMapping.subtreeSize !== undefined;
}
