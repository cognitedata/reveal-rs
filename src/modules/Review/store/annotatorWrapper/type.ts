import { PredefinedVisionAnnotations, Tool } from 'src/modules/Review/types';
import { Keypoint, Status } from 'src/api/annotation/types';

export type KeypointCollectionState = {
  id: number;
  keypointIds: string[];
  label: string;
  show: boolean;
  status: Status;
  // do we have to have selected state here?
};

export type AnnotatorWrapperState = {
  predefinedAnnotations: PredefinedVisionAnnotations;
  keypointMap: {
    byId: Record<string, Keypoint>;
    allIds: string[];
    selectedIds: string[];
  };
  collections: {
    byId: Record<number, KeypointCollectionState>;
    allIds: number[];
    selectedIds: number[];
  };
  lastCollectionId: number | undefined;
  lastCollectionName: string | undefined; // Caption (label) of last used Predefined Annotations collection, use to select for the next time
  lastShape: string | undefined; // shapeName (label) of last used predefined shapes, use to select for the next time
  lastKeyPoint: string | undefined; // label of last created keypoint to get next keypoint
  currentTool: Tool;
  keepUnsavedRegion: boolean;
};
