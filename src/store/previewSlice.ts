import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AnnotationBoundingBox,
  AnnotationDrawerMode,
  AnnotationStatus,
  AnnotationUtils,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import { DetectionModelType } from 'src/api/types';
import { fileProcessUpdate } from 'src/store/common';
import {
  deleteFilesById,
  selectFileById,
  updateFileById,
} from 'src/store/uploadedFilesSlice';
import {
  MetadataItem,
  VisionFileDetails,
} from 'src/components/FileMetadata/Types';
import { RootState } from 'src/store/rootReducer';
import { generateKeyValueArray } from 'src/utils/FormatUtils';
import { Label } from '@cognite/cdf-sdk-singleton';
import { ImagePreviewEditMode } from 'src/pages/Preview/Types';

export interface VisionAnnotationState extends VisionAnnotation {
  id: string;
  modelId: string;
  color: string;
  show: boolean;
}

interface VisionModelState {
  modelId: string;
  fileId: string;
  modelType: DetectionModelType;
  annotations: string[];
}

export type FileInfoValueState = string | Label[] | null | undefined;

type State = {
  drawer: {
    show: boolean;
    mode: number | null;
  };
  selectedAnnotations: string[];
  imagePreview: {
    editable: number;
    createdBoundingBoxes: {};
    modifiedBoundingBoxes: {};
  };
  annotations: {
    byId: Record<string, VisionAnnotationState>;
    allIds: string[];
  };
  models: {
    byId: Record<string, VisionModelState>;
    allIds: string[];
  };
  modelsByFileId: Record<string, string[]>;
  metadataEdit: boolean;
  fileDetails: Record<string, FileInfoValueState>;
  fileMetaData: Record<number, MetadataItem>;
  loadingField: string | null;
};

const initialState: State = {
  selectedAnnotations: [],
  drawer: {
    show: false,
    mode: null,
  },
  imagePreview: {
    editable: ImagePreviewEditMode.NotEditable,
    createdBoundingBoxes: {},
    modifiedBoundingBoxes: {},
  },
  annotations: {
    byId: {},
    allIds: [],
  },
  models: {
    byId: {},
    allIds: [],
  },
  modelsByFileId: {},
  metadataEdit: false,
  fileDetails: {},
  fileMetaData: {},
  loadingField: null,
};

