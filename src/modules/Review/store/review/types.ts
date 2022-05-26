import { VisionAnnotation } from 'src/modules/Common/types';
import {
  AnnotatedResourceId,
  ImageKeypoint,
  Label,
} from 'src/api/annotation/types';

// primitives

type Visible = {
  show: boolean;
};

type Selectable = {
  selected: boolean;
};

type KeypointId = { id: string };

// derivations

// Casts ImageKeypoint to ReviewKeypoint[] if Type is ImageKeypoint[]
export type TurnKeypointType<Type> = {
  [Property in keyof Type]: Type[Property] extends ImageKeypoint[]
    ? ReviewImageKeypoint[]
    : Type[Property];
};

export type VisionReviewAnnotation<Type> = Visible &
  Selectable & {
    annotation: TurnKeypointType<VisionAnnotation<Type>>;
  };

// TODO: should this have "Vision" prefix?
export type ReviewImageKeypoint = KeypointId &
  Selectable & {
    keypoint: ImageKeypoint;
  };

// type for temp keypoint collection
export type UnsavedKeypointCollection = Label &
  Visible &
  AnnotatedResourceId &
  Selectable & {
    reviewKeypoints: ReviewImageKeypoint[];
  };
