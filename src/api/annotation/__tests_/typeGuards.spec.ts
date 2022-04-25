import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { getDummyAnnotation } from 'src/__test-utils/annotations';
import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import {
  isAssetLinkedAnnotation,
  isKeyPointAnnotation,
  isObjectAnnotation,
  isPolygon,
  isTextAnnotation,
} from 'src/api/annotation/typeGuards';

const textAnnotation = getDummyAnnotation(1, VisionDetectionModelType.OCR, {
  text: 'one',
});
const tagAnnotation = getDummyAnnotation(
  1,
  VisionDetectionModelType.TagDetection,
  { status: AnnotationStatus.Verified, assetId: 1 }
);
const keypointsAnnotation = getDummyAnnotation(
  1,
  VisionDetectionModelType.CustomModel,
  { shape: 'points', data: { keypoint: true } }
);
const objectAnnotation = getDummyAnnotation(
  1,
  VisionDetectionModelType.ObjectDetection
);
const polygonAnnotation = getDummyAnnotation(
  1,
  VisionDetectionModelType.CustomModel,
  { shape: 'polygon' }
);

describe('Test isAssetLinkedAnnotation', () => {
  test('Rejects invalid Asset Linked Annotation', () => {
    const invalidTagAnnotation = getDummyAnnotation(
      1,
      VisionDetectionModelType.TagDetection,
      { status: AnnotationStatus.Verified }
    );
    expect(isAssetLinkedAnnotation(textAnnotation)).toBe(false);
    expect(isAssetLinkedAnnotation(keypointsAnnotation)).toBe(false);
    expect(isAssetLinkedAnnotation(objectAnnotation)).toBe(false);
    expect(isAssetLinkedAnnotation(polygonAnnotation)).toBe(false);
    expect(isAssetLinkedAnnotation(invalidTagAnnotation)).toBe(false);
  });

  test('Accepts valid Asset Linked Annotation', () => {
    expect(isAssetLinkedAnnotation(tagAnnotation)).toBe(true);
  });
});

describe('Test isTextAnnotation', () => {
  test('Rejects invalid Text Annotation', () => {
    expect(isTextAnnotation(tagAnnotation)).toBe(false);
    expect(isTextAnnotation(keypointsAnnotation)).toBe(false);
    expect(isTextAnnotation(objectAnnotation)).toBe(false);
    expect(isTextAnnotation(polygonAnnotation)).toBe(false);
  });

  test('Accepts valid Text Annotation', () => {
    expect(isTextAnnotation(textAnnotation)).toBe(true);
  });
});

describe('Test isKeyPointAnnotation', () => {
  test('Rejects invalid Keypoint Annotation', () => {
    expect(isKeyPointAnnotation(textAnnotation)).toBe(false);
    expect(isKeyPointAnnotation(tagAnnotation)).toBe(false);
    expect(isKeyPointAnnotation(objectAnnotation)).toBe(false);
    expect(isKeyPointAnnotation(polygonAnnotation)).toBe(false);
  });

  test('Accepts valid KeypointAnnotation', () => {
    expect(isKeyPointAnnotation(keypointsAnnotation)).toBe(true);
  });
});

describe('Test isObjectAnnotation', () => {
  test('Rejects invalid Object Annotation', () => {
    expect(isObjectAnnotation(textAnnotation)).toBe(false);
    expect(isObjectAnnotation(tagAnnotation)).toBe(false);
  });

  test('Accepts valid Object Annotation', () => {
    const userDefinedAnnotation = getDummyAnnotation(
      1,
      VisionDetectionModelType.ObjectDetection,
      { status: AnnotationStatus.Verified, type: 'user_defined' }
    );
    expect(isObjectAnnotation(objectAnnotation)).toBe(true);
    expect(isObjectAnnotation(polygonAnnotation)).toBe(true);
    expect(isObjectAnnotation(userDefinedAnnotation)).toBe(true);
  });
});

describe('Test isPolygon', () => {
  test('Rejects polygon Annotation', () => {
    expect(isPolygon(textAnnotation)).toBe(false);
    expect(isPolygon(tagAnnotation)).toBe(false);
    expect(isPolygon(keypointsAnnotation)).toBe(false);
    expect(isPolygon(objectAnnotation)).toBe(false);
  });

  test('Accepts valid Polygon Annotation', () => {
    expect(isPolygon(polygonAnnotation)).toBe(true);
  });
});
