import {
  getAnnotationCounts,
  getAnnotationsBadgeCounts,
} from 'src/utils/AnnotationUtils';

import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';

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
