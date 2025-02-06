/*!
 * Copyright 2023 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import { type CadModelOptions } from '../../components/Reveal3DResources/types';
import { type ThreeDModelFdmMappings } from '../types';
import { DEFAULT_QUERY_STALE_TIME } from '../../utilities/constants';
import { useAssetMappingAndNode3DCache } from '../../components/CacheProvider/CacheProvider';
import { useAssetMappedNodesForRevisions } from './useAssetMappedNodesForRevisions';
import { isDefined } from '../../utilities/isDefined';

export const useHybridAssetMappings = (
  hybridFdmAssetExternalIds: DmsUniqueIdentifier[],
  models: CadModelOptions[]
): UseQueryResult<ThreeDModelFdmMappings[]> => {
  const assetMappingAndNode3DCache = useAssetMappingAndNode3DCache();
  const { data: modelWithAssetMappings } = useAssetMappedNodesForRevisions(models);

  const relevantHybridAssetMappings = modelWithAssetMappings?.map((data) => {
    const mappings = data.assetMappings.filter(
      (assetMapping) =>
        assetMapping.assetInstanceId !== undefined &&
        hybridFdmAssetExternalIds.find(
          (id) =>
            id.externalId === assetMapping.assetInstanceId?.externalId &&
            id.space === assetMapping.assetInstanceId?.space
        ) !== undefined
    );
    return {
      model: data.model,
      mappings
    };
  });

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'hybrid-asset-mappings',
      hybridFdmAssetExternalIds.map((id) => `${id.space}/${id.externalId}`).sort(),
      models.map((model) => [model.modelId, model.revisionId])
    ],
    queryFn: async () => {
      const modelAndNodeMapPromises = models.map(async (model) => {
        const mappingsPerModel =
          relevantHybridAssetMappings
            ?.map((data) => {
              if (
                data.model.modelId !== model.modelId &&
                data.model.revisionId !== model.revisionId
              )
                return undefined;
              return data.mappings;
            })
            .flat()
            .filter(isDefined) ?? [];

        const nodeMap = await assetMappingAndNode3DCache.getNodesForAssetInstancesInHybridMappings(
          model.modelId,
          model.revisionId,
          mappingsPerModel
        );
        return { modelId: model.modelId, revisionId: model.revisionId, mappings: nodeMap };
      });

      return await Promise.all(modelAndNodeMapPromises);
    },
    enabled: hybridFdmAssetExternalIds.length > 0 && models.length > 0,
    staleTime: DEFAULT_QUERY_STALE_TIME
  });
};
