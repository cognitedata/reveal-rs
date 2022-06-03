import { createSlice, isAnyOf } from '@reduxjs/toolkit';
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import { clearAnnotationState } from 'src/store/commonActions';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import {
  clearAnnotationStates,
  repopulateAnnotationState,
} from 'src/modules/Common/store/annotation/util';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types/annotation';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { InternalId } from '@cognite/sdk';
import { VisionJobUpdate } from 'src/store/thunks/Process/VisionJobUpdate';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';

export const initialState: AnnotationState = {
  files: {
    byId: {},
  },
  annotations: {
    byId: {},
  },
  annotationColorMap: {},
};

const annotationSlice = createSlice({
  name: 'annotation',
  initialState,
  reducers: {},
  /* eslint-disable no-param-reassign */
  extraReducers: (builder) => {
    builder.addCase(
      RetrieveAnnotations.fulfilled,
      (
        state: AnnotationState,
        {
          payload,
          meta,
        }: {
          payload: VisionAnnotation<VisionAnnotationDataType>[];
          meta: {
            arg: {
              fileIds: number[];
              clearCache?: boolean | undefined;
            };
            requestId: string;
            requestStatus: 'fulfilled';
          };
        }
      ) => {
        const { fileIds, clearCache } = meta.arg;

        // clear states
        clearAnnotationStates(state, fileIds, clearCache);

        repopulateAnnotationState(state, payload);
      }
    );

    builder.addCase(
      DeleteAnnotations.fulfilled,
      (state: AnnotationState, { payload }: { payload: InternalId[] }) => {
        payload.forEach((payloadId) => {
          const { id: annotationId } = payloadId;
          const annotation = state.annotations.byId[annotationId];

          if (annotation) {
            const resourceId: number = annotation.annotatedResourceId;
            const annotatedFileState = state.files.byId[resourceId];
            if (annotatedFileState) {
              const filteredState = annotatedFileState.filter(
                (id) => id !== annotationId
              );
              if (filteredState.length) {
                state.files.byId[resourceId] = filteredState;
              } else {
                delete state.files.byId[resourceId];
              }
            }
            delete state.annotations.byId[annotationId];

            // don't clean annotationColorMap
          }
        });
      }
    );

    builder.addMatcher(
      isAnyOf(
        // CreateAnnotationsV1.fulfilled,
        VisionJobUpdate.fulfilled,
        UpdateAnnotations.fulfilled
      ),
      (state: AnnotationState, { payload }) => {
        // update annotations
        repopulateAnnotationState(state, payload);
      }
    );

    builder.addMatcher(
      isAnyOf(DeleteFilesById.fulfilled, clearAnnotationState),
      (state: AnnotationState, action) => {
        clearAnnotationStates(state, action.payload, false);
      }
    );
  },
});

export default annotationSlice.reducer;
