import React from 'react';
import { CogniteEvent } from '@cognite/sdk';
import { Column } from 'react-table';
import { NewTable as Table, TableProps } from 'components/ReactTable/Table';

import { RelationshipLabels } from 'types';

export type EventWithRelationshipLabels = RelationshipLabels & CogniteEvent;

const columns = [
  Table.Columns.type,
  Table.Columns.description,
  Table.Columns.externalId,
  Table.Columns.lastUpdatedTime,
  Table.Columns.created,
  Table.Columns.id,
  Table.Columns.dataSet,
  Table.Columns.startTime,
  Table.Columns.endTime,
  Table.Columns.source,
  Table.Columns.assets,
] as Column<CogniteEvent>[];

const visibleColumns = ['type', 'description'];
export const EventNewTable = (
  props: Omit<TableProps<EventWithRelationshipLabels>, 'columns'> &
    RelationshipLabels
) => {
  return (
    <Table<CogniteEvent>
      columns={columns}
      alwaysColumnVisible="type"
      visibleColumns={visibleColumns}
      {...props}
    />
  );
};
