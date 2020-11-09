import React from 'react';
import { FileInfo as File, FileInfo } from '@cognite/sdk';
import { TimeDisplay, TableProps, Table } from 'lib/components';
import { Body } from '@cognite/cogs.js';

export const FileTable = ({
  items,
  onItemClicked,
  ...props
}: {
  items: File[];
  onItemClicked: (file: File) => void;
} & TableProps<File>) => {
  const columns = [
    Table.Columns.name,
    Table.Columns.mimeType,
    {
      ...Table.Columns.uploadedTime,
      cellRenderer: ({ cellData: file }: { cellData: File }) => (
        <Body level={2}>
          {file && file.uploaded && (
            <TimeDisplay value={file.uploadedTime} relative withTooltip />
          )}
        </Body>
      ),
    },
    Table.Columns.relationships,
    Table.Columns.lastUpdatedTime,
    Table.Columns.createdTime,
  ];

  return (
    <Table<FileInfo>
      data={items}
      columns={columns}
      onRowClick={onItemClicked}
      {...props}
    />
  );
};
