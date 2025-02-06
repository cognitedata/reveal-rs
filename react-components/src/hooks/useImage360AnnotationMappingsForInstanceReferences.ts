/*!
 * Copyright 2024 Cognite AS
 */

import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  type Image360AnnotationAssetInfo,
  type Image360AnnotationModel
} from '../components/CacheProvider/types';
import { useImage360AnnotationCache } from '../components/CacheProvider/CacheProvider';
import { getAssetIdKeyForImage360Annotation } from '../components/CacheProvider/utils';
import { type InstanceReference } from '../utilities/instanceIds';
import { createInstanceReferenceKey } from '../utilities/instanceIds/toKey';
import { isDefined } from '../utilities/isDefined';

export type Image360AnnotationDataResult = {
  siteId: string;
  annotationModel: Image360AnnotationModel[];
};

export const useImage360AnnotationMappingsForInstanceReferences = (
  assetIds: InstanceReference[] | undefined,
  siteIds: string[] | undefined
): UseQueryResult<Image360AnnotationAssetInfo[]> => {
  const image360AnnotationCache = useImage360AnnotationCache();

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'image360-annotations-info',
      ...(assetIds
        ?.filter((assetId) => isDefined(assetId))
        .map((assetId) => assetId.toString())
        .sort() ?? []),
      ...(siteIds?.map((siteId) => siteId).sort() ?? [])
    ],
    queryFn: async () => {
      if (
        assetIds === undefined ||
        assetIds.length === 0 ||
        siteIds === undefined ||
        siteIds.length === 0
      ) {
        return [];
      }
      const assetIdSet = new Set(assetIds.map(createInstanceReferenceKey));

      const annotationAssetInfo = await image360AnnotationCache.getReveal360Annotations(siteIds);
      const filteredAnnotationAssetInfo = annotationAssetInfo.filter((annotationInfo) => {
        const annotationAssetKey = getAssetIdKeyForImage360Annotation(
          annotationInfo.assetAnnotationImage360Info.annotationInfo
        );

        return annotationAssetKey !== undefined && assetIdSet.has(annotationAssetKey);
      });
      return filteredAnnotationAssetInfo;
    },
    staleTime: Infinity,
    enabled: assetIds !== undefined && siteIds !== undefined
  });
};
