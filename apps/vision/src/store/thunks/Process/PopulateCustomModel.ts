import { createAsyncThunk } from '@reduxjs/toolkit';

import { AutoMLTrainingJob } from '../../../api/vision/autoML/types';
import { VisionDetectionModelType } from '../../../api/vision/detectionModels/types';
import {
  addToAvailableDetectionModels,
  BUILT_IN_MODEL_COUNT,
  setDetectionModelParameters,
  setSelectedDetectionModels,
  setUnsavedDetectionModelSettings,
} from '../../../modules/Process/store/slice';
import { ThunkConfig } from '../../rootReducer';

const DEFAULT_THRESHOLD = 0.8;

export const PopulateCustomModel = createAsyncThunk<
  void,
  AutoMLTrainingJob,
  ThunkConfig
>('PopulateProcessFiles', async (model, { getState, dispatch }) => {
  const availableModels = getState().processSlice.availableDetectionModels;
  if (availableModels.length <= BUILT_IN_MODEL_COUNT) {
    dispatch(addToAvailableDetectionModels());
  }
  const availableModelsUpdated =
    getState().processSlice.availableDetectionModels;

  // Set (currently unsaved) configuration
  const modelIndex = availableModelsUpdated.findIndex(
    (item) => item.type === VisionDetectionModelType.CustomModel
  );
  const newParams = {
    modelIndex,
    params: {
      modelJobId: model.jobId,
      threshold: DEFAULT_THRESHOLD,
      modelName: model.name,
      isValid: true,
    },
  };
  dispatch(setUnsavedDetectionModelSettings(newParams));

  // Save configuration and set model selection
  dispatch(setDetectionModelParameters());
  dispatch(setSelectedDetectionModels([VisionDetectionModelType.CustomModel]));
});