const previewSlice = createSlice({
  name: 'previewSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    toggleAnnotationVisibility(
      state,
      action: PayloadAction<{
        annotationId: string;
      }>
    ) {
      const id = action.payload.annotationId;
      const visibility = state.annotations.byId[id].show;
      state.annotations.byId[id].show = !visibility;
    },
    selectAnnotation(state, action: PayloadAction<string>) {
      if (!state.selectedAnnotations.includes(action.payload)) {
        state.selectedAnnotations.push(action.payload);
      }
    },
    deselectAnnotation(state, action: PayloadAction<string>) {
      const annotationIdIndex = state.selectedAnnotations.findIndex(
        (item) => item === action.payload
      );
      if (annotationIdIndex >= 0) {
        state.selectedAnnotations.splice(annotationIdIndex, 1);
      }
    },
    showAnnotationDrawer(state, action: PayloadAction<AnnotationDrawerMode>) {
      state.drawer.show = true;
      state.drawer.mode = action.payload;
    },
    closeAnnotationDrawer(state) {
      state.drawer.show = false;
    },
    setImagePreviewEditState(
      state,
      action: PayloadAction<ImagePreviewEditMode>
    ) {
      state.imagePreview.editable = action.payload;
    },
    updateAnnotation(
      state,
      action: PayloadAction<{ id: string; boundingBox: AnnotationBoundingBox }>
    ) {
      const annotation = state.annotations.byId[action.payload.id];
      annotation.box = action.payload.boundingBox;
    },
    deleteSelectedAnnotations(state) {
      const { selectedAnnotations } = state;
      selectedAnnotations.forEach((annId) => {
        const annotation = state.annotations.byId[annId];
        const models = state.models.byId[annotation.modelId];
        models.annotations = models.annotations.filter(
          (item) => item !== annotation.id
        );
        delete state.annotations.byId[annotation.id];
        state.annotations.allIds = Object.keys(state.annotations.byId);
      });
    },
    annotationApproval(
      state,
      action: PayloadAction<{
        annotationId: string;
        status: AnnotationStatus;
      }>
    ) {
      const { status, annotationId } = action.payload;
      const annotation = state.annotations.byId[annotationId];

      annotation.status = status;
    },
    toggleMetaDataTableEditMode(state, action: PayloadAction<MetadataItem[]>) {
      const editMode = state.metadataEdit;

      if (editMode) {
        // filter rows with empty keys and empty values when finishing edit mode
        const metaRowKeys = Object.keys(state.fileMetaData);
        metaRowKeys.forEach((rowKey) => {
          const metaKey = state.fileMetaData[parseInt(rowKey, 10)].key;
          const metaValue = state.fileMetaData[parseInt(rowKey, 10)].value;

          if (!(metaKey && metaValue)) {
            delete state.fileMetaData[parseInt(rowKey, 10)];
          }
        });
      } else {
        // set metadata when starting edit mode
        state.fileMetaData = {};
        action.payload.forEach((item, index) => {
          state.fileMetaData[index] = item;
        });
      }
      state.metadataEdit = !editMode;
    },
    fileInfoEdit(
      state,
      action: PayloadAction<{
        key: string;
        value: FileInfoValueState;
      }>
    ) {
      state.fileDetails[action.payload.key] = action.payload.value;
    },
    fileMetaDataEdit(
      state,
      action: PayloadAction<{
        index: number;
        key: string;
        value: string;
      }>
    ) {
      state.fileMetaData[action.payload.index] = {
        key: action.payload.key,
        value: action.payload.value || '',
      };
    },
    fileMetaDataAddRow(state, action: PayloadAction<MetadataItem[]>) {
      state.metadataEdit = true;
      state.fileMetaData = {};
      const metaLength = Object.keys(action.payload).length;
      action.payload.forEach((item, index) => {
        state.fileMetaData[index] = item;
      });
      state.fileMetaData[metaLength] = { key: '', value: '' };
    },
    resetEditHistory(state) {
      resetEditHistoryState(state);
    },
  },
  extraReducers: (builder) => {
    // On Delete File //

    builder.addCase(deleteFilesById.fulfilled, (state, { payload }) => {
      payload.forEach((fileId) => {
        const models = state.modelsByFileId[fileId.id];

        models.forEach((modelId) => {
          const modelState = state.models.byId[modelId];
          const { annotations } = modelState;

          annotations.forEach((annotationId) => {
            delete state.annotations.byId[annotationId];
          });
          state.annotations.allIds = Object.keys(state.annotations.byId);

          delete state.models.byId[modelId];
        });
        state.models.allIds = Object.keys(state.models.byId);

        delete state.modelsByFileId[fileId.id];
      });
    });

    // On Update File //

    builder.addCase(updateFileById.fulfilled, (state, { meta }) => {
      const field = meta.arg.key;
      if (field === 'metadata') {
        state.fileMetaData = {};
      } else {
        delete state.fileDetails[field];
      }
      state.loadingField = null;
    });

    builder.addCase(updateFileById.pending, (state, { meta }) => {
      const field = meta.arg.key;
      state.loadingField = field;
    });

    builder.addCase(updateFileById.rejected, (state, { meta }) => {
      const field = meta.arg.key;
      delete state.fileDetails[field];
      state.loadingField = null;
    });

    // On Job Update //

    builder.addCase(fileProcessUpdate, (state, { payload }) => {
      const { job, fileId } = payload;

      if (job.status === 'Completed') {
        if (!state.modelsByFileId[fileId]) {
          state.modelsByFileId[fileId] = [];
        }

        // update model
        const modelId = AnnotationUtils.getModelId(String(fileId), job.type);

        const fileModelArr = state.modelsByFileId[fileId];

        if (fileModelArr && !fileModelArr.includes(modelId)) {
          fileModelArr.push(modelId);
        }

        state.models.byId[modelId] = {
          modelId,
          modelType: job.type,
          fileId: fileId.toString(),
          annotations: [],
        };

        state.models.allIds = Object.keys(state.models.byId);

        const { annotations } = job.items[0];
        const visionAnnotations = AnnotationUtils.convertToAnnotations(
          annotations,
          job.type
        );

        visionAnnotations.forEach((item) => {
          const id = AnnotationUtils.generateAnnotationId(
            String(fileId),
            job.type,
            item.displayId
          );
          state.models.byId[modelId].annotations.push(id);
          state.annotations.byId[id] = {
            id,
            ...item,
            modelId,
            show: true,
          };
        });

        state.annotations.allIds = Object.keys(state.annotations.byId);
      }
    });
  },
});

