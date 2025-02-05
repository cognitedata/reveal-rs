/*!
 * Copyright 2025 Cognite AS
 */
import { assertNever } from '../assertNever';
import { type InstanceReference, isIdEither } from '../instanceIds';
import {
  isClassicImage360Annotation,
  isClassicImage360AssetAnnotationData,
  isDMImage360Annotation
} from './typeGuards';
import { type Image360AnnotationContent, type Image360AnnotationId } from './types';

export function getAnnotationId(annotation: Image360AnnotationContent): Image360AnnotationId {
  if (isClassicImage360Annotation(annotation)) {
    return annotation.id;
  } else if (isDMImage360Annotation(annotation)) {
    return {
      externalId: annotation.annotationIdentifier.externalId,
      space: annotation.annotationIdentifier.space
    };
  }
  assertNever(annotation);
}

export function getImage360AnnotationAssetRef(
  annotation: Image360AnnotationContent
): InstanceReference | undefined {
  if (isClassicImage360Annotation(annotation)) {
    if (isClassicImage360AssetAnnotationData(annotation.data)) {
      return isIdEither(annotation.data.assetRef) ? annotation.data.assetRef : undefined;
    }
  } else {
    return annotation.assetRef;
  }

  return undefined;
}
