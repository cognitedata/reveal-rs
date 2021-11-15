import { createSelector, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import {
  AnnotationJob,
  ParamsObjectDetection,
  ParamsOCR,
  ParamsTagDetection,
  VisionAPIType,
} from 'src/api/types';
import { getFakeQueuedJob } from 'src/api/utils';
import { AnnotationsBadgeStatuses } from 'src/modules/Common/types';
import { clearFileState, fileProcessUpdate } from 'src/store/commonActions';
import isEqual from 'lodash-es/isEqual';
import { DEFAULT_PAGE_SIZE } from 'src/constants/PaginationConsts';
import { RootState } from 'src/store/rootReducer';
import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { postAnnotationJob } from 'src/store/thunks/Process/PostAnnotationJob';
import { createFileInfo } from 'src/store/util/StateUtils';
import { GenericSort, SorterNames } from 'src/modules/Common/Utils/SortUtils';
import {
  createGenericTabularDataSlice,
  GenericTabularState,
} from 'src/store/genericTabularDataSlice';
import { useSelector } from 'react-redux';
import { selectAllSelectedIds } from 'src/modules/Common/store/filesSlice';

export type JobState = AnnotationJob & {
  fileIds: number[];
};
export type State = GenericTabularState & {
  fileIds: number[];
  showFileUploadModal: boolean;
  selectedDetectionModels: Array<VisionAPIType>;
  error?: string;
  files: {
    byId: Record<number, { jobIds: number[] }>;
    allIds: number[];
  };
  uploadedFileIds: number[];
  jobs: {
    byId: Record<number, JobState>;
    allIds: number[];
  };
  detectionModelParameters: {
    ocr: ParamsOCR;
    tagDetection: ParamsTagDetection;
    objectDetection: ParamsObjectDetection;
  };
  temporaryDetectionModelParameters: {
    ocr: ParamsOCR;
    tagDetection: ParamsTagDetection;
    objectDetection: ParamsObjectDetection;
  };
  showExploreModal: boolean;
  showSummaryModal: boolean;
};

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
};

const initialState: State = {
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
  selectedDetectionModels: [VisionAPIType.OCR],
  error: undefined,
  files: {
    byId: {},
    allIds: [],
  },
  uploadedFileIds: [],
  jobs: {
    byId: {},
    allIds: [],
  },
  detectionModelParameters: initialDetectionModelParameters,
  temporaryDetectionModelParameters: initialDetectionModelParameters,
  showExploreModal: false,
  showSummaryModal: false,
};