export default previewSlice.reducer;
export const {
  toggleAnnotationVisibility,
  selectAnnotation,
  deselectAnnotation,
  showAnnotationDrawer,
  closeAnnotationDrawer,
  setImagePreviewEditState,
  updateAnnotation,
  deleteSelectedAnnotations,
  annotationApproval,
  toggleMetaDataTableEditMode,
  fileInfoEdit,
  fileMetaDataEdit,
  fileMetaDataAddRow,
  resetEditHistory,
} = previewSlice.actions;

const resetEditHistoryState = (state: State) => {
  state.metadataEdit = false;
  state.fileMetaData = {};
  state.fileDetails = {};
  state.drawer = {
    show: false,
    mode: null,
  };
  state.imagePreview = {
    editable: 0,
    createdBoundingBoxes: {},
    modifiedBoundingBoxes: {},
  };
  state.selectedAnnotations = [];
};

export const selectModelIdsByFileId = (
  state: State,
  fileId: string
): string[] => state.modelsByFileId[fileId] || [];

export const modelsById = (state: State): { [id: string]: VisionModelState } =>
  state.models.byId;

export const selectModelsByFileId = createSelector(
  modelsById,
  selectModelIdsByFileId,
  (allModels, modelIdsByFile) => {
    return modelIdsByFile.map((id) => {
      return allModels[id];
    });
  }
);

export const annotationsById = (
  state: State
): { [id: string]: VisionAnnotationState } => state.annotations.byId;

export const selectAnnotationsByFileId = createSelector(
  annotationsById,
  selectModelsByFileId,
  (allAnnotations, modelsByFile) => {
    return modelsByFile
      .map((model) => {
        return model.annotations;
      })
      .reduce((acc, annotations) => {
        return acc.concat(annotations);
      }, [])
      .map((id) => allAnnotations[id]);
  }
);

export const selectAnnotationsByFileIdModelType = createSelector(
  selectAnnotationsByFileId,
  selectModelsByFileId,
  (_, fileId: string, modelType: DetectionModelType) => modelType,
  (allAnnotations, models, modelType) => {
    const modelId = models.find((item) => item.modelType === modelType)
      ?.modelId;

    if (modelId) {
      return allAnnotations.filter((item) => item.modelId === modelId);
    }
    return [];
  }
);

export const selectNonRejectedAnnotationsByFileIdModelType = createSelector(
  selectAnnotationsByFileIdModelType,
  (annotationIdsByFileAndModelType) => {
    return annotationIdsByFileAndModelType.filter(
      (item) => item.status !== AnnotationStatus.Rejected
    );
  }
);

export const selectVisibleAnnotationsByFileId = createSelector(
  selectAnnotationsByFileId,
  (annotationIdsByFile) => {
    return annotationIdsByFile.filter((item) => item.show);
  }
);

export const selectVisibleNonRejectedAnnotationsByFileId = createSelector(
  selectVisibleAnnotationsByFileId,
  (visibleAnnotationIdsByFile) => {
    return visibleAnnotationIdsByFile.filter(
      (item) => item.status !== AnnotationStatus.Rejected
    );
  }
);

// metadata selectors //

export const metadataEditMode = (state: State): boolean => state.metadataEdit;

export const editedFileDetails = (
  state: State
): Record<string, FileInfoValueState> => state.fileDetails;

export const editedFileMeta = (state: State): Record<number, MetadataItem> =>
  state.fileMetaData;

export const selectUpdatedFileDetails = createSelector(
  (state: RootState) => editedFileDetails(state.previewSlice),
  (state: RootState, id: string) => selectFileById(state.uploadedFiles, id),
  (editedInfo, fileInfo) => {
    const mergedInfo: VisionFileDetails = {
      ...fileInfo,
      ...editedInfo,
    };
    return mergedInfo;
  }
);

export const selectUpdatedFileMeta = createSelector(
  (state: RootState) => editedFileMeta(state.previewSlice),
  (state: RootState, id: string) => selectFileById(state.uploadedFiles, id),
  (editedMeta, fileInfo) => {
    let metadata: MetadataItem[] = generateKeyValueArray(fileInfo.metadata);

    if (Object.keys(editedMeta).length > 0) {
      metadata = Object.values(editedMeta);
    }
    return metadata;
  }
);
