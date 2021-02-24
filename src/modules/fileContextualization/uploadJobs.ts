import { Action } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import { callUntilCompleted } from 'helpers/Helpers';
import { RootState } from 'reducers';
import { trackTimedUsage } from 'utils/Metrics';
import { FileUploadResponse } from '@cognite/sdk';
import sdk from 'sdk-singleton';
import GCSUploader from 'components/GCSUploader';
import {
  CogniteAnnotation,
  summarizeAssetIdsFromAnnotations,
} from '@cognite/annotations';
import { itemSelector as fileSelector } from 'modules/files';
import { itemSelector as assetSelector } from 'modules/assets';
import { itemSelector as timeseriesSelector } from 'modules/timeseries';
import { itemSelector as sequenceSelector } from 'modules/sequences';
import { createSelector } from 'reselect';
import * as UploadJobs from './uploadJobs';
import { itemSelector } from '../files';
import { ModelStatus } from '../contextualization/models';

const UPLOAD_JOB_CREATE_STARTED = 'pnid/UPLOAD_JOB_CREATE_STARTED';
const UPLOAD_JOB_CREATED = 'pnid/UPLOAD_JOB_CREATED';
const UPLOAD_JOB_STATUS_UPDATED = 'pnid/UPLOAD_JOB_STATUS_UPDATED';
const UPLOAD_JOB_DONE = 'pnid/UPLOAD_JOB_DONE';
const UPLOAD_JOB_ERROR = 'pnid/UPLOAD_JOB_ERROR';

interface CreateUploadJobStartedAction
  extends Action<typeof UPLOAD_JOB_CREATE_STARTED> {
  fileId: number;
}
interface UploadJobCreatedAction extends Action<typeof UPLOAD_JOB_CREATED> {
  fileId: number;
  jobId: number;
}
interface UploadJobStatusUpdatedAction
  extends Action<typeof UPLOAD_JOB_STATUS_UPDATED> {
  fileId: number;
  jobId: number;
  status: ModelStatus;
}
interface UploadJobDoneAction extends Action<typeof UPLOAD_JOB_DONE> {
  fileId: number;
  svgUrl: string;
}
interface UploadJobErrorAction extends Action<typeof UPLOAD_JOB_ERROR> {
  fileId: number;
}

type UploadJobActions =
  | CreateUploadJobStartedAction
  | UploadJobCreatedAction
  | UploadJobStatusUpdatedAction
  | UploadJobDoneAction
  | UploadJobErrorAction;

const apiRootPath = (project: string) =>
  `/api/playground/projects/${project}/context/pnid`;
const createConvertJobPath = (project: string) =>
  `${apiRootPath(project)}/convert`;
const createConvertStatusPath = (project: string, jobid: number) =>
  `${apiRootPath(project)}/convert/${jobid}`;

export const downloadFile = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok.');
  }
  const blob = await response.blob();
  return blob;
};

const addLabelsToAnnotations = (
  annotations: CogniteAnnotation[],
  getState: () => RootState
): CogniteAnnotation[] => {
  const annotationLabel = (annotation: CogniteAnnotation) => {
    switch (annotation.resourceType) {
      case 'asset': {
        const asset = assetSelector(getState())(
          annotation.resourceExternalId || annotation.resourceId
        );
        return asset?.name;
      }
      case 'file': {
        const file = fileSelector(getState())(
          annotation.resourceExternalId || annotation.resourceId
        );
        return file?.name;
      }
      case 'timeSeries': {
        const timeseries = timeseriesSelector(getState())(
          annotation.resourceExternalId || annotation.resourceId
        );
        return timeseries?.name;
      }
      case 'event':
        return `event id ${annotation.id}`;
      case 'sequence': {
        const sequence = sequenceSelector(getState())(
          annotation.resourceExternalId || annotation.resourceId
        );
        return sequence?.name;
      }
      default:
        return undefined;
    }
  };
  return annotations.map((annotation) => {
    const label = annotationLabel(annotation) || annotation.label || 'No label';
    return {
      ...annotation,
      label,
    } as CogniteAnnotation;
  });
};

