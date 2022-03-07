/* eslint-disable no-param-reassign */
import { isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import {
  DetectionModelParams,
  VisionDetectionModelType,
} from 'src/api/vision/detectionModels/types';
import {
  removeJobFromFiles,
  addJobToState,
} from 'src/modules/Process/store/utils';
import { clearFileState, fileProcessUpdate } from 'src/store/commonActions';
import { DEFAULT_PAGE_SIZE } from 'src/constants/PaginationConsts';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { CreateVisionJob } from 'src/store/thunks/Process/CreateVisionJob';
import { createGenericTabularDataSlice } from 'src/store/genericTabularDataSlice';
import { getFakeQueuedJob } from 'src/api/vision/detectionModels/detectionUtils';
import { ProcessState } from 'src/modules/Process/store/types';

export const BUILT_IN_MODEL_COUNT = 3; // ocr, tag & objectdetection

const initialDetectionModelParameters = {
  ocr: {
    useCache: true,
  },
  tagDetection: {
    useCache: true,
    partialMatch: true,
    assetSubtreeIds: [],
  },
  objectDetection: {
    threshold: 0.8,
  },
  gaugeReader: {
    gaugeType: 'analog',
  },
  customModel: {
    modelJobId: undefined,
    threshold: 0.8,
  },
};

export const initialState: ProcessState = {
  focusedFileId: null,
  showFileMetadata: false,
  currentView: 'list',
  mapTableTabKey: 'fileInMap',
  sortMeta: {
    sortKey: '',
    reverse: false,
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  },
  isLoading: false,
  fileIds: [],
  showFileUploadModal: false,
  files: {
    byId: {},
    allIds: [],
  },
  uploadedFileIds: [],
  jobs: {
    byId: {},
    allIds: [],
  },
  error: undefined,
  selectedDetectionModels: [VisionDetectionModelType.OCR],
  availableDetectionModels: [
    {
      modelName: 'Text detection',
      type: VisionDetectionModelType.OCR,
      settings: initialDetectionModelParameters.ocr,
      unsavedSettings: initialDetectionModelParameters.ocr,
    },
    {
      modelName: 'Asset tag detection',
      type: VisionDetectionModelType.TagDetection,
      settings: initialDetectionModelParameters.tagDetection,
      unsavedSettings: initialDetectionModelParameters.tagDetection,
    },
    {
      modelName: 'Object detection',
      type: VisionDetectionModelType.ObjectDetection,
      settings: initialDetectionModelParameters.objectDetection,
      unsavedSettings: initialDetectionModelParameters.objectDetection,
    },
    {
      modelName: 'Gauge reader',
      type: VisionDetectionModelType.GaugeReader,
      settings: initialDetectionModelParameters.gaugeReader,
      unsavedSettings: initialDetectionModelParameters.gaugeReader,
    },
  ],
  showExploreModal: false,
  showSummaryModal: false,
};

const processSlice = createGenericTabularDataSlice({
  name: 'processSlice',
  initialState: initialState as ProcessState,
  reducers: {
    setProcessFileIds(state, action: PayloadAction<number[]>) {
      state.fileIds = action.payload;
    },
    setSelectedDetectionModels(
      state,
      action: PayloadAction<Array<VisionDetectionModelType>>
    ) {
      state.selectedDetectionModels = action.payload;
    },
    setUnsavedDetectionModelSettings(
      state,
      action: PayloadAction<{
        modelIndex: number;
        params: DetectionModelParams;
      }>
    ) {
      const { params, modelIndex } = action.payload;
      state.availableDetectionModels[modelIndex].unsavedSettings = params;
    },
    setDetectionModelParameters(state) {
      state.availableDetectionModels.forEach((item) => {
        item.settings = item.unsavedSettings;
      });
    },

    revertDetectionModelParameters(state) {
      state.availableDetectionModels.forEach((item) => {
        item.unsavedSettings = item.settings;
      });
    },
    resetDetectionModelParameters(state) {
      state.availableDetectionModels.forEach((item) => {
        switch (item.type) {
          case VisionDetectionModelType.OCR:
            item.unsavedSettings = initialDetectionModelParameters.ocr;
            break;
          case VisionDetectionModelType.TagDetection:
            item.unsavedSettings = initialDetectionModelParameters.tagDetection;
            break;
          case VisionDetectionModelType.ObjectDetection:
            item.unsavedSettings =
              initialDetectionModelParameters.objectDetection;
            break;
          case VisionDetectionModelType.CustomModel:
            item.unsavedSettings = initialDetectionModelParameters.customModel;
            break;
        }
      });
    },
    addToAvailableDetectionModels(state) {
      const modelCount = state.availableDetectionModels.length;
      const modelName =
        modelCount - BUILT_IN_MODEL_COUNT
          ? `Custom model (${modelCount - BUILT_IN_MODEL_COUNT})`
          : 'Custom model';
      state.availableDetectionModels.push({
        modelName,
        type: VisionDetectionModelType.CustomModel,
        settings: initialDetectionModelParameters.customModel,
        unsavedSettings: initialDetectionModelParameters.customModel,
      });
    },
    setCustomModelName(
      state,
      action: PayloadAction<{
        modelIndex: number;
        modelName: string;
      }>
    ) {
      const { modelIndex, modelName } = action.payload;
      state.availableDetectionModels[modelIndex].modelName = modelName;
    },
    removeJobById(state, action: PayloadAction<number>) {
      removeJobFromFiles(state, action.payload);

      delete state.jobs.byId[action.payload];
      state.jobs.allIds = Object.keys(state.jobs.byId).map((id) =>
        parseInt(id, 10)
      );
    },
    setProcessViewFileUploadModalVisibility(
      state,
      action: PayloadAction<boolean>
    ) {
      state.showFileUploadModal = action.payload;
    },
    setSelectFromExploreModalVisibility(state, action: PayloadAction<boolean>) {
      state.showExploreModal = action.payload;
    },
    setSummaryModalVisibility(state, action: PayloadAction<boolean>) {
      state.showSummaryModal = action.payload;
    },
    addProcessUploadedFileId(state, action: PayloadAction<number>) {
      state.uploadedFileIds.push(action.payload);
    },
    clearUploadedFiles(state) {
      state.uploadedFileIds = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fileProcessUpdate, (state, { payload }) => {
      const { fileIds, job, modelType, completedFileIds, failedFileIds } =
        payload;
      addJobToState(
        state,
        fileIds,
        job,
        modelType,
        completedFileIds,
        failedFileIds
      );
    });

    /* CreateVisionJob */

    builder.addCase(CreateVisionJob.pending, (state, { meta }) => {
      const { fileIds, modelType } = meta.arg;

      addJobToState(
        state,
        fileIds,
        { ...getFakeQueuedJob(modelType), type: modelType },
        modelType
      );
    });

    builder.addCase(CreateVisionJob.fulfilled, (state, { payload, meta }) => {
      const newJob = payload;
      const { fileIds, modelType } = meta.arg;
      addJobToState(state, fileIds, newJob, modelType);
    });

    builder.addCase(CreateVisionJob.rejected, (state, { error, meta }) => {
      const { fileIds, modelType } = meta.arg;
      const queuedJob = state.jobs.byId[getFakeQueuedJob(modelType).jobId];

      if (queuedJob) {
        removeJobFromFiles(state, queuedJob.jobId);

        const filteredFileIds = queuedJob.fileIds.filter(
          (fid) => !fileIds.includes(fid)
        );
        state.jobs.byId[queuedJob.jobId].fileIds = filteredFileIds;

        if (!filteredFileIds.length) {
          delete state.jobs.byId[queuedJob.jobId];
          state.jobs.allIds = Object.keys(state.jobs.byId).map((id) =>
            parseInt(id, 10)
          );
        }
      }

      state.error = error.message;
    });

    builder.addMatcher(
      isAnyOf(DeleteFilesById.fulfilled, clearFileState),
      (state, action) => {
        const deletedFileIds = action.payload;
        deletedFileIds.forEach((fileId) => {
          // clear jobs state
          if (state.files.byId[fileId]) {
            const { jobIds } = state.files.byId[fileId];
            jobIds.forEach((jobId) => {
              const job = state.jobs.byId[jobId];
              const otherFilesInJob = job.fileIds.filter(
                (otherFileId) => otherFileId !== fileId
              );
              if (
                otherFilesInJob.every(
                  (otherFileId) => !state.files.byId[otherFileId]
                )
              ) {
                // if every other file of the job is deleted
                delete state.jobs.byId[jobId];
                state.jobs.allIds = Object.keys(state.jobs.byId).map((id) =>
                  parseInt(id, 10)
                );
              }
            });
          }

          delete state.files.byId[fileId];
          if (state.focusedFileId === fileId) {
            // hide drawer and reset selected file if it's deleted
            state.focusedFileId = null;
            state.showFileMetadata = false;
          }
        });
        // clear upload state

        state.uploadedFileIds = state.uploadedFileIds.filter(
          (id) => !deletedFileIds.includes(id)
        );

        // clear loaded Ids

        state.fileIds = state.fileIds.filter(
          (id) => !deletedFileIds.includes(id)
        );

        state.files.allIds = Object.keys(state.files.byId).map((id) =>
          parseInt(id, 10)
        );
      }
    );
  },
  /* eslint-enable no-param-reassign */
});

export type { ProcessState as ProcessReducerState };
export { initialState as processReducerInitialState };

export const {
  setProcessFileIds,
  removeJobById,
  setSelectedDetectionModels,
  hideFileMetadata,
  showFileMetadata,
  setFocusedFileId,
  setUnsavedDetectionModelSettings,
  setDetectionModelParameters,
  revertDetectionModelParameters,
  resetDetectionModelParameters,
  setCustomModelName,
  addToAvailableDetectionModels,
  setProcessViewFileUploadModalVisibility,
  setSelectFromExploreModalVisibility,
  setSummaryModalVisibility,
  setSortKey,
  setReverse,
  setCurrentPage,
  setPageSize,
  setCurrentView,
  setMapTableTabKey,
  addProcessUploadedFileId,
  clearUploadedFiles,
  setIsLoading,
} = processSlice.actions;

export default processSlice.reducer;
