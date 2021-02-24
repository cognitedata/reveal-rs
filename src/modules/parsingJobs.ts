import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { createSelector } from 'reselect';
import { callUntilCompleted } from 'helpers/Helpers';
import { RootState } from 'reducers';
import { createPendingAnnotationsFromJob } from 'utils/AnnotationUtils';
import { trackTimedUsage } from 'utils/Metrics';
import { FileInfo, Asset } from '@cognite/sdk';
import sdk from 'sdk-singleton';
import { create as createAnnotations, selectAnnotations } from './annotations';
import { ModelStatus } from './contextualization/models';
import { dataKitItemsSelectorFactory } from './selection';

export const PNID_PARSING_JOB_ID_METADATA_FIELD =
  '__COGNITE_PNID_PARSING_JOB_ID';
export const PNID_METADATA_IDENTIFIER = '__COGNITE_PNID';

const PARSING_JOB_CREATE_STARTED = 'pnid/PARSING_CREATE_STARTED';
const PARSING_JOB_CREATED = 'pnid/PARSING_JOB_CREATED';
const PARSING_JOB_STATUS_UPDATED = 'pnid/PARSING_JOB_STATUS_UPDATED';
const PARSING_JOB_DONE = 'pnid/PARSING_JOB_DONE';
const PARSING_JOB_ERROR = 'pnid/PARSING_JOB_ERROR';
const PARSING_JOB_RESET = 'pnid/PARSING_JOB_RESET';

interface CreateParsingJobStartedAction
  extends Action<typeof PARSING_JOB_CREATE_STARTED> {
  fileId: number;
  dataKitId: string;
}
interface ParsingJobCreatedAction extends Action<typeof PARSING_JOB_CREATED> {
  fileId: number;
  jobId: number;
}
interface ParsingJobStatusUpdatedAction
  extends Action<typeof PARSING_JOB_STATUS_UPDATED> {
  fileId: number;
  jobId: number;
  status: ModelStatus;
}
interface ParsingJobDoneAction extends Action<typeof PARSING_JOB_DONE> {
  fileId: number;
  entities: PnidResponseEntity[];
}
interface ParsingJobErrorAction extends Action<typeof PARSING_JOB_ERROR> {
  fileId: number;
}
interface ParsingJobResetAction extends Action<typeof PARSING_JOB_RESET> {
  fileId: number;
}
type ParsingJobActions =
  | CreateParsingJobStartedAction
  | ParsingJobCreatedAction
  | ParsingJobStatusUpdatedAction
  | ParsingJobDoneAction
  | ParsingJobErrorAction
  | ParsingJobResetAction;

const pnidApiRootPath = (project: string) =>
  `/api/playground/projects/${project}/context/pnid`;
const createPnidDetectJobPath = (project: string) =>
  `${pnidApiRootPath(project)}/detect`;
const getPnidDetectJobPath = (project: string, jobId: number) =>
  `${pnidApiRootPath(project)}/detect/${jobId}`;

const documentApiRootPath = (project: string) =>
  `/api/playground/projects/${project}/context/documents`;
const createDocParsingJobPath = (project: string) =>
  `${documentApiRootPath(project)}/detect`;
const getDocParsingStatusPath = (project: string, jobId: number) =>
  `${documentApiRootPath(project)}/detect/${jobId}`;

type DocumentDetectJobSchema = {
  fileId: number;
  entities: string[];
};

type PnidParsingJobSchema = {
  fileId: number;
  entities: string[];
};