export const startConvertFileToSvgJob = (
  fileId: number,
  annotations: CogniteAnnotation[]
) => {
  return async (
    dispatch: ThunkDispatch<any, any, UploadJobActions>,
    getState: () => RootState
  ) => {
    const file = itemSelector(getState())(fileId);

    if (!file) {
      return Promise.resolve(undefined);
    }

    const { jobStarted } =
      getState().fileContextualization.uploadJobs[fileId] || {};

    if (jobStarted) {
      return Promise.resolve(
        getState().fileContextualization.uploadJobs[fileId].jobId
      );
    }

    const timer = trackTimedUsage('Contextualization.PnidParsing.UploadJob', {
      fileId,
    });
    const { grayscale } = getState().fileContextualization.pnidOption;

    const annotationsWithLabels = addLabelsToAnnotations(annotations, getState);

    dispatch({ type: UPLOAD_JOB_CREATE_STARTED, fileId });
    return new Promise((resolve, reject) => {
      sdk
        .post(createConvertJobPath(sdk.project), {
          data: {
            fileId,
            items: annotationsWithLabels.map((el) => ({
              text: el.label,
              boundingBox: el.box,
            })),
            grayscale,
          },
        })
        .then((response) => {
          const {
            status: httpStatus,
            data: { jobId, status: queueStatus },
          } = response;
          dispatch({ type: UPLOAD_JOB_CREATED, jobId, fileId });
          dispatch({
            type: UPLOAD_JOB_STATUS_UPDATED,
            jobId,
            status: queueStatus,
            fileId,
          });

          if (httpStatus === 200) {
            callUntilCompleted(
              () => sdk.get(createConvertStatusPath(sdk.project, jobId)),
              (data) => data.status === 'Completed' || data.status === 'Failed',
              async (data) => {
                if (data.status === 'Failed') {
                  dispatch({
                    type: UPLOAD_JOB_ERROR,
                    fileId,
                  });
                  reject();
                } else {
                  try {
                    const svg = await UploadJobs.downloadFile(data.svgUrl);
                    const [item] = summarizeAssetIdsFromAnnotations(
                      annotations
                    );
                    const assetIds = item ? item.assetIds : [];
                    const newName =
                      file.name.lastIndexOf('.') !== 0
                        ? file.name.substr(0, file.name.lastIndexOf('.'))
                        : file.name;
                    const newFile = await sdk.files.upload(
                      {
                        externalId: `processed-${fileId}`,
                        name: `Processed-${newName}.svg`,
                        mimeType: 'image/svg+xml',
                        assetIds: [
                          ...new Set(
                            (file.assetIds || []).concat([...assetIds])
                          ),
                        ],
                        metadata: {
                          original_file_id: `${file.id}`,
                        },
                      },
                      undefined,
                      true
                    );
                    const uploader = await GCSUploader(
                      svg,
                      (newFile as FileUploadResponse).uploadUrl!
                    );
                    await uploader.start();
                    await dispatch({
                      type: UPLOAD_JOB_DONE,
                      jobId,
                      fileId,
                      svgUrl: data.svgUrl,
                    });
                    resolve(jobId);

                    timer.stop({ success: true, jobId });
                  } catch {
                    dispatch({ type: UPLOAD_JOB_ERROR, fileId });
                    reject();
                    timer.stop({ success: false, jobId });
                  }
                }
              },
              (data) => {
                dispatch({
                  type: UPLOAD_JOB_STATUS_UPDATED,
                  jobId,
                  status: data.status,
                  fileId,
                });
              },
              undefined,
              3000
            );
          } else {
            dispatch({ type: UPLOAD_JOB_ERROR, fileId });
            reject();
            timer.stop({ success: false, jobId });
          }
        })
        .catch(() => {
          dispatch({ type: UPLOAD_JOB_ERROR, fileId });
          reject();
          timer.stop({ success: false });
        });
    });
  };
};

export interface UploadJobState {
  jobStarted: boolean;
  jobId?: number;
  jobStatus: ModelStatus;
  jobDone: boolean;
  jobError: boolean;
  svgUrl?: string;
}

type Actions = UploadJobActions;

export interface UploadJobsStore {
  [fileId: number]: UploadJobState;
}

const initialPnIDState: UploadJobsStore = {};

export const uploadJobsReducer = (
  state: UploadJobsStore = initialPnIDState,
  action: Actions
): UploadJobsStore => {
  switch (action.type) {
    case UPLOAD_JOB_CREATED: {
      return {
        ...state,
        [action.fileId]: {
          ...state[action.fileId],
          jobId: action.jobId,
        },
      };
    }
    case UPLOAD_JOB_CREATE_STARTED: {
      return {
        ...state,
        [action.fileId]: {
          jobStarted: true,
          jobStatus: 'Queued',
          jobDone: false,
          jobError: false,
        },
      };
    }
    case UPLOAD_JOB_DONE: {
      return {
        ...state,
        [action.fileId]: {
          ...state[action.fileId],
          jobStarted: false,
          jobDone: true,
          svgUrl: action.svgUrl,
        },
      };
    }
    case UPLOAD_JOB_STATUS_UPDATED: {
      return {
        ...state,
        [action.fileId]: {
          ...state[action.fileId],
          jobStatus: action.status,
        },
      };
    }
    case UPLOAD_JOB_ERROR: {
      return {
        ...state,
        [action.fileId]: {
          ...state[action.fileId],
          jobStarted: false,
          jobDone: true,
          jobError: true,
        },
      };
    }

    default: {
      return state;
    }
  }
};

export const makeNumPnidUploadJobSelector = createSelector(
  (state: RootState) => state.fileContextualization.uploadJobs,
  (uploadJobs) => (fileIds: number[]) => {
    const jobIds = new Set(Object.keys(uploadJobs));
    return fileIds.filter((fileId) => jobIds.has(`${fileId}`)).length;
  }
);

export const stuffForUnitTests = {
  initialPnIDState,
  downloadFile,
  UPLOAD_JOB_CREATE_STARTED,
  UPLOAD_JOB_CREATED,
  UPLOAD_JOB_STATUS_UPDATED,
  UPLOAD_JOB_DONE,
  UPLOAD_JOB_ERROR,
};
