import {
  AnnotationData,
  AnnotationModel,
  AnnotationsCogniteAnnotationTypesImagesAssetLink
} from '@cognite/sdk';
import { DmsUniqueIdentifier } from '../../data-providers';
import { Image360AnnotationContent, Image360AnnotationId } from './types';
import { CoreDmImage360Annotation } from '@cognite/reveal';

export function isClassicImage360AnnotationId(
  annotationId: Image360AnnotationId
): annotationId is number {
  return typeof annotationId === 'number';
}

export function isDMImage360AnnotationId(
  annotationId: Image360AnnotationId
): annotationId is DmsUniqueIdentifier {
  return (
    (annotationId as DmsUniqueIdentifier).externalId !== undefined &&
    (annotationId as DmsUniqueIdentifier).space !== undefined
  );
}

export function isClassicImage360Annotation(
  annotation: Image360AnnotationContent
): annotation is AnnotationModel {
  return (
    (annotation as AnnotationModel).annotatedResourceType !== undefined &&
    (annotation as AnnotationModel).annotatedResourceId !== undefined
  );
}

export function isClassicImage360AssetAnnotationData(
  annotationData: AnnotationData
): annotationData is AnnotationsCogniteAnnotationTypesImagesAssetLink {
  const data = annotationData as AnnotationsCogniteAnnotationTypesImagesAssetLink;
  return data.text !== undefined && data.textRegion !== undefined && data.assetRef !== undefined;
}

export function isDMImage360Annotation(
  annotation: Image360AnnotationContent
): annotation is CoreDmImage360Annotation {
  return (annotation as CoreDmImage360Annotation).annotationIdentifier !== undefined;
}
