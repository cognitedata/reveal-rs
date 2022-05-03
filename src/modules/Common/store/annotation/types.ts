import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types/annotation';

export type AnnotationState = {
  files: {
    byId: Record<number, number[]>;
  };
  annotations: {
    byId: Record<number, VisionAnnotation<VisionAnnotationDataType>>;
  };
};
