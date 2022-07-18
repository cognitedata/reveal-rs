import { FileInfo } from '@cognite/sdk';
import {
  createSelector,
  createSlice,
  isAnyOf,
  PayloadAction,
} from '@reduxjs/toolkit';
import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  clearFileState,
  deselectAllSelectionsReviewPage,
} from 'src/store/commonActions';
import { RootState } from 'src/store/rootReducer';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { createFileInfo } from 'src/store/util/StateUtils';
import { makeSelectFileAnnotations } from 'src/modules/Common/store/annotation/selectors';
import {
  isImageClassificationData,
  isImageKeypointCollectionData,
} from 'src/modules/Common/types/typeGuards';
import { Status } from 'src/api/annotation/types';
import { VisionAnnotationDataType } from 'src/modules/Common/types';
import { VisionReviewAnnotation } from 'src/modules/Review/types';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { getAnnotationColor } from 'src/utils/colorUtils';

type State = {
  fileIds: number[];
  selectedAnnotationIds: number[];
  hiddenAnnotationIds: number[];
  annotationSettings: {
    show: boolean;
    activeView: 'keypoint' | 'shape';
    createNew: {
      text?: string;
      color?: string;
    };
  };
  scrollToId: string;
};

const initialState: State = {
  fileIds: [],
  selectedAnnotationIds: [],
  hiddenAnnotationIds: [],
  annotationSettings: {
    show: false,
    activeView: 'shape',
    createNew: {
      text: undefined,
      color: undefined,
    },
  },
  scrollToId: '',
};

const reviewSlice = createSlice({
  name: 'reviewSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setReviewFileIds(state, action: PayloadAction<number[]>) {
      state.fileIds = action.payload;
    },
    toggleAnnotationVisibility(
      state,
      action: PayloadAction<{
        annotationId: number;
      }>
    ) {
      const { annotationId } = action.payload;
      if (state.hiddenAnnotationIds.includes(annotationId)) {
        state.hiddenAnnotationIds = state.hiddenAnnotationIds.filter(
          (id) => id !== annotationId
        );
      } else {
        state.hiddenAnnotationIds.push(annotationId);
      }
    },
    selectAnnotation(state, action: PayloadAction<number>) {
      const annotationId = action.payload;
      state.selectedAnnotationIds = [annotationId];
    },
    showAnnotationSettingsModel: {
      prepare: (
        show: boolean,
        type = 'shape',
        text?: string,
        color?: string
      ) => {
        return {
          payload: {
            show,
            options: { type, text, color },
          },
        };
      },
      reducer: (
        state,
        action: PayloadAction<{
          show: boolean;
          options: {
            type: 'keypoint' | 'shape';
            text?: string;
            color?: string;
          };
        }>
      ) => {
        state.annotationSettings.createNew.text = action.payload.options?.text;
        state.annotationSettings.createNew.color =
          action.payload.options?.color;
        state.annotationSettings.activeView = action.payload.options.type;
        state.annotationSettings.show = action.payload.show;
      },
    },
    setScrollToId(state, action: PayloadAction<string>) {
      state.scrollToId = action.payload;
    },
    resetPreview(state) {
      state.selectedAnnotationIds = [];
      state.hiddenAnnotationIds = [];
    },
    resetReviewPage(state) {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deselectAllSelectionsReviewPage, (state) => {
      state.selectedAnnotationIds = [];
      state.scrollToId = '';
    });

    builder.addCase(DeleteAnnotations.fulfilled, (state, { meta: { arg } }) => {
      state.selectedAnnotationIds = state.selectedAnnotationIds.filter(
        (id) => !arg.map((internalId) => internalId.id).includes(id)
      );

      state.hiddenAnnotationIds = state.hiddenAnnotationIds.filter(
        (id) => !arg.map((internalId) => internalId.id).includes(id)
      );
    });

    // Matchers

    builder.addMatcher(
      isAnyOf(DeleteFilesById.fulfilled, clearFileState),
      (state, { payload }) => {
        // clear loaded Ids
        state.fileIds = state.fileIds.filter((id) => !payload.includes(id));
      }
    );
  },
});

export type { State as ReviewReducerState };
export { initialState as reviewReducerInitialState };

export const {
  setReviewFileIds,
  toggleAnnotationVisibility,
  selectAnnotation,
  showAnnotationSettingsModel,
  setScrollToId,
  resetPreview,
} = reviewSlice.actions;

export default reviewSlice.reducer;

// selectors

export const selectAllReviewFiles = createSelector(
  (state: RootState) => state.fileReducer.files.byId,
  (state: RootState) => state.reviewSlice.fileIds,
  (allFiles, allIds) => {
    const files: FileInfo[] = [];
    allIds.forEach(
      (id) => !!allFiles[id] && files.push(createFileInfo(allFiles[id]))
    );
    return files;
  }
);

export const selectAnnotationSettingsState = createSelector(
  (state: State) => state.annotationSettings,
  (annotationSettingsState) => {
    const settingsState = {
      ...annotationSettingsState,
      ...(!annotationSettingsState.createNew.text &&
        !annotationSettingsState.createNew.color && { createNew: {} }),
    };
    return settingsState;
  }
);

const fileAnnotationsSelector = makeSelectFileAnnotations();

export const selectVisionReviewAnnotationsForFile = createSelector(
  (state: RootState, fileId: number) =>
    fileAnnotationsSelector(state.annotationReducer, fileId),
  (state: RootState) => state.reviewSlice.selectedAnnotationIds,
  (state: RootState) => state.reviewSlice.hiddenAnnotationIds,
  (state: RootState) => state.annotatorWrapperReducer.keypointMap.selectedIds,
  (state: RootState) => state.annotationReducer.annotationColorMap,

  (
    fileAnnotations,
    selectedAnnotationIds,
    hiddenAnnotationIds,
    selectedKeypointIds,
    annotationColorMap
  ): VisionReviewAnnotation<VisionAnnotationDataType>[] => {
    return fileAnnotations
      .map((ann) => ({
        annotation: ann,
        show: !hiddenAnnotationIds.includes(ann.id),
        selected: selectedAnnotationIds.includes(ann.id),
        color: getAnnotationColor(
          annotationColorMap,
          getAnnotationLabelOrText(ann),
          ann.annotationType
        ),
      }))
      .map((reviewAnn) => {
        if (isImageKeypointCollectionData(reviewAnn.annotation)) {
          const keypoints = Object.fromEntries(
            Object.entries(reviewAnn.annotation.keypoints).map(
              ([label, keypoint]) => {
                const id = `${reviewAnn.annotation.id}-${label}`;
                return [
                  label,
                  {
                    keypoint,
                    id,
                    label,
                    color: reviewAnn.color, // NOTE: it is possible to have colors per keypoint
                    selected: selectedKeypointIds.includes(id),
                  },
                ];
              }
            )
          );
          return {
            ...reviewAnn,
            annotation: {
              ...reviewAnn.annotation,
              keypoints,
            },
          };
        }
        return reviewAnn;
      });
  }
);

export const selectNonRejectedVisionReviewAnnotationsForFile = createSelector(
  selectVisionReviewAnnotationsForFile,
  (allVisibleAnnotations) => {
    return allVisibleAnnotations.filter(
      (ann) =>
        ann.show &&
        !isImageClassificationData(ann.annotation) && // todo: remove this once imageClassification annotations are supported
        ann.annotation.status !== Status.Rejected
    );
  }
);
