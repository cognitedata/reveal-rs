/*!
 * Copyright 2023 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import {
  type NodeDefinition,
  type Asset,
  type AssetMapping3D,
  type CogniteClient,
  type ListResponse
} from '@cognite/sdk';
import {
  type UseInfiniteQueryResult,
  useInfiniteQuery,
  type InfiniteData,
  useQuery,
  type UseQueryResult
} from '@tanstack/react-query';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { getAssetsList } from '../hooks/network/getAssetsList';
import { isDefined } from '../utilities/isDefined';
import { type InstancesWithView, useSearchMappedEquipmentFDM } from './useSearchMappedEquipmentFDM';
import { COGNITE_ASSET_SOURCE, type SimpleSource } from '../data-providers';
import { useMemo } from 'react';
import { type ModelWithAssetMappings } from '../hooks/cad/ModelWithAssetMappings';

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

export type CoreAssetWithModelAndMappings = {
  model: AddModelOptions;
  asset: NodeDefinition;
  mappings: AssetMapping3D[];
};

const defaultViewsToSearch: SimpleSource = {
  space: COGNITE_ASSET_SOURCE.space,
  externalId: COGNITE_ASSET_SOURCE.externalId,
  version: COGNITE_ASSET_SOURCE.version
};

export const useSearchMappedEquipmentAssetMappingsClassic = (
  query: string,
  models: AddModelOptions[],
  limit: number = 100,
  assetMappingList: ModelWithAssetMappings[],
  isAssetMappingNodesFetched: boolean,
  userSdk?: CogniteClient
): UseInfiniteQueryResult<InfiniteData<AssetPage>, Error> => {
  const sdk = useSDK(userSdk);

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
      ...mapped3dAssetIds.values(),
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

export const useSearchMappedEquipmentAssetMappingsHybrid = (
  query: string,
  viewsToSearch: SimpleSource[],
  models: AddModelOptions[],
  limit: number = 100,
  assetMappingList: ModelWithAssetMappings[],
  isAssetMappingNodesFetched: boolean
): UseQueryResult<InstancesWithView[], Error> => {
  const mapped3dCDMAssetIdentifiers = useMemo(() => {
    if (assetMappingList === undefined) return new Set<number>();
    return new Set(
      assetMappingList.flatMap((mapping) =>
        mapping.assetMappings.map((assetMapping) => assetMapping.assetInstanceId)
      )
    );
  }, [assetMappingList]);

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'search-mapped-core-assets',
      query,
      limit,
      ...mapped3dCDMAssetIdentifiers.values(),
      ...models.map((model) => [model.modelId, model.revisionId])
    ],
    queryFn: async () => {
      if (query === '' || assetMappingList === undefined) {
        return [];
      }

      const { data: searchData } = useSearchMappedEquipmentFDM(
        query,
        viewsToSearch,
        models,
        undefined,
        100
      );
      return searchData;
    },
    staleTime: Infinity,
    enabled:
      isAssetMappingNodesFetched && assetMappingList !== undefined && assetMappingList.length > 0
  });
};

export const useAllMappedEquipmentAssetMappingsClassic = (
  models: AddModelOptions[],
  userSdk?: CogniteClient,
  limit: number = 1000
): UseInfiniteQueryResult<InfiniteData<ModelMappingsWithAssets[]>, Error> => {
  const sdk = useSDK(userSdk);

  return useInfiniteQuery({
    queryKey: [
      'reveal',
      'react-components',
      'all-mapped-equipment-asset-mappings-classic',
      limit,
      ...models.map((model) => [model.modelId, model.revisionId])
    ],
    queryFn: async ({ pageParam }) => {
      const mappedAssetsClassic = await fetchAllMappedEquipmentAssetMappingsClassic(
        sdk,
        models,
        pageParam
      );
      return mappedAssetsClassic;
    },
    initialPageParam: models.map((model) => ({ cursor: 'start', model })),
    staleTime: Infinity,
    getNextPageParam
  });
};

export const useAllMappedEquipmentAssetMappingsHybrid = (
  models: AddModelOptions[],
  limit: number = 1000,
  assetMappingList: ModelWithAssetMappings[],
  userSdk?: CogniteClient
): UseQueryResult<CoreAssetWithModelAndMappings[]> => {
  const sdk = useSDK(userSdk);

  const assetsFromHybridMappings = useMemo(() => {
    return assetMappingList.flatMap((mapping) =>
      mapping.assetMappings.map((item) => item.assetInstanceId)
    );
  }, [assetMappingList]).filter(isDefined);

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'all-mapped-equipment-asset-mappings-hybrid',
      limit,
      ...models.map((model) => [model.modelId, model.revisionId]),
      assetMappingList.map((mapping) => mapping.assetMappings.map((item) => item.assetId)),
      assetsFromHybridMappings.map((asset) => [asset.space, asset.externalId])
    ],
    queryFn: async () => {
      const viewToSearch = defaultViewsToSearch;
      const mappedHybridAssets = await fetchAllMappedEquipmentAssetMappingsHybrid({
        sdk,
        viewToSearch,
        assetMappingList
      });

      return mappedHybridAssets;
    },
    staleTime: Infinity
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

const fetchAllMappedEquipmentAssetMappingsHybrid = async ({
  sdk,
  viewToSearch,
  assetMappingList
}: {
  sdk: CogniteClient;
  viewToSearch?: SimpleSource | undefined;
  assetMappingList: ModelWithAssetMappings[];
}): Promise<CoreAssetWithModelAndMappings[]> => {
  const filteredViewsToSearch = viewToSearch ?? defaultViewsToSearch;
  const instances = assetMappingList.flatMap((mapping) =>
    mapping.assetMappings.map((item) => item.assetInstanceId).filter(isDefined)
  );

  if (instances.length === 0) return [];

  const allEquipment = await sdk.instances.retrieve({
    sources: [
      {
        source: {
          externalId: filteredViewsToSearch.externalId,
          space: filteredViewsToSearch.space,
          type: 'view',
          version: filteredViewsToSearch.version
        }
      }
    ],
    items: instances.map((instance) => ({
      instanceType: 'node',
      space: instance.space,
      externalId: instance.externalId
    }))
  });

  const modelsWithCoreAssetsAndMappings: CoreAssetWithModelAndMappings[] = [];

  assetMappingList.forEach((mapping) => {
    allEquipment?.items.forEach((equipment) => {
      if (equipment.instanceType !== 'node') return;

      const mappingsFound = mapping.assetMappings.filter(
        (item) =>
          item.assetInstanceId?.externalId === equipment.externalId &&
          item.assetInstanceId?.space === equipment.space
      );
      if (mappingsFound.length > 0) {
        const assetNode: NodeDefinition = {
          space: equipment.space,
          externalId: equipment.externalId,
          instanceType: 'node',
          properties: equipment.properties ?? {},
          version: equipment.version,
          createdTime: equipment.createdTime,
          lastUpdatedTime: equipment.lastUpdatedTime
        };

        modelsWithCoreAssetsAndMappings.push({
          model: mapping.model,
          asset: assetNode,
          mappings: mappingsFound
        });
      }
    });
  });

  return modelsWithCoreAssetsAndMappings;
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

        const filterQueryHybrid = {
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

        const mappingsHybrid = await sdk.assetMappings3D.filter(
          model.modelId,
          model.revisionId,
          filterQueryHybrid
        );

        const allMappings = mappingsClassic.items.concat(mappingsHybrid.items);
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
