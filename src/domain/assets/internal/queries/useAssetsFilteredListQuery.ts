import { useAssetsListQuery } from 'domain/assets/service/queries/useAssetsListQuery';
import { DEFAULT_GLOBAL_TABLE_RESULT_LIMIT } from 'domain/constants';
import { useMemo } from 'react';
import { mapFiltersToAssetsAdvancedFilters } from '../transformers/mapFiltersToAssetsAdvancedFilters';
import { mapInternalFilterToAssetFilter } from '../transformers/mapInternalFilterToAssetFilter';
import { mapTableSortByToAssetSortFields } from '../transformers/mapTableSortByToAssetSortFields';
import { InternalAssetFilters } from '../types';
import { TableSortBy } from 'components/ReactTable/V2';

export const useAssetsFilteredListQuery = ({
  assetFilter,
  sortBy,
}: {
  query?: string;
  assetFilter: InternalAssetFilters;
  sortBy: TableSortBy[];
}) => {
  const advancedFilter = useMemo(
    () => mapFiltersToAssetsAdvancedFilters(assetFilter),
    [assetFilter]
  );

  const filter = useMemo(
    () => mapInternalFilterToAssetFilter(assetFilter),
    [assetFilter]
  );

  const sort = useMemo(() => mapTableSortByToAssetSortFields(sortBy), [sortBy]);

  return useAssetsListQuery({
    filter,
    advancedFilter,
    sort,
    limit: DEFAULT_GLOBAL_TABLE_RESULT_LIMIT,
  });
};
