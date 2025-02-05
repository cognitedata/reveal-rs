/*!
 * Copyright 2024 Cognite AS
 */

import {
  type CognitePointCloudModel,
  type DataSourceType,
  isDMPointCloudModel,
  isClassicPointCloudModel,
  type AddModelOptions,
  type ClassicDataSourceType
} from '@cognite/reveal';
import { useMemo } from 'react';
import { EMPTY_ARRAY } from '../../../utilities/constants';
import { isDM3DModelIdentifier } from '../typeGuards';

type MatchedPointCloudModel = {
  viewerModel: CognitePointCloudModel<DataSourceType>;
  model: AddModelOptions<ClassicDataSourceType>;
};

export function useMatchedPointCloudModels(
  viewerModels: Array<CognitePointCloudModel<DataSourceType>>,
  classicModelOptions: Array<AddModelOptions<ClassicDataSourceType>>
): MatchedPointCloudModel[] {
  return useMemo(() => {
    return viewerModels.flatMap((viewerModel) => {
      if (viewerModel.type !== 'pointcloud') {
        return EMPTY_ARRAY;
      }
      const model = viewerModel;
      const matchedModel = classicModelOptions.find((modelOption) => {
        if (isDMPointCloudModel(model) && isDM3DModelIdentifier(modelOption)) {
          return (
            model.modelIdentifier.revisionExternalId === modelOption.revisionExternalId &&
            model.modelIdentifier.revisionSpace === modelOption.revisionSpace
          );
        } else if (isClassicPointCloudModel(model)) {
          return (
            model.modelIdentifier.modelId === modelOption.modelId &&
            model.modelIdentifier.revisionId === modelOption.revisionId
          );
        }
        return false;
      });
      return matchedModel !== undefined ? [{ viewerModel, model: matchedModel }] : EMPTY_ARRAY;
    });
  }, [viewerModels, classicModelOptions]);
}
