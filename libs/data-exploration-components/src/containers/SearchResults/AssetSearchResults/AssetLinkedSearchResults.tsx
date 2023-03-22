import { Asset } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';
import { MetadataFilterV2 } from '@data-exploration-components/components';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import { TableSortBy } from '@data-exploration-components/components/Table';
import { AssetTable } from '@data-exploration-components/containers/Assets';
import { transformNewFilterToOldFilter } from '@data-exploration-lib/domain-layer';
import { useAssetsSearchResultQuery } from '@data-exploration-lib/domain-layer';
import React, { useMemo, useState } from 'react';
import { PreviewFilterDropdown } from '@data-exploration-components/components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from '@data-exploration-components/components/PreviewFilter/PreviewFilter';
import { useDebounce } from 'use-debounce';
import { convertResourceType } from '@data-exploration-components/types';
import { useResourceResults } from '../SearchResultLoader';
import {
  InternalAssetFilters,
  InternalCommonFilters,
} from '@data-exploration-lib/core';

interface Props {
  enableAdvancedFilter?: boolean;
  defaultFilter: InternalCommonFilters;
  onClick: (item: Asset) => void;
}

const LinkedAssetFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalAssetFilters;
  onFilterChange: (newValue: InternalAssetFilters) => void;
}) => {
  const { data: items = [] } = useList<any>('assets', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <PreviewFilterDropdown>
      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={(newValue) => onFilterChange({ metadata: newValue })}
      />
    </PreviewFilterDropdown>
  );
};

export const AssetLinkedSearchResults: React.FC<Props> = ({
  enableAdvancedFilter,
  defaultFilter,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalAssetFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const assetFilter = useMemo(() => {
    return {
      ...filter,
      ...defaultFilter,
    };
  }, [filter, defaultFilter]);

  const { data, hasNextPage, fetchNextPage } = useAssetsSearchResultQuery(
    {
      query: debouncedQuery,
      assetFilter,
      sortBy,
    },
    { enabled: enableAdvancedFilter }
  );

  const api = convertResourceType('asset');
  const { canFetchMore, fetchMore, items } = useResourceResults<Asset>(
    api,
    debouncedQuery,
    assetFilter
  );

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  const handleFilterChange = (newValue: InternalAssetFilters) => {
    setFilter((prevState) => ({ ...prevState, ...newValue }));
  };

  return (
    <AssetTable
      id="asset-linked-search-results"
      query={debouncedQuery}
      onRowClick={(asset) => onClick(asset)}
      data={enableAdvancedFilter ? data : items}
      enableSorting={enableAdvancedFilter}
      sorting={sortBy}
      onSort={(props) => setSortBy(props)}
      showLoadButton
      tableSubHeaders={
        <AppliedFiltersTags
          filter={appliedFilters}
          onFilterChange={handleFilterChange}
        />
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          <LinkedAssetFilter
            filter={assetFilter}
            onFilterChange={handleFilterChange}
          />
        </DefaultPreviewFilter>
      }
      hasNextPage={enableAdvancedFilter ? hasNextPage : canFetchMore}
      fetchMore={enableAdvancedFilter ? fetchNextPage : fetchMore}
    />
  );
};
