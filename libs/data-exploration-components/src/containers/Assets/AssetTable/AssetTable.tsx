import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import {
  Table,
  TableProps,
} from '@data-exploration-components/components/Table/Table';
import { RelationshipLabels } from '@data-exploration-components/types';

import { useGetHiddenColumns } from '@data-exploration-components/hooks';

import { InternalAssetDataWithMatchingLabels } from '@data-exploration-lib/domain-layer';
import { SubCellMatchingLabels } from '../../../components/Table/components/SubCellMatchingLabel';

import { ThreeDModelCell } from './ThreeDModelCell';
import noop from 'lodash/noop';

import { useAssetsMetadataColumns } from '../hooks/useAssetsMetadataColumns';

export type AssetWithRelationshipLabels = RelationshipLabels &
  InternalAssetDataWithMatchingLabels;

const visibleColumns = ['name', 'rootId'];
export const AssetTable = ({
  onRowClick = noop,
  data,
  query,
  ...rest
}: Omit<TableProps<AssetWithRelationshipLabels>, 'columns'>) => {
  const { metadataColumns, setMetadataKeyQuery } = useAssetsMetadataColumns();

  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name(),
          enableHiding: false,
        },
        Table.Columns.description(),
        Table.Columns.externalId(),
        Table.Columns.rootAsset((rootAsset) => onRowClick(rootAsset)),
        {
          accessorKey: 'id',
          header: '3D availability',
          cell: ({ getValue }) => (
            <ThreeDModelCell assetId={getValue<number>()} />
          ),
          size: 300,
          enableSorting: false,
        },
        Table.Columns.created,
        {
          ...Table.Columns.labels,
          enableSorting: false,
        },
        Table.Columns.source(),
        { ...Table.Columns.dataSet, enableSorting: true },
        ...metadataColumns,
      ] as ColumnDef<AssetWithRelationshipLabels>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [metadataColumns, query]
  );

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return (
    <Table<InternalAssetDataWithMatchingLabels>
      data={data || []}
      columns={columns}
      onRowClick={onRowClick}
      hiddenColumns={hiddenColumns}
      renderCellSubComponent={SubCellMatchingLabels}
      onChangeSearchInput={setMetadataKeyQuery}
      {...rest}
    />
  );
};