export const startPnidParsingJob = (
  file: FileInfo,
  entities: string[],
  options: { partialMatch: boolean; grayscale: boolean; minTokens: number },
  assetsDataKitId: string,
  filesDataKitId: string
) => {
  return async (
    dispatch: ThunkDispatch<any, any, ParsingJobActions>,
    getState: () => RootState
  ): Promise<number | undefined> => {
    const getAssets = dataKitItemsSelectorFactory(assetsDataKitId, true);
    const getFiles = dataKitItemsSelectorFactory(filesDataKitId, true);
    const onFail = () => {
      dispatch({ type: PARSING_JOB_ERROR, fileId: file.id });
      timer.stop({ success: false });
    };

    const { jobStarted, dataKitId: oldJobDataSetId } =
      getState().fileContextualization.parsingJobs[file.id] || {};

    if (jobStarted && assetsDataKitId === oldJobDataSetId) {
      return getState().fileContextualization.parsingJobs[file.id].jobId;
    }

    dispatch({
      type: PARSING_JOB_CREATE_STARTED,
      fileId: file.id,
      dataKitId: assetsDataKitId,
    });

    const timer = trackTimedUsage('Contextualization.PnidParsing.ParsingJob', {
      fileId: file.id,
    });

    const response = await sdk.post(createPnidDetectJobPath(sdk.project), {
      data: {
        fileId: file.id,
        entities,
        ...options,
      } as PnidParsingJobSchema,
    });
    try {
      const {
        status: httpStatus,
        data: { jobId, status: queueStatus },
      } = response;

      dispatch({ type: PARSING_JOB_CREATED, jobId, fileId: file.id });
      dispatch({
        type: PARSING_JOB_STATUS_UPDATED,
        jobId,
        status: queueStatus,
        fileId: file.id,
      });

      if (httpStatus === 200) {
        return await new Promise((resolve, reject) => {
          callUntilCompleted(
            () => sdk.get(getPnidDetectJobPath(sdk.project, jobId)),
            (data) => data.status === 'Completed' || data.status === 'Failed',
            async (data) => {
              if (data.status === 'Failed') {
                onFail();
                reject();
              } else {
                // completed
                const state = getState();

                // load all entities to match to
                const assets = getAssets(state) as Asset[];
                const files = getFiles(state) as FileInfo[];

                // load all existing annotations
                const existingAnnotations = selectAnnotations(state)(
                  file.id,
                  true
                );

                // generate valid annotations
                const pendingAnnotations = await createPendingAnnotationsFromJob(
                  file,
                  data.items,
                  assets,
                  files,
                  `${jobId!}`,
                  existingAnnotations
                );

                // create and finish the job
                await dispatch(createAnnotations(file, pendingAnnotations));

                await dispatch({
                  type: PARSING_JOB_DONE,
                  jobId,
                  fileId: file.id,
                  entities: data.items,
                });

                resolve(jobId);

                timer.stop({ success: true, jobId });
              }
            },
            (data) => {
              dispatch({
                type: PARSING_JOB_STATUS_UPDATED,
                jobId,
                status: data.status,
                fileId: file.id,
              });
            },
            undefined,
            3000
          );
        });
      }
    } catch {
      onFail();
      return undefined;
    }
    onFail();
    return undefined;
  };
};
export const resetPnidParsingJobs = (assetsDataKitId: string) => {
  return async (
    dispatch: ThunkDispatch<any, any, ParsingJobActions>,
    getState: () => RootState
  ): Promise<void> => {
    const parsingJobs: ParsingJobStore =
      getState().fileContextualization.parsingJobs || {};

    Object.keys(parsingJobs)
      .map(Number)
      .map(
        (fileId: number) =>
          parsingJobs[fileId].dataKitId === assetsDataKitId &&
          dispatch({
            type: PARSING_JOB_RESET,
            fileId,
          })
      );
  };
};

