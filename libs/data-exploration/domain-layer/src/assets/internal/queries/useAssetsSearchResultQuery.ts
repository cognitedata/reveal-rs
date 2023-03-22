import { useAssetsListQuery } from '@data-exploration-lib/domain-layer';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from '@data-exploration-lib/domain-layer';
import { useMemo } from 'react';
import {
  mapFiltersToAssetsAdvancedFilters,
  mapInternalFilterToAssetFilter,
  mapTableSortByToAssetSortFields,
} from '../transformers';
import { TableSortBy } from '@data-exploration-lib/domain-layer';
import { UseInfiniteQueryOptions } from 'react-query';
import { InternalAssetFilters } from '@data-exploration-lib/core';

export const useAssetsSearchResultQuery = (
  {
    query,
    assetFilter = {},
    sortBy,
  }: {
    query?: string;
    assetFilter: InternalAssetFilters;
    sortBy?: TableSortBy[];
  },
  options?: UseInfiniteQueryOptions
) => {
  const advancedFilter = useMemo(
    () => mapFiltersToAssetsAdvancedFilters(assetFilter, query),
    [assetFilter, query]
  );

  const filter = useMemo(
    () => mapInternalFilterToAssetFilter(assetFilter),
    [assetFilter]
  );

  const sort = useMemo(() => mapTableSortByToAssetSortFields(sortBy), [sortBy]);

  return useAssetsListQuery(
    {
      filter,
      advancedFilter,
      sort,
      limit: DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
    },
    {
      ...options,
      keepPreviousData: true,
    }
  );
};
