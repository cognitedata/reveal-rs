import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { VisionAsset } from 'src/modules/Common/store/files/types';
import { ThunkConfig } from 'src/store/rootReducer';
import {
  VisionJob,
  VisionDetectionModelType,
  TagDetectionJobAnnotation,
  VisionJobRunning,
  VisionJobCompleted,
} from 'src/api/vision/detectionModels/types';

import {
  CDFAnnotationTypeEnum,
  ImageAssetLink,
  Status,
} from 'src/api/annotation/types';
import { SaveAnnotations } from 'src/store/thunks/Annotation/SaveAnnotations';
import { fetchAssets } from 'src/store/thunks/fetchAssets';
import { fileProcessUpdate } from 'src/store/commonActions';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { ToastUtils } from 'src/utils/ToastUtils';
import { convertVisionJobAnnotationToVisionAnnotation } from 'src/api/vision/detectionModels/converters';
import {
  UnsavedVisionAnnotation,
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { isImageAssetLinkData } from 'src/modules/Common/types/typeGuards';
import { VisionModelTypeCDFAnnotationTypeMap } from 'src/utils/visionAnnotationUtils';

const isVisionAnnotationDataTypeList = (
  data: VisionAnnotationDataType | VisionAnnotationDataType[]
): data is VisionAnnotationDataType[] => {
  return (data as VisionAnnotationDataType[]).length !== undefined;
};

const isImageAssetLinkDataList = (
  data: VisionAnnotationDataType | VisionAnnotationDataType[]
): data is ImageAssetLink[] => {
  return (
    isVisionAnnotationDataTypeList(data) &&
    data.every((item) => isImageAssetLinkData(item))
  );
};

const isJobRunningOrCompleted = (
  job: VisionJob
): job is (VisionJobRunning | VisionJobCompleted) & {
  type: VisionDetectionModelType;
} => {
  return (
    !!(
      job as (VisionJobRunning | VisionJobCompleted) & {
        type: VisionDetectionModelType;
      }
    )?.items &&
    !!(
      job as (VisionJobRunning | VisionJobCompleted) & {
        type: VisionDetectionModelType;
      }
    )?.failedItems
  );
};

const getNewFailedFileIds = ({
  job,
  failedFileIds,
}: {
  job: (VisionJobRunning | VisionJobCompleted) & {
    type: VisionDetectionModelType;
  };
  failedFileIds: number[];
}) => {
  // loop failed items (sub jobs) and show error notification for new failed items
  if (job.failedItems && job.failedItems.length) {
    job.failedItems.forEach((failedItem) => {
      if (
        !failedItem.items.every((failedFile) =>
          failedFileIds.includes(failedFile.fileId)
        )
      ) {
        ToastUtils.onFailure(
          `Some files could not be processed: ${failedItem.errorMessage}`
        );
      }
    });
  }

  return (
    job.failedItems
      ?.map((failedJob) =>
        failedJob.items.map((failedFile) => failedFile.fileId)
      )
      .flat()
      .filter((fileId) => !failedFileIds.includes(fileId)) || []
  );
};

export const VisionJobUpdate = createAsyncThunk<
  VisionAnnotation<VisionAnnotationDataType>[],
  {
    job: VisionJob;
    fileIds: number[];
    modelType: VisionDetectionModelType;
  },
  ThunkConfig
>(
  'VisionJobUpdate',
  async ({ job, fileIds, modelType }, { dispatch, getState }) => {
    let savedVisionAnnotation: VisionAnnotation<VisionAnnotationDataType>[] =
      [];

    const jobState = getState().processSlice.jobs;
    const existingJob = jobState.byId[job.jobId];

    if (existingJob && isJobRunningOrCompleted(job)) {
      const { completedFileIds = [], failedFileIds = [] } = existingJob;
      let assetIdMap = new Map<number, VisionAsset>();

      // show error notification for new failed items and get corresponding file ids
      const newFailedFileIds = getNewFailedFileIds({ job, failedFileIds });

      // filter out previously completed files
      const newVisionJobResults =
        job.items?.filter((item) => !completedFileIds.includes(item.fileId)) ||
        [];

      // fetch assets if tag detection
      const isNewTagDetectionJob =
        job.type === VisionDetectionModelType.TagDetection &&
        newVisionJobResults.length;
      if (isNewTagDetectionJob) {
        const jobFilesWithDetectedAnnotations = newVisionJobResults.filter(
          (jobItem) => !!jobItem.annotations.length
        );
        if (jobFilesWithDetectedAnnotations.length) {
          const assetRequests = jobFilesWithDetectedAnnotations.map(
            (jobItem) => {
              const assetIds: number[] = [
                ...new Set(
                  jobItem.annotations
                    .map(
                      (detectedAnnotation) =>
                        (detectedAnnotation as TagDetectionJobAnnotation)
                          ?.assetIds
                    )
                    .filter((item): item is number[] => !!item)
                    .flat()
                ),
              ];

              return dispatch(
                fetchAssets(
                  assetIds.map((id) => ({
                    id,
                  }))
                )
              );
            }
          );
          const assetResponses = await Promise.all(assetRequests);
          const assetUnwrappedResponses = assetResponses.map((assetRes) =>
            unwrapResult(assetRes)
          );
          const assetMapArr = assetUnwrappedResponses.map(
            (assetUnwrappedResponse) =>
              new Map(assetUnwrappedResponse.map((asset) => [asset.id, asset]))
          );
          assetIdMap = assetMapArr.reduce((acc, current) => {
            return new Map([...acc, ...current]);
          });
        }
      }

      // save new prediction results as annotations
      let unsavedAnnotations: UnsavedVisionAnnotation<VisionAnnotationDataType>[] =
        [];
      newVisionJobResults.forEach((results) => {
        const { annotations: jobAnnotations } = results;

        if (jobAnnotations && jobAnnotations.length) {
          const unsavedAnnotationsForFile = jobAnnotations
            .map((item):
              | UnsavedVisionAnnotation<VisionAnnotationDataType>[]
              | UnsavedVisionAnnotation<VisionAnnotationDataType>
              | null => {
              const convertedAnnotations =
                convertVisionJobAnnotationToVisionAnnotation(item, job.type);

              if (!convertedAnnotations) {
                return null;
              }
              if (isImageAssetLinkDataList(convertedAnnotations)) {
                return convertedAnnotations.map((annotation, index) => {
                  const asset = assetIdMap.get(
                    (item as TagDetectionJobAnnotation).assetIds[index]
                  );
                  return {
                    annotationType: CDFAnnotationTypeEnum.ImagesAssetLink,
                    annotatedResourceId: results.fileId,
                    status: Status.Suggested,
                    data: {
                      ...annotation,
                      assetRef: {
                        ...(annotation as ImageAssetLink).assetRef,
                        externalId: asset?.externalId,
                      },
                    },
                  };
                });
              }

              return {
                annotationType: VisionModelTypeCDFAnnotationTypeMap[job.type],
                annotatedResourceId: results.fileId,
                status: Status.Suggested,
                data: convertedAnnotations,
              };
            })
            .filter(
              (
                item
              ): item is UnsavedVisionAnnotation<VisionAnnotationDataType>[] =>
                !!item
            )
            .flat();
          unsavedAnnotations = unsavedAnnotations.concat(
            unsavedAnnotationsForFile
          );
        }
      });

      if (unsavedAnnotations.length) {
        const savedAnnotationResponse = await dispatch(
          SaveAnnotations(unsavedAnnotations)
        );
        savedVisionAnnotation = unwrapResult(savedAnnotationResponse);
      }

      dispatch(
        fileProcessUpdate({
          modelType,
          fileIds,
          job,
          completedFileIds: [
            ...completedFileIds,
            ...newVisionJobResults.map((item) => item.fileId),
          ],
          failedFileIds: [...failedFileIds, ...newFailedFileIds],
        })
      );

      if (newVisionJobResults.length) {
        await dispatch(
          RetrieveAnnotations({
            fileIds: newVisionJobResults.map((item) => item.fileId),
            clearCache: false,
          })
        );
      }
    }
    return savedVisionAnnotation;
  }
);
