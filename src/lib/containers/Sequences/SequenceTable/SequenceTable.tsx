import React from 'react';
import { Sequence } from '@cognite/sdk';
import { useSelectionCheckbox } from 'lib/hooks/useSelection';
import { useResourceMode } from 'lib/context';
import { Table, TableProps } from 'lib/components';

const ActionCell = ({ sequence }: { sequence: Sequence }) => {
  const getButton = useSelectionCheckbox();
  return getButton({ id: sequence.id, type: 'sequence' });
};

export const SequenceTable = ({
  items,
  onItemClicked,
  ...props
}: {
  items: Sequence[];
  onItemClicked: (sequence: Sequence) => void;
} & TableProps<Sequence>) => {
  const { mode } = useResourceMode();

  const columns = [
    Table.Columns.name,
    Table.Columns.externalId,
    Table.Columns.columns,
    Table.Columns.relationships,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
    ...(mode !== 'none'
      ? [
          {
            ...Table.Columns.select,

            cellRenderer: ({ rowData: sequence }: { rowData: Sequence }) => {
              return <ActionCell sequence={sequence} />;
            },
          },
        ]
      : []),
  ];

  return (
    <Table<Sequence>
      data={items}
      columns={columns}
      onRowClick={onItemClicked}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...props}
    />
  );
};
