/*!
 * Copyright 2024 Cognite AS
 */
import { useMemo } from 'react';
import { usePointCloudAnnotationCache } from '../../components/CacheProvider/CacheProvider';
import { type TypedReveal3DModel } from '../../components/Reveal3DResources/types';
import { isDefined } from '../../utilities/isDefined';
import { type PointCloudAnnotationMappedAssetData } from '../types';
import { useModelIdRevisionIdFromModelOptions } from '../useModelIdRevisionIdFromModelOptions';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { queryKeys } from '../../utilities/queryKeys';
import { fetchAnnotationsForModel } from './fetchAnnotationsForModel';
import { EMPTY_ARRAY } from '../../utilities/constants';

export const usePointCloudAnnotationMappingsForAssetIds = (
  models: TypedReveal3DModel[],
  assetIds: Array<string | number> | undefined
): UseQueryResult<PointCloudAnnotationMappedAssetData[]> => {
  const pointCloudAnnotationCache = usePointCloudAnnotationCache();
  const addClassicModelOptionsResults = useModelIdRevisionIdFromModelOptions(models);

  const classicModelOptions = useMemo(
    () => addClassicModelOptionsResults.map((result) => result.data).filter(isDefined),
    [addClassicModelOptionsResults]
  );

  return useQuery({
    queryKey: [
      queryKeys.pointCloudAnnotationForAssetIds(
        classicModelOptions.map((model) => `${model.modelId}/${model.revisionId}`).sort(),
        assetIds
          ?.filter((assetId) => isDefined(assetId))
          .map((assetId) => assetId.toString())
          .sort() ?? []
      )
    ],
    queryFn: async () => {
      const allAnnotationMappingsPromisesResult = await Promise.all(
        classicModelOptions.map(async (model) => {
          const result = await fetchAnnotationsForModel(
            model.modelId,
            model.revisionId,
            assetIds,
            pointCloudAnnotationCache
          );
          return result ?? EMPTY_ARRAY;
        })
      );
      return allAnnotationMappingsPromisesResult.flat();
    },
    staleTime: Infinity,
    enabled: assetIds !== undefined && assetIds.length > 0
  });
};