/* eslint-disable no-param-reassign */
const processSlice = createGenericTabularDataSlice({
  name: 'processSlice',
  initialState: initialState as State,
  reducers: {
    setProcessFileIds(state, action: PayloadAction<number[]>) {
      state.fileIds = action.payload;
    },
    setSelectedDetectionModels(
      state,
      action: PayloadAction<Array<VisionAPIType>>
    ) {
      state.selectedDetectionModels = action.payload;
    },
    setParamsOCR(state, action: PayloadAction<ParamsOCR>) {
      state.temporaryDetectionModelParameters.ocr = action.payload;
    },
    setParamsTagDetection(state, action: PayloadAction<ParamsTagDetection>) {
      state.temporaryDetectionModelParameters.tagDetection = action.payload;
    },
    setParamsObjectDetection(
      state,
      action: PayloadAction<ParamsObjectDetection>
    ) {
      state.temporaryDetectionModelParameters.objectDetection = action.payload;
    },
    setDetectionModelParameters(state) {
      state.detectionModelParameters = state.temporaryDetectionModelParameters;
    },

    revertDetectionModelParameters(state) {
      state.temporaryDetectionModelParameters = state.detectionModelParameters;
    },
    resetDetectionModelParameters(state) {
      state.temporaryDetectionModelParameters = initialDetectionModelParameters;
    },
    removeJobById(state, action: PayloadAction<number>) {
      const existingJob = state.jobs.byId[action.payload];
      if (existingJob) {
        const { fileIds } = existingJob;
        fileIds.forEach((id) => {
          const file = state.files.byId[id];
          if (file && file.jobIds.includes(action.payload)) {
            state.files.byId[id].jobIds = file.jobIds.filter(
              (jid) => jid !== action.payload
            );
          }
        });
      }
      delete state.jobs.byId[action.payload];
      state.files.allIds = Object.keys(state.files.byId).map((id) =>
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
      const { fileIds, job, modelType } = payload;
      addJobToState(state, fileIds, job, modelType);
    });

    /* postAnnotationJobs */

    builder.addCase(postAnnotationJob.pending, (state, { meta }) => {
      const { fileIds, modelType } = meta.arg;

      addJobToState(
        state,
        fileIds,
        { ...getFakeQueuedJob(modelType), type: modelType },
        modelType
      );
    });

    builder.addCase(postAnnotationJob.fulfilled, (state, { payload, meta }) => {
      const newJob = payload;
      const { fileIds, modelType } = meta.arg;
      addJobToState(state, fileIds, newJob, modelType);
    });

    builder.addCase(postAnnotationJob.rejected, (state, { error, meta }) => {
      const { fileIds, modelType } = meta.arg;
      const queuedJob = state.jobs.byId[getFakeQueuedJob(modelType).jobId];

      if (queuedJob) {
        // remove or update queued job
        fileIds.forEach((id) => {
          const file = state.files.byId[id];
          if (file && file.jobIds.includes(queuedJob.jobId)) {
            state.files.byId[id].jobIds = file.jobIds.filter(
              (jid) => jid !== queuedJob.jobId
            );
          }
        });

        const filteredFileIds = queuedJob.fileIds.filter(
          (fid) => !fileIds.includes(fid)
        );
        state.jobs.byId[queuedJob.jobId].fileIds = filteredFileIds;

        if (!filteredFileIds.length) {
          delete state.jobs.byId[queuedJob.jobId];
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
              delete state.jobs.byId[jobId];
              state.jobs.allIds = Object.keys(state.jobs.byId).map((id) =>
                parseInt(id, 10)
              );
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

export const {
  setProcessFileIds,
  removeJobById,
  setSelectedDetectionModels,
  hideFileMetadata,
  showFileMetadata,
  setFocusedFileId,
  setParamsOCR,
  setParamsTagDetection,
  setParamsObjectDetection,
  setDetectionModelParameters,
  revertDetectionModelParameters,
  resetDetectionModelParameters,
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

const addJobToState = (
  state: State,
  fileIds: number[],
  job: AnnotationJob,
  modelType: VisionAPIType
) => {
  /* eslint-disable  no-param-reassign */
  const jobState: JobState = { ...job, fileIds, type: modelType };
  const existingJob = state.jobs.byId[job.jobId];
  if (!existingJob || !isEqual(jobState, existingJob)) {
    if (existingJob) {
      // for fake queued state
      const fileIdSet = new Set(existingJob.fileIds);
      jobState.fileIds.forEach((item) => fileIdSet.add(item));
      jobState.fileIds = Array.from(fileIdSet);
    }
    state.jobs.byId[job.jobId] = jobState;
    state.jobs.allIds = Object.keys(state.jobs.byId).map((id) =>
      parseInt(id, 10)
    );
  }
  if (!existingJob) {
    jobState.fileIds.forEach((fileId) => {
      if (!state.files.byId[fileId]) {
        state.files.byId[fileId] = { jobIds: [] };
      }
      const fileState = state.files.byId[fileId];
      // if jobid with same model type exists replace the job id with new job
      const fileJobIds = fileState.jobIds;

      const existingJobTypes = fileJobIds.map((id) => state.jobs.byId[id].type);
      if (!fileJobIds.includes(jobState.jobId)) {
        const indexOfExistingJobWithSameModelType = existingJobTypes.findIndex(
          (type) => type === jobState.type
        );
        if (indexOfExistingJobWithSameModelType >= 0) {
          fileJobIds.splice(indexOfExistingJobWithSameModelType, 1);
        }
        fileJobIds.push(jobState.jobId);
      }
    });
    state.files.allIds = Object.keys(state.files.byId).map((id) =>
      parseInt(id, 10)
    );
  }
  /* eslint-enable  no-param-reassign */
};

// selectors

export const selectAllFilesDict = (
  state: State
): { [id: number]: { jobIds: number[] } } => state.files.byId;

export const selectAllJobs = (state: State): { [id: number]: JobState } =>
  state.jobs.byId;

export const selectJobIdsByFileId = (state: State, fileId: number): number[] =>
  state.files.byId[fileId]?.jobIds || [];

export const selectJobsByFileId = createSelector(
  selectJobIdsByFileId,
  selectAllJobs,
  (fileJobIds, allJobs) => {
    return fileJobIds.map((jid) => allJobs[jid]);
  }
);

export const selectAllJobsForAllFilesDict = createSelector(
  selectAllFilesDict,
  selectAllJobs,
  (allFilesDict, allJobs) => {
    const allJobsAllFilesDict = Object.entries(allFilesDict).map(
      ([fileId, { jobIds }]) => {
        return { fileId, jobs: jobIds.map((jobId) => allJobs[jobId]) };
      }
    );
    return allJobsAllFilesDict;
  }
);

export const selectAllProcessFiles = createSelector(
  (state: RootState) => state.filesSlice.files.byId,
  (state: RootState) => state.processSlice.fileIds,
  (allFiles, allIds) => {
    const files: FileInfo[] = [];
    allIds.forEach(
      (id) => !!allFiles[id] && files.push(createFileInfo(allFiles[id]))
    );
    return files;
  }
);

export const selectIsPollingComplete = createSelector(
  selectAllFilesDict,
  selectAllJobs,
  (allFiles, allJobs) => {
    return Object.keys(allFiles).every((fileId) => {
      const fileJobs = allFiles[parseInt(fileId, 10)].jobIds;
      if (!fileJobs || !fileJobs.length) {
        return true;
      }
      return fileJobs.every((jobId) => {
        const job = allJobs[jobId];
        return job.status === 'Completed' || job.status === 'Failed';
      });
    });
  }
);

export const selectIsProcessingStarted = createSelector(
  (state: State) => state.files.byId,
  (allFiles) => {
    if (Object.keys(allFiles).length) {
      return Object.keys(allFiles).every((fileId) => {
        const fileJobs = allFiles[parseInt(fileId, 10)].jobIds;
        return fileJobs && fileJobs.length;
      });
    }
    return false;
  }
);

export const makeSelectAnnotationStatuses = () =>
  createSelector(selectJobsByFileId, (fileJobs) => {
    const annotationBadgeProps = {
      tag: {},
      gdpr: {},
      text: {},
      objects: {},
    };
    fileJobs.forEach((job) => {
      const statusData = { status: job.status, statusTime: job.statusTime };
      if (job.type === VisionAPIType.OCR) {
        annotationBadgeProps.text = statusData;
      }
      if (job.type === VisionAPIType.TagDetection) {
        annotationBadgeProps.tag = statusData;
      }
      if (job.type === VisionAPIType.ObjectDetection) {
        annotationBadgeProps.objects = statusData;
        annotationBadgeProps.gdpr = statusData;
      }
    });
    return annotationBadgeProps as AnnotationsBadgeStatuses;
  });

export const selectPageCount = createSelector(
  (state: State) => state.fileIds,
  (state: State) => state.sortMeta,
  (fileIds, sortMeta) => {
    return Math.ceil(fileIds.length / sortMeta.pageSize);
  }
);

export const selectProcessSortedFiles = createSelector(
  selectAllProcessFiles,
  (rootState: RootState) => rootState.processSlice.sortMeta.sortKey,
  (rootState: RootState) => rootState.processSlice.sortMeta.reverse,
  GenericSort
);

export const selectProcessSelectedFileIdsInSortedOrder = createSelector(
  selectProcessSortedFiles,
  (rootState: RootState) => selectAllSelectedIds(rootState.filesSlice),
  (sortedFiles, selectedIds) => {
    const indexMap = new Map<number, number>(
      sortedFiles.map((item, index) => [item.id, index])
    );

    const sortedIds = GenericSort(
      selectedIds,
      SorterNames.indexInSortedArray,
      false,
      indexMap
    );

    return sortedIds;
  }
);

export const selectProcessAllSelectedFilesInSortedOrder = createSelector(
  selectProcessSelectedFileIdsInSortedOrder,
  (rootState: RootState) => rootState.filesSlice.files.byId,
  (sortedSelectedFileIds, allFiles) => {
    return sortedSelectedFileIds.map((id) => allFiles[id]);
  }
);

// helpers
export const isProcessingFile = (
  annotationStatuses: AnnotationsBadgeStatuses
) => {
  const statuses = Object.keys(annotationStatuses) as Array<
    keyof AnnotationsBadgeStatuses
  >;
  return statuses.some((key) =>
    ['Queued', 'Running'].includes(annotationStatuses[key]?.status || '')
  );
};

// hooks

export const useIsSelectedInProcess = (id: number) => {
  const selectedIds = useSelector(({ filesSlice }: RootState) =>
    selectAllSelectedIds(filesSlice)
  );
  return selectedIds.includes(id);
};

export const useProcessFilesSelected = () => {
  const selectedIds = useSelector(({ filesSlice }: RootState) =>
    selectAllSelectedIds(filesSlice)
  );
  return !!selectedIds.length;
};
