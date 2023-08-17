import React, { useMemo } from 'react';

import {
  getTableColumns,
  SubCellMatchingLabels,
  SummaryCardWrapper,
  Table,
  ThreeDModelCell,
} from '@data-exploration/components';
import { useAssetsMetadataColumns } from '@data-exploration/containers';
import { SummaryHeader } from '@data-exploration-components/components/SummaryHeader/SummaryHeader';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryHeader/utils';
import { useUniqueCdfItems } from '@data-exploration-components/hooks';
import { ColumnDef } from '@tanstack/react-table';
import noop from 'lodash/noop';
import uniqBy from 'lodash/uniqBy';

import { Asset } from '@cognite/sdk';

import {
  getHiddenColumns,
  InternalSequenceFilters,
  isObjectEmpty,
  isSummaryCardDataCountExceed,
  useDeepMemo,
  useTranslation,
} from '@data-exploration-lib/core';
import {
  AssetWithRelationshipLabels,
  InternalAssetDataWithMatchingLabels,
  useAssetsSearchResultWithLabelsQuery,
  useRelatedAssetsQuery,
} from '@data-exploration-lib/domain-layer';

export const AssetSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick = noop,
  isAdvancedFiltersEnabled = false,
  showAllResultsWithEmptyFilters = false,
  selectedResourceExternalId: resourceExternalId,
  annotationIds = [],
}: {
  query?: string;
  onRowClick?: (row: Asset) => void;
  filter?: InternalSequenceFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  isAdvancedFiltersEnabled?: boolean;
  showAllResultsWithEmptyFilters?: boolean;
  selectedResourceExternalId?: string;
  annotationIds?: number[];
}) => {
  const isQueryEnable = isObjectEmpty(filter as any)
    ? showAllResultsWithEmptyFilters
    : true;

  const { data: annotationList = [] } = useUniqueCdfItems<Asset>(
    'assets',
    annotationIds.map((id) => ({ id })),
    true
  );

  const isAnnotationCountExceed = isSummaryCardDataCountExceed(
    annotationList.length
  );

  const { data: assets, isLoading } = useAssetsSearchResultWithLabelsQuery(
    {
      query,
      assetFilter: filter,
    },
    {
      enabled: isQueryEnable && !isAnnotationCountExceed,
    }
  );

  const isAssetsCountExceed = isSummaryCardDataCountExceed(
    assets.length + annotationList.length
  );

  const { data: relatedData, isLoading: isRelatedDataLoading } =
    useRelatedAssetsQuery({
      resourceExternalId,
      enabled: !isAssetsCountExceed,
    });

  const mergeData = useDeepMemo(
    () => uniqBy([...annotationList, ...assets, ...relatedData], 'id'),
    [annotationList, assets, relatedData]
  );

  const { metadataColumns, setMetadataKeyQuery } = useAssetsMetadataColumns();
  const { t } = useTranslation();
  const tableColumns = getTableColumns(t);

  const columns = useMemo(
    () =>
      [
        tableColumns.name(),
        tableColumns.description(),
        tableColumns.externalId(),
        tableColumns.rootAsset(onRowClick),
        {
          accessorKey: 'id',
          header: t('3D_AVAILABILITY', '3D availability'),
          cell: ({ getValue }) => (
            <ThreeDModelCell assetId={getValue<number>()} />
          ),
          size: 300,
          enableSorting: false,
        },
        tableColumns.created,
        {
          ...tableColumns.labels,
          enableSorting: false,
        },
        tableColumns.source(),
        tableColumns.dataSet,
        ...metadataColumns,
      ] as ColumnDef<AssetWithRelationshipLabels>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns]
  );

  const hiddenColumns = getHiddenColumns(columns, ['name', 'description']);

  const isAssetsLoading =
    isLoading && isQueryEnable && !isAnnotationCountExceed;
  const isRelatedAssetsLoading = isRelatedDataLoading && !isAssetsCountExceed;

  return (
    <SummaryCardWrapper>
      <Table<InternalAssetDataWithMatchingLabels>
        id="asset-summary-table"
        columns={columns}
        hiddenColumns={hiddenColumns}
        data={getSummaryCardItems(mergeData)}
        columnSelectionLimit={2}
        isDataLoading={isAssetsLoading || isRelatedAssetsLoading}
        tableHeaders={
          <SummaryHeader
            icon="Assets"
            title={t('ASSETS', 'Assets')}
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
