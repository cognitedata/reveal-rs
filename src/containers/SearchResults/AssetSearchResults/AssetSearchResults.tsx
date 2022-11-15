import React, { useMemo, useState } from 'react';
import { Flex, SegmentedControl } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import { ColumnToggleProps } from 'components/ReactTable/Table';
import {
  AssetTreeTable,
  SearchResultToolbar,
  AssetNewTable,
  useResourceResults,
} from 'containers';
import { convertResourceType, SelectableItemsProps } from 'types';
import { KeepMounted } from '../../../components/KeepMounted/KeepMounted';
import styled from 'styled-components';
import { useAssetsSearchResultQuery } from 'domain/assets/internal/queries/useAssetsFilteredListQuery';
import { InternalAssetFilters } from 'domain/assets/internal/types';
import { TableSortBy } from 'components/ReactTable/V2';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';

export const AssetSearchResults = ({
  query = '',
  filter = {},
  showCount = false,
  onClick,
  isTreeEnabled,
  enableAdvancedFilters,
  activeIds,
  onFilterChange,
  ...extraProps
}: {
  enableAdvancedFilters?: boolean;
  query?: string;
  isTreeEnabled?: boolean;
  showCount?: boolean;
  filter: InternalAssetFilters;
  onClick: (item: Asset) => void;
  activeIds?: (string | number)[];
  onFilterChange?: (newValue: Record<string, unknown>) => void;
} & ColumnToggleProps<Asset> &
  SelectableItemsProps) => {
  const api = convertResourceType('asset');
  const { canFetchMore, fetchMore, items } = useResourceResults<Asset>(
    api,
    query,
    filter
  );

  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const { data, hasNextPage, fetchNextPage } = useAssetsSearchResultQuery({
    query,
    assetFilter: filter,
    sortBy: sortBy,
  });

  const [currentView, setCurrentView] = useState<string>(() =>
    isTreeEnabled ? 'tree' : 'list'
  );

  const { onSelect, selectionMode, isSelected, ...rest } = extraProps;
  const treeProps = { onSelect, selectionMode, isSelected };

  const selectedRows = useMemo(() => {
    if (activeIds) {
      return activeIds.reduce((previousValue, currentValue) => {
        return {
          ...previousValue,
          [currentValue]: true,
        };
      }, {});
    }
  }, [activeIds]);

  const tableHeaders = (
    <StyledTableHeader justifyContent="space-between" alignItems="center">
      <SearchResultToolbar
        showCount={showCount}
        api={query.length > 0 ? 'search' : 'list'}
        type="asset"
        filter={filter}
        query={query}
      />

      {isTreeEnabled ? (
        <Flex alignItems="center" gap={10}>
          <SegmentedControl
            currentKey={currentView}
            onButtonClicked={setCurrentView}
          >
            <SegmentedControl.Button
              icon="Tree"
              key="tree"
              title="Asset hierarchy"
              aria-label="Asset hierarchy"
            />
            <SegmentedControl.Button
              icon="List"
              key="list"
              title="List"
              aria-label="List"
            />
          </SegmentedControl>
          <Divider />
        </Flex>
      ) : null}
    </StyledTableHeader>
  );

  return (
    <>
      <KeepMounted isVisible={currentView === 'list'}>
        <AssetNewTable
          id="asset-search-results"
          onRowClick={asset => onClick(asset)}
          data={enableAdvancedFilters ? data : items}
          enableSorting
          selectedRows={selectedRows}
          scrollIntoViewRow={
            activeIds?.length === 1 && currentView === 'list'
              ? activeIds[0]
              : undefined
          }
          onSort={props => setSortBy(props)}
          showLoadButton
          tableSubHeaders={
            <AppliedFiltersTags
              filter={filter}
              onFilterChange={onFilterChange}
            />
          }
          tableHeaders={currentView === 'list' ? tableHeaders : undefined}
          hasNextPage={enableAdvancedFilters ? hasNextPage : canFetchMore}
          fetchMore={enableAdvancedFilters ? fetchNextPage : fetchMore}
          {...rest}
        />
      </KeepMounted>

      <KeepMounted isVisible={currentView !== 'list'}>
        <AssetTreeTable
          filter={filter}
          query={query}
          onAssetClicked={asset => onClick(asset)}
          tableHeaders={currentView !== 'list' ? tableHeaders : undefined}
          enableAdvancedFilters={enableAdvancedFilters}
          selectedRows={selectedRows}
          tableSubHeaders={
            <AppliedFiltersTags
              filter={filter}
              onFilterChange={onFilterChange}
            />
          }
          scrollIntoViewRow={
            activeIds?.length === 1 && currentView !== 'list'
              ? activeIds[0]
              : undefined
          }
          {...treeProps}
        />
      </KeepMounted>
    </>
  );
};

const StyledTableHeader = styled(Flex)`
  flex: 1;
`;

const Divider = styled.div`
  height: 16px;
  width: 2px;
  background: var(--cogs-border--muted);
`;
