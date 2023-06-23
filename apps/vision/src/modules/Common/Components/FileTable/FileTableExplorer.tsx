import React from 'react';
import { Column, ColumnShape } from 'react-base-table';
import { useSelector } from 'react-redux';

import { LoadingTable } from '@vision/modules/Common/Components/LoadingRenderer/LoadingTable';
import { NoData } from '@vision/modules/Common/Components/NoData/NoData';
import { SelectableTable } from '@vision/modules/Common/Components/SelectableTable/SelectableTable';
import { ActionRendererExplorer } from '@vision/modules/Common/Containers/FileTableRenderers/ActionRenderer';
import { AnnotationRenderer } from '@vision/modules/Common/Containers/FileTableRenderers/AnnotationRenderer';
import { DateRenderer } from '@vision/modules/Common/Containers/FileTableRenderers/DateRenderer';
import { NameRenderer } from '@vision/modules/Common/Containers/FileTableRenderers/NameRenderer';
import { StringRenderer } from '@vision/modules/Common/Containers/FileTableRenderers/StringRenderer';
import { ResultData, TableDataItem } from '@vision/modules/Common/types';
import { SortKeys } from '@vision/modules/Common/Utils/SortUtils';
import { RootState } from '@vision/store/rootReducer';
import mime from 'mime-types';

import { FileListTableProps } from './types';

const getTimestampDataKey = (
  sortKey?: string,
  defaultTimestampKey?: string
) => {
  switch (sortKey) {
    case SortKeys.uploadedTime:
    case SortKeys.createdTime:
      return sortKey;
    default:
      return defaultTimestampKey;
  }
};

const rendererMap = {
  name: NameRenderer,
  mimeType: StringRenderer,
  createdTime: DateRenderer,
  uploadedTime: DateRenderer,
  sourceCreatedTime: DateRenderer,
  annotations: AnnotationRenderer,
  action: ActionRendererExplorer,
};

export function FileTableExplorer(props: FileListTableProps<TableDataItem>) {
  const timestampDataKey = getTimestampDataKey(
    props.sortKey,
    props.defaultTimestampKey
  );

  const columns: ColumnShape<TableDataItem>[] = [
    {
      key: 'name',
      title: 'Name',
      dataKey: 'name',
      width: 0,
      flexGrow: 1, // since table is fixed, at least one col must grow
      sortable: true,
    },
    {
      key: 'mimeType',
      title: 'File Type',
      dataKey: 'mimeType',
      dataGetter: (
        { rowData } // Convert mime type to file type
      ) => {
        const mimeType = rowData.mimeType ? rowData.mimeType : '';
        const extension = mime.extension(mimeType) || 'Unknown';
        return extension.toUpperCase();
      },
      width: 150,
      align: Column.Alignment.LEFT,
      sortable: true,
    },
    ...(!props.modalView
      ? [
          {
            key: 'Timestamp',
            title: 'Timestamp', // This will override by TimeHeaderRenderer according to selected option
            dataKey: timestampDataKey,
            align: Column.Alignment.LEFT,
            width: 250,
            sortable: false,
          },
        ]
      : []),

    {
      key: 'annotations',
      title: 'Annotations',
      dataKey: 'annotations',
      width: 0,
      flexGrow: 1,
      align: Column.Alignment.LEFT,
      sortable: true,
    },
    ...(!props.modalView
      ? [
          {
            key: 'action',
            title: '',
            dataKey: 'action',
            align: Column.Alignment.RIGHT,
            width: 200,
          },
        ]
      : []),
  ];

  const rowClassNames = ({
    rowData,
  }: {
    columns: ColumnShape<TableDataItem>[];
    rowData: TableDataItem;
    rowIndex: number;
  }) => {
    return `clickable ${props.focusedId === rowData.id && 'active'}`;
  };

  const rowEventHandlers = {
    onClick: ({ rowData }: { rowData: TableDataItem }) => {
      props.onItemClick(rowData as ResultData);
    },
    onContextMenu: ({
      event,
      rowData,
    }: {
      event: React.SyntheticEvent;
      rowData: TableDataItem;
    }) => {
      if (props.onItemRightClick) {
        props.onItemRightClick(event as unknown as MouseEvent, rowData);
      }
    },
  };

  const loadingAnnotations = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.loadingAnnotations
  );

  const overlayRenderer = () =>
    props.isLoading ? <LoadingTable columns={columns} /> : <></>;
  const emptyRenderer = () => (props.isLoading ? <></> : <NoData />);

  return (
    <SelectableTable
      {...props}
      columns={columns}
      rendererMap={rendererMap}
      selectable
      rowClassNames={rowClassNames}
      rowEventHandlers={rowEventHandlers}
      disabled={loadingAnnotations}
      overlayRenderer={overlayRenderer}
      emptyRenderer={emptyRenderer}
    />
  );
}