export const startDocumentParsingJob = (
  file: FileInfo,
  entities: string[],
  assetsDataKitId: string,
  filesDataKitId: string
) => {
  return async (
    dispatch: ThunkDispatch<any, any, ParsingJobActions>,
    getState: () => RootState
  ): Promise<number | undefined> => {
    const onFail = () => {
      dispatch({ type: PARSING_JOB_ERROR, fileId: file.id });
      timer.stop({ success: false });
    };

    const { jobStarted, dataKitId: oldJobDataSetId } =
      getState().fileContextualization.parsingJobs[file.id] || {};

    if (jobStarted && assetsDataKitId === oldJobDataSetId) {
      return getState().fileContextualization.parsingJobs[file.id].jobId;
    }

    const getAssets = dataKitItemsSelectorFactory(assetsDataKitId, true);
    const getFiles = dataKitItemsSelectorFactory(filesDataKitId, true);

    dispatch({
      type: PARSING_JOB_CREATE_STARTED,
      fileId: file.id,
      dataKitId: assetsDataKitId,
    });

    const timer = trackTimedUsage(
      'Contextualization.DocumentContextualization.ParsingJob',
      {
        fileId: file.id,
      }
    );

    const response = await sdk.post(createDocParsingJobPath(sdk.project), {
      data: {
        fileId: file.id,
        entities,
      } as DocumentDetectJobSchema,
    });
    try {
      const {
        status: httpStatus,
        data: { jobId, status: queueStatus },
      } = response;

      dispatch({ type: PARSING_JOB_CREATED, jobId, fileId: file.id });
      dispatch({
        type: PARSING_JOB_STATUS_UPDATED,
        jobId,
        status: queueStatus,
        fileId: file.id,
      });

      if (httpStatus === 200) {
        return await new Promise((resolve, reject) => {
          callUntilCompleted(
            () => sdk.get(getDocParsingStatusPath(sdk.project, jobId)),
            (data) => data.status === 'Completed' || data.status === 'Failed',
            async (data) => {
              if (data.status === 'Failed') {
                onFail();
                reject();
              } else {
                // completed
                const state = getState();

                // load all entities to match to
                const assetsData = getAssets(state) as Asset[];

                const filesData = getFiles(state) as FileInfo[];

                // load all existing annotations
                const existingAnnotations = selectAnnotations(state)(
                  file.id,
                  true
                );
                const flattenedEntities: Array<any> = data.items
                  .map((el: any) =>
                    Object.values(el.matches).map((value: any) => {
                      return { ...value, page: el.page } as PnidResponseEntity;
                    })
                  )
                  .flat(1);

                // generate valid annotations
                const pendingAnnotations = await createPendingAnnotationsFromJob(
                  file,
                  flattenedEntities,
                  assetsData,
                  filesData,
                  `${jobId!}`,
                  existingAnnotations
                );

                // create and finish the job
                await dispatch(createAnnotations(file, pendingAnnotations));

                await dispatch({
                  type: PARSING_JOB_DONE,
                  jobId,
                  fileId: file.id,
                  entities: data.items,
                });

                resolve(jobId);

                timer.stop({ success: true, jobId });
              }
            },
            (data) => {
              dispatch({
                type: PARSING_JOB_STATUS_UPDATED,
                jobId,
                status: data.status,
                fileId: file.id,
              });
            },
            undefined,
            3000
          );
        });
      }
    } catch {
      onFail();
      return undefined;
    }
    onFail();
    return undefined;
  };
};

export interface PnidResponseEntity {
  text: string;
  boundingBox: { xMin: number; xMax: number; yMin: number; yMax: number };
  page?: number;
}

export interface ParsingJobState {
  jobStarted: boolean;
  jobId?: number;
  jobStatus: ModelStatus;
  jobDone: boolean;
  jobError: boolean;
  dataKitId: string;
  annotations?: PnidResponseEntity[];
}

type Actions = ParsingJobActions;

export interface ParsingJobStore {
  [fileId: number]: ParsingJobState;
}

const initialStore: ParsingJobStore = {};

export const parsingJobsReducer = (
  state: ParsingJobStore = initialStore,
  action: Actions
): ParsingJobStore => {
  switch (action.type) {
    case PARSING_JOB_CREATED: {
      return {
        ...state,
        [action.fileId]: {
          ...state[action.fileId],
          jobId: action.jobId,
        },
      };
    }
    case PARSING_JOB_CREATE_STARTED: {
      return {
        ...state,
        [action.fileId]: {
          jobStarted: true,
          jobStatus: 'Queued',
          jobDone: false,
          jobError: false,
          dataKitId: action.dataKitId,
        },
      };
    }
    case PARSING_JOB_STATUS_UPDATED: {
      return {
        ...state,
        [action.fileId]: {
          ...state[action.fileId],
          jobStatus: action.status,
        },
      };
    }
    case PARSING_JOB_DONE: {
      return {
        ...state,
        [action.fileId]: {
          ...state[action.fileId],
          jobDone: true,
          annotations: action.entities,
        },
      };
    }
    case PARSING_JOB_ERROR: {
      return {
        ...state,
        [action.fileId]: {
          ...state[action.fileId],
          jobDone: true,
          jobError: true,
        },
      };
    }
    case PARSING_JOB_RESET: {
      const next = state;
      delete next[action.fileId];
      return next;
    }

    default: {
      return state;
    }
  }
};

export const makeNumPnidParsingJobSelector = createSelector(
  (state: RootState) => state.fileContextualization.parsingJobs,
  (parsingJobs) => (fileIds: number[]) => {
    const jobIds = new Set(Object.keys(parsingJobs));
    return fileIds.filter((fileId) => jobIds.has(`${fileId}`)).length;
  }
);

export const selectParsingJobForFileId = createSelector(
  (state: RootState) => state.fileContextualization.parsingJobs,
  (jobMap) => (fileId: number) => {
    return jobMap[fileId];
  }
);
