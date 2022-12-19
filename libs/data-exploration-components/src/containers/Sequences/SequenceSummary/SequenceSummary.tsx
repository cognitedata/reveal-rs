import { Sequence } from '@cognite/sdk/dist/src';
import { ColumnDef } from '@tanstack/react-table';
import { useResourceResults } from '@data-exploration-components/containers';
import { InternalSequenceFilters } from '@data-exploration-components/domain/sequence';
import { Table } from '@data-exploration-components/components/Table';
import React, { useMemo } from 'react';
import { convertResourceType } from '@data-exploration-components/types';

import { EmptyState } from '@data-exploration-components/components/EmpyState/EmptyState';
import { SummaryCard } from '@data-exploration-components/components/SummaryCard/SummaryCard';
import { getSummaryCardItems } from '@data-exploration-components/components/SummaryCard/utils';

export const SequenceSummary = ({
  query = '',
  filter = {},
  onAllResultsClick,
  onRowClick,
}: {
  query?: string;
  filter: InternalSequenceFilters;
  onAllResultsClick?: (
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  onRowClick?: (row: Sequence) => void;
}) => {
  const api = convertResourceType('sequence');

  const { isLoading, items } = useResourceResults<Sequence>(api, query, filter);
  const columns = useMemo(
    () =>
      [
        Table.Columns.name(query),
        Table.Columns.description(query),
      ] as ColumnDef<Sequence>[],
    [query]
  );

  return (
    <SummaryCard
      icon="Sequences"
      title="Sequence"
      onAllResultsClick={onAllResultsClick}
    >
      {isLoading ? (
        <EmptyState isLoading={isLoading} title="Loading results" />
      ) : (
        <Table
          onRowClick={onRowClick}
          data={getSummaryCardItems(items)}
          id="sequence-summary-table"
          columns={columns}
          enableColumnResizing={false}
        />
      )}
    </SummaryCard>
  );
};
