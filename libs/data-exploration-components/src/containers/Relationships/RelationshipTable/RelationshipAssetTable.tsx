import React from 'react';

import { EmptyState, Table } from '@data-exploration/components';
import { ResultCount } from '@data-exploration-components/components';
import {
  useRelatedResourceResults,
  useRelationshipCount,
} from '@data-exploration-components/hooks';
import { AssetWithRelationshipLabels } from '@data-exploration-lib/domain-layer';
import { ColumnDef } from '@tanstack/react-table';

import { RelationshipTableProps } from './RelationshipTable';

export function RelationshipAssetTable({
  parentResource,
  onItemClicked,
}: Omit<RelationshipTableProps, 'type'>) {
  const { relationshipLabels, relation, externalId, rootAsset, name } =
    Table.Columns;
  const columns = [
    name(),
    relationshipLabels,
    relation,
    externalId(),
    rootAsset((row) => onItemClicked(row.id)),
  ] as ColumnDef<AssetWithRelationshipLabels>[];

  const { hasNextPage, fetchNextPage, isLoading, items } =
    useRelatedResourceResults<AssetWithRelationshipLabels>(
      'relationship',
      'asset',
      parentResource
    );
  const { data: count } = useRelationshipCount(parentResource, 'asset');

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }
  return (
    <Table
      id="relationship-asset-table"
      tableHeaders={<ResultCount api="list" type="asset" count={count} />}
      columns={columns}
      data={items}
      showLoadButton
      fetchMore={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoadingMore={isLoading}
      hideColumnToggle
      onRowClick={(row) => onItemClicked(row.id)}
    />
  );
}
