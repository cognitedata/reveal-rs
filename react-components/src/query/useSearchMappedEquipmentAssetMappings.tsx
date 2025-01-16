/*!
 * Copyright 2023 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import {
  type Asset,
  type AssetMapping3D,
  type CogniteClient,
  type ListResponse
} from '@cognite/sdk';
import {
  type UseInfiniteQueryResult,
  useInfiniteQuery,
  type InfiniteData
} from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { getAssetsList } from '../hooks/network/getAssetsList';
import { isDefined } from '../utilities/isDefined';
import { useAssetMappedNodesForRevisions } from '../hooks/cad';
import { useMemo } from 'react';

export type ModelMappings = {
  model: AddModelOptions;
  mappings: ListResponse<AssetMapping3D[]>;
};

export type ModelMappingsWithAssets = ModelMappings & {
  assets: Asset[];
};

export type AssetPage = {
  assets: Asset[];
  nextCursor: string | undefined;
};

export type ModelAssetPage = {
  modelsAssets: ModelMappingsWithAssets[];
  nextCursor: string | undefined;
};

export const useSearchMappedEquipmentAssetMappings = (
  query: string,
  models: AddModelOptions[],
  limit: number = 100,
  userSdk?: CogniteClient
): UseInfiniteQueryResult<InfiniteData<AssetPage>, Error> => {
  const sdk = useSDK(userSdk);
  const { data: assetMappingList, isFetched: isAssetMappingNodesFetched } =
    useAssetMappedNodesForRevisions(models.map((model) => ({ ...model, type: 'cad' })));

  const mapped3dAssetIds = useMemo(() => {
    if (assetMappingList === undefined) return new Set<number>();
    return new Set(
      assetMappingList.flatMap((mapping) =>
        mapping.assetMappings.map((assetMapping) => assetMapping.assetId)
      )
    );
  }, [assetMappingList]);

  const queryKey = useMemo(
    () => [
      'reveal',
      'react-components',
      'search-mapped-asset-mappings',
      query,
      ...models.map((model) => [model.modelId, model.revisionId])
    ],
    [query, models]
  );

  const fetchAssets = async (
    cursor: string | undefined,
    accumulatedAssets: Asset[],
    mappedSearchedAssetIds: Set<number>
  ): Promise<{ assets: Asset[]; nextCursor: string | undefined }> => {
    const searchedAssetsResponse = await getAssetsList(sdk, {
      query,
      limit: 1000,
      cursor
    });

    const filteredSearchedAssets = searchedAssetsResponse.items.filter(isDefined);
    const filteredMappedSearchedAssets = filteredSearchedAssets.filter(
      (asset) => mapped3dAssetIds.has(asset.id) && !mappedSearchedAssetIds.has(asset.id)
    );

    accumulatedAssets.push(...filteredMappedSearchedAssets);

    if (accumulatedAssets.length >= limit || searchedAssetsResponse.nextCursor === undefined) {
      return { assets: accumulatedAssets, nextCursor: searchedAssetsResponse.nextCursor };
    }

    filteredMappedSearchedAssets.forEach((asset) => {
      mappedSearchedAssetIds.add(asset.id);
    });

    return await fetchAssets(
      searchedAssetsResponse.nextCursor,
      accumulatedAssets,
      mappedSearchedAssetIds
    );
  };

  return useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      if (query === '' || assetMappingList === undefined) {
        return { assets: [], nextCursor: undefined };
      }
      const mappedSearchedAssetIds = new Set<number>();

      const { assets, nextCursor } = await fetchAssets(pageParam, [], mappedSearchedAssetIds);

      return {
        assets,
        nextCursor
      };
    },
    initialPageParam: undefined,
    staleTime: Infinity,
    getNextPageParam: (_lastPage, allPages) => {
      const lastPageData = allPages[allPages.length - 1];
      return lastPageData.nextCursor;
    },
    enabled:
      isAssetMappingNodesFetched && assetMappingList !== undefined && assetMappingList.length > 0
  });
};

export const useAllMappedEquipmentAssetMappings = (
  models: AddModelOptions[],
  userSdk?: CogniteClient,
  limit: number = 1000
): UseInfiniteQueryResult<InfiniteData<ModelMappingsWithAssets[]>, Error> => {
  const sdk = useSDK(userSdk);

  return useInfiniteQuery({
    queryKey: [
      'reveal',
      'react-components',
      'all-mapped-equipment-asset-mappings',
      limit,
      ...models.map((model) => [model.modelId, model.revisionId])
    ],
    queryFn: async ({ pageParam }) => {
      const mappedAssetsClassic = fetchAllMappedEquipmentAssetMappingsClassic(
        sdk,
        models,
        pageParam
      );

      const mappedAssetsCoreDms = fetchAllMappedEquipmentAssetMappingsCoreDms(
        sdk,
        models,
        pageParam
      );

      const allMappedAssets = await Promise.all([mappedAssetsClassic, mappedAssetsCoreDms]);

      return allMappedAssets.flat();
    },
    initialPageParam: models.map((model) => ({ cursor: 'start', model })),
    staleTime: Infinity,
    getNextPageParam
  });
};

const fetchAllMappedEquipmentAssetMappingsClassic = async (
  sdk: CogniteClient,
  models: AddModelOptions[],
  pageParam: Array<{
    cursor: string | undefined;
    model: AddModelOptions;
  }>
): Promise<ModelMappingsWithAssets[]> => {
  const currentPagesOfAssetMappingsClassicPromises = models.map(async (model) => {
    const nextCursors = pageParam as Array<{
      cursor: string | 'start' | undefined;
      model: AddModelOptions;
    }>;
    const nextCursor = nextCursors.find(
      (nextCursor) =>
        nextCursor.model.modelId === model.modelId &&
        nextCursor.model.revisionId === model.revisionId
    )?.cursor;
    if (nextCursor === undefined) {
      return { mappings: { items: [] }, model };
    }

    const filterQueryClassic = {
      cursor: nextCursor === 'start' ? undefined : nextCursor,
      limit: 1000
    };

    const mappings = await sdk.assetMappings3D.filter(
      model.modelId,
      model.revisionId,
      filterQueryClassic
    );

    return { mappings, model };
  });

  const currentPagesOfAssetMappingsClassic = await Promise.all(
    currentPagesOfAssetMappingsClassicPromises
  );

  const modelsAssets = await getAssetsFromAssetMappings(sdk, currentPagesOfAssetMappingsClassic);

  return modelsAssets;
};

const fetchAllMappedEquipmentAssetMappingsCoreDms = async (
  sdk: CogniteClient,
  models: AddModelOptions[],
  pageParam: Array<{
    cursor: string | undefined;
    model: AddModelOptions;
  }>
): Promise<ModelMappingsWithAssets[]> => {
  const currentPagesOfAssetMappingsCoreDmsPromises = models.map(async (model) => {
    const nextCursors = pageParam as Array<{
      cursor: string | 'start' | undefined;
      model: AddModelOptions;
    }>;
    const nextCursor = nextCursors.find(
      (nextCursor) =>
        nextCursor.model.modelId === model.modelId &&
        nextCursor.model.revisionId === model.revisionId
    )?.cursor;
    if (nextCursor === undefined) {
      return { mappings: { items: [] }, model };
    }

    const filterQueryCoreDms = {
      cursor: nextCursor === 'start' ? undefined : nextCursor,
      limit: 1000,
      getDmsInstances: true
    };

    const mappings = await sdk.assetMappings3D.filter(
      model.modelId,
      model.revisionId,
      filterQueryCoreDms
    );

    return { mappings, model };
  });

  const currentPagesOfAssetMappingsCoreDms = await Promise.all(
    currentPagesOfAssetMappingsCoreDmsPromises
  );

  const modelsAssets = await getAssetsFromAssetMappingsCoreDms(
    sdk,
    currentPagesOfAssetMappingsCoreDms
  );

  return modelsAssets;
};

export const useMappingsForAssetIds = (
  models: AddModelOptions[],
  assetIds: number[]
): UseInfiniteQueryResult<InfiniteData<ModelMappingsWithAssets[]>, Error> => {
  const sdk = useSDK();

  return useInfiniteQuery({
    queryKey: [
      'reveal',
      'react-components',
      'mappings-for-asset-ids',
      ...models.map((model) => [model.modelId, model.revisionId]),
      ...assetIds
    ],
    queryFn: async ({ pageParam }) => {
      const currentPagesOfAssetMappingsPromises = models.map(async (model) => {
        const nextCursors = pageParam as Array<{
          cursor: string | 'start' | undefined;
          model: AddModelOptions;
        }>;

        const nextCursor = nextCursors.find(
          (nextCursor) =>
            nextCursor.model.modelId === model.modelId &&
            nextCursor.model.revisionId === model.revisionId
        )?.cursor;

        if (nextCursor === undefined || assetIds.length === 0) {
          return { mappings: { items: [] }, model };
        }

        const filterQueryClassic = {
          cursor: nextCursor === 'start' ? undefined : nextCursor,
          limit: 1000,
          filter: { assetIds }
        };

        const filterQueryCoreDms = {
          cursor: nextCursor === 'start' ? undefined : nextCursor,
          limit: 1000,
          filter: { assetIds },
          getDmsInstances: true
        };

        const mappingsClassic = await sdk.assetMappings3D.filter(
          model.modelId,
          model.revisionId,
          filterQueryClassic
        );

        const mappingsCoreDms = await sdk.assetMappings3D.filter(
          model.modelId,
          model.revisionId,
          filterQueryCoreDms
        );

        const allMappings = mappingsClassic.items.concat(mappingsCoreDms.items);
        return { mappings: { items: allMappings }, model };
      });

      const currentPagesOfAssetMappings = await Promise.all(currentPagesOfAssetMappingsPromises);

      const modelsAssets = await getAssetsFromAssetMappings(sdk, currentPagesOfAssetMappings);

      return modelsAssets;
    },
    initialPageParam: models.map((model) => ({ cursor: 'start', model })),
    staleTime: Infinity,
    getNextPageParam
  });
};

function getNextPageParam(
  lastPage: ModelMappingsWithAssets[]
): Array<{ cursor: string | undefined; model: AddModelOptions }> | undefined {
  const nextCursors = lastPage
    .map(({ mappings, model }) => ({ cursor: mappings.nextCursor, model }))
    .filter((mappingModel) => mappingModel.cursor !== undefined);
  if (nextCursors.length === 0) {
    return undefined;
  }
  return nextCursors;
}

async function getAssetsFromAssetMappings(
  sdk: CogniteClient,
  modelsMappings: Array<{ model: AddModelOptions; mappings: ListResponse<AssetMapping3D[]> }>
): Promise<ModelMappingsWithAssets[]> {
  const mappingsWithAssetsPromises = modelsMappings.map(async ({ mappings, model }) => {
    if (mappings.items.length === 0) {
      return { model, assets: [], mappings };
    }

    const deduplicatedAssetIds = Array.from(
      new Set(mappings.items.map((mapping) => mapping.assetId))
    );
    const assetIdObjects = deduplicatedAssetIds.map((id) => ({ id }));

    const assets = await sdk.assets.retrieve(assetIdObjects, { ignoreUnknownIds: true });

    return { model, assets, mappings };
  });

  const mappingsWithAssets = await Promise.all(mappingsWithAssetsPromises);

  return mappingsWithAssets;
}

async function getAssetsFromAssetMappingsCoreDms(
  sdk: CogniteClient,
  modelsMappings: Array<{ model: AddModelOptions; mappings: ListResponse<AssetMapping3D[]> }>
): Promise<ModelMappingsWithAssets[]> {
  return [] as ModelMappingsWithAssets[];
}
