import React, { useMemo } from 'react';

import {
  SubCellMatchingLabels,
  SummaryCardWrapper,
  Table,
} from '@data-exploration/components';
import { useEventsMetadataColumns } from '@data-exploration/containers';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import {
  getHiddenColumns,
  InternalEventsFilters,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';
import {
  useEventsSearchResultWithLabelsQuery,
  InternalEventDataWithMatchingLabels,
} from '@data-exploration-lib/domain-layer';
import { ColumnDef } from '@tanstack/react-table';
import noop from 'lodash/noop';

import { Asset, CogniteEvent } from '@cognite/sdk';

export const EventSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick = noop,
  onDirectAssetClick = noop,
  isAdvancedFiltersEnabled = false,
}: {
  query?: string;
  filter: InternalEventsFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: CogniteEvent) => void;
  onDirectAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  isAdvancedFiltersEnabled?: boolean;
}) => {
  const eventSearchConfig = useGetSearchConfigFromLocalStorage('event');
  const { data, isLoading } = useEventsSearchResultWithLabelsQuery(
    {
      query,
      eventsFilters: filter,
    },
    eventSearchConfig
  );
  const { metadataColumns, setMetadataKeyQuery } = useEventsMetadataColumns();

  const columns = useMemo(
    () =>
      [
        Table.Columns.type(),
        Table.Columns.subtype(),
        Table.Columns.description(),
        Table.Columns.externalId(),
        Table.Columns.lastUpdatedTime,
        Table.Columns.created,
        Table.Columns.id(),
        Table.Columns.dataSet,
        Table.Columns.startTime,
        Table.Columns.endTime,
        Table.Columns.source(),
        Table.Columns.assets(onDirectAssetClick),
        ...metadataColumns,
      ] as ColumnDef<CogniteEvent>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  );

  const hiddenColumns = getHiddenColumns(columns, ['type', 'description']);

  return (
    <SummaryCardWrapper>
      <Table<InternalEventDataWithMatchingLabels>
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(data)}
        columnSelectionLimit={2}
        id="events-summary-table"
        isDataLoading={isLoading}
        tableHeaders={
          <SummaryHeader
            icon="Events"
            title="Events"
            onAllResultsClick={onAllResultsClick}
          />
        }
        enableColumnResizing={false}
        onRowClick={onRowClick}
        renderCellSubComponent={
          isAdvancedFiltersEnabled ? SubCellMatchingLabels : undefined
        }
        onChangeSearchInput={setMetadataKeyQuery}
      />
    </SummaryCardWrapper>
  );
};
