import {
  AnnotationUtils,
  calculateBadgeCountsDifferences,
  getAnnotationCounts,
  getAnnotationsBadgeCounts,
  AnnotationStatus,
} from 'src/utils/AnnotationUtils';

import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { getDummyAnnotation } from 'src/__test-utils/annotations';

describe('annotationCounts', () => {
  it('should return unique annotation texts and number of occurences', () => {
    const annotations = [
      {
        label: 'gauge',
      },
      {
        label: 'pump',
      },
      {
        label: 'pump',
      },
    ];

    expect(getAnnotationCounts(annotations)).toStrictEqual({
      gauge: 1,
      pump: 2,
    });
  });
});

describe('getAnnotationsBadgeCounts', () => {
  it('should return unique annotation texts and number of occurences', () => {
    const annotations = [
      {
        label: 'gauge',
        modelType: VisionDetectionModelType.ObjectDetection,
      },
      {
        label: 'gauge',
        modelType: VisionDetectionModelType.ObjectDetection,
      },
      {
        label: 'PTX123',
        modelType: VisionDetectionModelType.TagDetection,
      },
      {
        label: 'person',
        modelType: VisionDetectionModelType.ObjectDetection,
      },
    ];

    expect(getAnnotationsBadgeCounts(annotations)).toStrictEqual({
      objects: 2,
      assets: 1,
      text: 0,
      gdpr: 1,
      mostFrequentObject: ['gauge', 2],
    });
  });
});

describe('calculateBadgeCountsDifferences', () => {
  it('should return difference between A and B', () => {
    const badgeCountsA = {
      gdpr: 10,
      assets: 10,
      text: 10,
      objects: 10,
    };
    const badgeCountsB = {
      gdpr: 4,
      assets: 4,
      text: 4,
      objects: 4,
    };
    expect(calculateBadgeCountsDifferences(badgeCountsA, badgeCountsB)).toEqual(
      {
        objects: 6,
        assets: 6,
        text: 6,
        gdpr: 6,
        mostFrequentObject: undefined,
      }
    );
  });
  it('should return difference of non-null values between A and B', () => {
    const badgeCountsA = {
      gdpr: 10,
      text: 10,
      objects: 1,
    };
    const badgeCountsB = {
      gdpr: 4,
      assets: 4,
      objects: 10,
    };
    expect(calculateBadgeCountsDifferences(badgeCountsA, badgeCountsB)).toEqual(
      {
        gdpr: 6,
        assets: 0,
        text: 0,
        objects: 0,
        mostFrequentObject: undefined,
      }
    );
  });
});

describe('filterAnnotations', () => {
  const statuses = [
    AnnotationStatus.Verified,
    AnnotationStatus.Rejected,
    AnnotationStatus.Unhandled,
  ];
  const names = ['a', 'a', 'b'];
  const annotations = statuses.map((annotationStatus, index) =>
    getDummyAnnotation(index + 1, 1, {
      status: annotationStatus,
      text: names[index],
    })
  );
  test('undefined filter', () => {
    expect(AnnotationUtils.filterAnnotations(annotations)).toEqual(
      expect.arrayContaining(annotations)
    );
  });
  test('empty filter', () => {
    expect(AnnotationUtils.filterAnnotations(annotations, {})).toEqual(
      expect.arrayContaining(annotations)
    );
  });
  statuses.forEach((annotationStatus, index) => {
    test(`filter ${annotationStatus}`, () => {
      expect(
        AnnotationUtils.filterAnnotations(annotations, { annotationStatus })
      ).toEqual(expect.arrayContaining([annotations[index]]));
    });
  });
  test('filter annotation text', () => {
    expect(
      AnnotationUtils.filterAnnotations(annotations, { annotationText: 'a' })
    ).toEqual(expect.arrayContaining(annotations.slice(0, 2)));
  });
});
