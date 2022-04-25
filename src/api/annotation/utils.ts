import {
  AnnotationRegion,
  VisionDetectionModelType,
} from 'src/api/vision/detectionModels/types';
import {
  AnnotationStatus,
  ModelTypeAnnotationTypeMap,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import {
  CDFAnnotationV1,
  AnnotationMetadataV1,
  AnnotationSourceV1,
  UnsavedAnnotation,
} from 'src/api/annotation/types';

export function getUnsavedAnnotation(
  text: string,
  jobType: VisionDetectionModelType,
  fileId: number,
  source: AnnotationSourceV1,
  region?: AnnotationRegion,
  status = AnnotationStatus.Unhandled,
  data?: AnnotationMetadataV1,
  assetId?: number,
  assetExternalId?: string,
  fileExternalId?: string
): UnsavedAnnotation {
  return {
    text,
    region:
      (region && {
        ...region,
        vertices: region.vertices.map((vertex) => ({
          x: vertex.x,
          y: vertex.y,
        })),
      }) ||
      undefined,
    source,
    status,
    annotationType: ModelTypeAnnotationTypeMap[jobType],
    annotatedResourceId: fileId,
    annotatedResourceType: 'file',
    annotatedResourceExternalId: fileExternalId,
    ...(jobType === VisionDetectionModelType.TagDetection && {
      linkedResourceId: assetId,
      linkedResourceExternalId: assetExternalId || text,
      linkedResourceType: 'asset',
    }),
    data,
  };
}
const enforceValidCoordinate = (coord: number) => {
  if (coord < 0) {
    return 0;
  }
  if (coord > 1) {
    return 1;
  }
  return coord;
};

/**
 * removes duplicate vertices and sets upper and lower limits for vertex positions
 * @param region
 */
export function enforceRegionValidity(region: AnnotationRegion) {
  const validRegion = {
    ...region,
    vertices: region.vertices.map((vertex) => ({
      x: enforceValidCoordinate(vertex.x),
      y: enforceValidCoordinate(vertex.y),
    })),
  };

  const vertexSignatures = validRegion.vertices.map(
    (vertex) => `${vertex.x}-${vertex.y}`
  );

  const validRegionWithoutDuplicates = {
    ...validRegion,
    vertices: validRegion.vertices
      // remove duplicates
      .filter(
        (vertex, i) => vertexSignatures.indexOf(`${vertex.x}-${vertex.y}`) === i
      ),
  };
  return validRegionWithoutDuplicates;
}

export function validateAnnotation(
  annotation: CDFAnnotationV1 | UnsavedAnnotation
): boolean {
  if (annotation.region) {
    const vertexSignatures = annotation.region.vertices.map(
      (vertex) => `${vertex.x}-${vertex.y}`
    );

    const validVertices = annotation.region.vertices.every((vertex, i) => {
      return (
        vertex.x >= 0 &&
        vertex.x <= 1 &&
        vertex.y >= 0 &&
        vertex.y <= 1 &&
        vertexSignatures.indexOf(`${vertex.x}-${vertex.y}`) === i // should not be duplicate
      );
    });
    if (!validVertices) {
      throw new Error(
        'Annotation coordinates must be between 0 and 1 and cannot be duplicate.'
      );
    }
    return true;
  }
  return false;
}

export const getFieldOrSetNull = (
  value: any
): { set: any } | { setNull: true } => {
  if (value === undefined || value === null) {
    return {
      setNull: true,
    };
  }
  return {
    set: value,
  };
};
