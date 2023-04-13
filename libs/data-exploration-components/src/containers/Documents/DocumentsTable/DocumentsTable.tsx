import React, { useMemo } from 'react';

import {
  SubCellMatchingLabels,
  Table,
  TableProps,
  TimeDisplay,
} from '@data-exploration/components';

import { DocumentNamePreview } from './DocumentNamePreview';
import { DocumentContentPreview } from './DocumentContentPreview';
import { ColumnDef, Row } from '@tanstack/react-table';
import {
  InternalDocument,
  InternalDocumentWithMatchingLabels,
} from '@data-exploration-lib/domain-layer';
import { DASH } from '@data-exploration-lib/core';
import {
  useFlagDocumentGPT,
  useGetHiddenColumns,
} from '@data-exploration-components/hooks';
import { Body } from '@cognite/cogs.js';

import { Asset } from '@cognite/sdk';
import { DocumentSummaryPreview } from './DocumentSummaryPreview';
import { useDocumentsMetadataColumns } from '../hooks/useDocumentsMetadataColumns';

// TODO: Might need to add RelationshipLabels at some point.
export type DocumentTableProps = Omit<
  TableProps<InternalDocumentWithMatchingLabels>,
  'columns'
> & {
  query?: string;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  gptColumnName: string;
};

const visibleColumns = [
  'name',
  'content',
  'summary',
  'type',
  'modifiedTime',
  'createdTime',
  'rootAsset',
];

export const DocumentsTable = (props: DocumentTableProps) => {
  const { query, onRootAssetClick } = props;
  const { metadataColumns, setMetadataKeyQuery } =
    useDocumentsMetadataColumns();

  const isDocumentGPTEnabled = useFlagDocumentGPT();

  const columns = useMemo(
    () =>
      [
        {
          ...Table.Columns.name(),
          enableHiding: false,
          cell: ({ row }: { row: Row<InternalDocumentWithMatchingLabels> }) => {
            const fileNamePreviewProps = {
              fileName: row.original.name || '',
              file: row.original,
            };
            return (
              <DocumentNamePreview {...fileNamePreviewProps} query={query} />
            );
          },
        },
        {
          accessorKey: 'content',
          header: 'Content',
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            return (
              <DocumentContentPreview document={row.original} query={query} />
            );
          },
          enableSorting: false,
        },
        ...(isDocumentGPTEnabled
          ? [
              {
                accessorKey: 'summary',
                header: props.gptColumnName,
                cell: ({ row }: { row: Row<InternalDocument> }) => {
                  return (
                    <DocumentSummaryPreview
                      document={row.original}
                      query={query}
                    />
                  );
                },
                enableSorting: true,
                enableHiding: true,
              },
            ]
          : []),
        {
          accessorKey: 'author',
          id: 'author',
          header: 'Author',
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            return <Body level={2}>{row.original.author || DASH}</Body>;
          },
        },
        {
          id: 'directory',
          header: 'Directory',
          cell: ({ row }) => {
            return (
              <Body level={2}>
                {row.original?.sourceFile?.directory || DASH}
              </Body>
            );
          },
          enableSorting: false,
        },
        {
          // You do not have to add an id field if accessor is given a string.
          accessorKey: 'type',
          header: 'File type',
          cell: ({ row }: { row: Row<InternalDocument> }) => {
            return <Body level={2}>{row.original.type}</Body>;
          },
        },
        {
          accessorKey: 'modifiedTime',
          header: 'Last updated',
          cell: ({ row }: { row: Row<InternalDocument> }) => (
            <Body level={2}>
              <TimeDisplay value={row.original.modifiedTime} />
            </Body>
          ),
        },
        Table.Columns.created,
        {
          ...Table.Columns.rootAsset(onRootAssetClick),
          accessorFn: (doc) => doc?.assetIds?.length && doc.assetIds[0],
        },
        Table.Columns.assets(onRootAssetClick),
        Table.Columns.externalId(query),
        Table.Columns.id(query),
        {
          ...Table.Columns.dataSet,
          accessorFn: (document) => document.sourceFile.datasetId,
          enableSorting: true,
        },

        ...metadataColumns,
      ] as ColumnDef<InternalDocumentWithMatchingLabels>[],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, metadataColumns, props.gptColumnName]
  );

  // const updatedColumns =
  //   getNewColumnsWithRelationshipLabels<DocumentWithRelationshipLabels>(
  //     columns,
  //     relatedResourceType === 'relationship'
  //   );

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  return (
    <Table<InternalDocumentWithMatchingLabels>
      {...props}
      columns={columns}
      hiddenColumns={hiddenColumns}
      data={props.data}
      renderCellSubComponent={SubCellMatchingLabels}
      onChangeSearchInput={setMetadataKeyQuery}
    />
  );
};
