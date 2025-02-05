/*!
 * Copyright 2023 Cognite AS
 */
import { useMemo } from 'react';
import {
  type NodeItem,
  type FdmSDK,
  type Source,
  type InstanceFilter,
  type SimpleSource
} from '../data-providers/FdmSDK';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type DataSourceType, type AddModelOptions } from '@cognite/reveal';
import { isEqual, uniq, chunk } from 'lodash';
import { type Fdm3dDataProvider } from '../data-providers/Fdm3dDataProvider';
import { removeEmptyProperties } from '../utilities/removeEmptyProperties';
import { getModelKeys } from '../utilities/getModelKeys';
import { useFdm3dDataProvider } from '../components/CacheProvider/CacheProvider';
import { type AddImage360CollectionDatamodelsOptions } from '../components/Reveal3DResources/types';

export type InstancesWithView = { view: Source; instances: NodeItem[] };

export const useSearchMappedEquipmentFDM = (
  query: string,
  viewsToSearch: SimpleSource[],
  models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
  instancesFilter: InstanceFilter | undefined,
  limit: number = 100
): UseQueryResult<InstancesWithView[]> => {
  if (limit > 1000) {
    throw new Error('Limit cannot be greater than 1000');
  }

  const fdmSdk = useFdmSdk();
  const fdmDataProvider = useFdm3dDataProvider();

  const spacesToSearch = useMemo(
    () => uniq(viewsToSearch.map((view) => view.space)),
    [viewsToSearch]
  );
  const modelKeys = useMemo(() => getModelKeys(models), [models]);

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'search-mapped-fdm',
      query,
      modelKeys,
      viewsToSearch,
      instancesFilter,
      limit
    ],
    queryFn: async () => {
      if (models.length === 0) {
        return [];
      }
      const sources = createSourcesFromViews(viewsToSearch);
      const chunkedSources = chunk(sources, 10);
      if (chunkedSources.length === 0) {
        chunkedSources.push([]);
      }

      const queryResults: InstancesWithView[] = [];

      for (const sourceChunk of chunkedSources) {
        const chunkResult = await searchNodesWithViewsAndModels(
          query,
          spacesToSearch,
          sourceChunk,
          models,
          instancesFilter,
          fdmSdk,
          fdmDataProvider,
          limit
        );
        queryResults.push(...chunkResult);
      }

      return queryResults;
    },
    staleTime: Infinity
  });
};

const searchNodesWithViewsAndModels = async (
  query: string,
  spacesToSearch: string[],
  sourcesToSearch: Source[],
  models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
  instancesFilter: InstanceFilter | undefined,
  fdmSdk: FdmSDK,
  fdmDataProvider: Fdm3dDataProvider,
  limit: number = 100
): Promise<InstancesWithView[]> => {
  if (query === '') {
    const nodeItems = await fdmDataProvider.listMappedFdmNodes(
      models,
      sourcesToSearch,
      instancesFilter,
      limit
    );
    const transformedResults = convertQueryNodeItemsToSearchResultsWithViews(nodeItems);

    const combinedWithOtherViews = sourcesToSearch.map((view) => ({
      view,
      instances:
        transformedResults.find(
          (result) => result.view.externalId === view.externalId && result.view.space === view.space
        )?.instances ?? []
    }));

    return combinedWithOtherViews;
  }

  const searchResults: InstancesWithView[] = [];

  for (const view of sourcesToSearch) {
    const result = await fdmSdk.searchInstances(view, query, 'node', limit, instancesFilter);

    searchResults.push({
      view,
      instances: result.instances
    });
  }

  return await fdmDataProvider.filterNodesByMappedTo3d(searchResults, models, spacesToSearch);
};

export const useAllMappedEquipmentFDM = (
  models: AddModelOptions[],
  viewsToSearch: SimpleSource[]
): UseQueryResult<NodeItem[]> => {
  const fdmDataProvider = useFdm3dDataProvider();

  return useQuery({
    queryKey: ['reveal', 'react-components', 'all-mapped-equipment-fdm', viewsToSearch, models],
    queryFn: async () => {
      const viewSources = createSourcesFromViews(viewsToSearch);

      return await fdmDataProvider.listAllMappedFdmNodes(models, viewSources, undefined);
    },
    staleTime: Infinity
  });
};

function convertQueryNodeItemsToSearchResultsWithViews(
  queryItems: NodeItem[]
): InstancesWithView[] {
  return queryItems.reduce<InstancesWithView[]>((acc, fdmNode) => {
    const cleanedNode = removeEmptyProperties(fdmNode);

    Object.keys(cleanedNode.properties).forEach((nodeViewSpace) => {
      const currentSpaceProperties = cleanedNode.properties[nodeViewSpace];

      const fdmNodeView = Object.keys(currentSpaceProperties)
        .find((key) => !isEqual(currentSpaceProperties[key], {}))
        ?.split('/');

      if (fdmNodeView === undefined || fdmNodeView.length !== 2) {
        return acc;
      }

      const fdmNodeViewExternalId = fdmNodeView[0];
      const fdmNodeViewVersion = fdmNodeView[1];

      const currentSearchResultWithView = acc.find(
        (searchResultsWithView) =>
          searchResultsWithView.view.externalId === fdmNodeViewExternalId &&
          searchResultsWithView.view.space === nodeViewSpace
      );

      if (currentSearchResultWithView === undefined) {
        acc.push({
          view: {
            space: nodeViewSpace,
            externalId: fdmNodeViewExternalId,
            version: fdmNodeViewVersion,
            type: 'view'
          },
          instances: [cleanedNode]
        });
        return acc;
      }

      currentSearchResultWithView.instances.push(cleanedNode);
    });

    return acc;
  }, []);
}

function createSourcesFromViews(viewsToSearch: SimpleSource[]): Source[] {
  return viewsToSearch.map((view) => ({
    ...view,
    type: 'view'
  }));
}
