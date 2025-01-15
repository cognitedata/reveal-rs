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

export function getInstanceReferenceFromPointCloudAnnotation(
  annotation: AnnotationModel
): IdEither | undefined {
  const annotationData = annotation.data as AnnotationsBoundingVolume;
  const assetRef = annotationData.assetRef;
  return assetRef !== undefined && isIdEither(annotationData.assetRef as IdEither)
    ? (assetRef as IdEither)
    : undefined;
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

/* export function assetOrExternalIdToInstanceReference(
  assetIdentifier: string | number | DmsUniqueIdentifier
): InstanceReference {
  if (typeof assetIdentifier === 'string') {
    return { externalId: assetIdentifier };
  } else if (typeof assetIdentifier === 'number') {
    return { id: assetIdentifier };
  } else {
    return assetIdentifier;
  }
} */

export function getAssetIdKeyForImage360Annotation(
  annotation: DataSourceType['image360AnnotationType']
): InstanceReferenceKey | undefined {
  const instanceRef = getInstanceReferenceFromImage360Annotation(annotation);
  if (instanceRef === undefined) {
    return undefined;
  }
  return createInstanceReferenceKey(instanceRef);
}

/* export function getIdKeyForAssetId(
  annotationAssetRef: AnnotationsAssetRef | DmsUniqueIdentifier | number | string
): string | undefined {
  if (typeof annotationAssetRef === 'string') {
    return annotationAssetRef;
  }
  if (typeof annotationAssetRef === 'number') {
    return String(annotationAssetRef);
  }
  if (isDmAnnotationAssetRef(annotationAssetRef)) {
    return createFdmKey(annotationAssetRef);
  }

  return annotationAssetRef.id !== undefined
    ? String(annotationAssetRef.id)
    : annotationAssetRef.externalId;

  function isDmAnnotationAssetRef(
    annotationAssetRef: AnnotationsAssetRef | DmsUniqueIdentifier
  ): annotationAssetRef is DmsUniqueIdentifier {
    return (
      (annotationAssetRef as DmsUniqueIdentifier).externalId !== undefined &&
      (annotationAssetRef as DmsUniqueIdentifier).space !== undefined
    );
  }
} */

export function getIdKeyForImage360Annotation(
  annotation: DataSourceType['image360AnnotationType']
): string | number {
  if (isCoreDmImage360Annotation(annotation)) {
    return createFdmKey(annotation.annotationIdentifier);
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
