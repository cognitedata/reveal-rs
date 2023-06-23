import { FileIdEither } from '@vision/api/vision/detectionModels/types';
import { ToastUtils } from '@vision/utils/ToastUtils';

import sdk from '@cognite/cdf-sdk-singleton';

import {
  AutoMLDownload,
  AutoMLExportFormat,
  AutoMLModelCore,
  AutoMLModelType,
  AutoMLTrainingJob,
  AutoMLTrainingJobPostRequest,
} from './types';

export class AutoMLAPI {
  public static listAutoMLModels = async (): Promise<AutoMLModelCore[]> => {
    const response = await sdk.get(
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/context/vision/automl/list`
    );

    return response.data?.items || [];
  };

  public static getAutoMLModel = async (
    id: number
  ): Promise<AutoMLTrainingJob> => {
    const response = await sdk.get(
      `${sdk.getBaseUrl()}/api/playground/projects/${
        sdk.project
      }/context/vision/automl/${id}`
    );
    return response.data || {};
  };

  public static downloadAutoMLModel = async (
    id: number,
    exportFormat: AutoMLExportFormat = AutoMLExportFormat.tflite
  ): Promise<AutoMLDownload | undefined> => {
    try {
      const response = await sdk.get(
        `${sdk.getBaseUrl()}/api/playground/projects/${
          sdk.project
        }/context/vision/automl/${id}/download`,
        { params: { exportFormat } }
      );

      return response.data;
    } catch (error) {
      const formatedError = `Could not download model: ${JSON.stringify(
        error,
        null,
        4
      )}`;
      ToastUtils.onFailure(formatedError);
      console.error(formatedError);
    }
    return undefined;
  };

  public static startAutoMLJob = async (
    name: string,
    modelType: AutoMLModelType,
    fileIds: FileIdEither[]
  ): Promise<AutoMLTrainingJobPostRequest | undefined> => {
    const data = {
      data: {
        items: fileIds,
        name,
        modelType,
      },
    };

    try {
      const response = await sdk.post(
        `${sdk.getBaseUrl()}/api/playground/projects/${
          sdk.project
        }/context/vision/automl`,
        data
      );

      return response.data;
    } catch (error) {
      const formattedError = `Could not start the training job, error: ${JSON.stringify(
        error,
        null,
        4
      )}`;
      ToastUtils.onFailure(formattedError);
      console.error(formattedError);
    }
    return undefined;
  };

  public static deleteAutoMLJob = async (
    id: number
  ): Promise<object | undefined> => {
    const data = {
      data: {
        modelJobId: id,
      },
    };

    try {
      const response = await sdk.post(
        `${sdk.getBaseUrl()}/api/playground/projects/${
          sdk.project
        }/context/vision/automl/delete`,
        data
      );

      return response.data;
    } catch (error) {
      const formattedError = `Could not delete model: ${JSON.stringify(
        error,
        null,
        4
      )}`;
      ToastUtils.onFailure(formattedError);
      console.error(formattedError);
    }
    return undefined;
  };
}
