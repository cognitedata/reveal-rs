import styled from 'styled-components';
import { Input, Title } from '@cognite/cogs.js';
import React, { ReactText, useEffect } from 'react';
import { TableWrapper } from 'src/pages/Workflow/components/FileTable/FileTableWrapper';
import { TableDataItem } from 'src/pages/Workflow/components/FileTable/FileTable';
import ReactBaseTable, {
  BaseTableProps,
  Column,
  ColumnShape,
} from 'react-base-table';
import store from 'src/store';
import { fileMetaDataEdit } from 'src/store/uploadedFilesSlice';
import { MetadataItem } from 'src/components/FileMetadata/Types';

const Container = styled.div`
  width: 100%;
  padding-bottom: 10px;
`;

const TitleHeader = styled.div`
  margin-bottom: 18px;
`;

type TableProps = Omit<Omit<BaseTableProps<TableDataItem>, 'width'>, 'height'>;

type MetadataTableProps = TableProps & {
  title: string;
  editMode: boolean;
  data: MetadataItem[];
  columnWidth: number;
};

const { dispatch } = store;
const updateCell = (value: any, cellProps: any) => {
  if (cellProps.columnIndex === 0) {
    // editing key
    dispatch(
      fileMetaDataEdit({
        index: cellProps.rowIndex,
        key: value,
        value: cellProps.rowData.value,
      })
    );
  } else if (cellProps.columnIndex === 1) {
    // editing value
    dispatch(
      fileMetaDataEdit({
        index: cellProps.rowIndex,
        key: cellProps.rowData.key,
        value,
      })
    );
  }
};

const EditableCell = (cellProps: {
  column: ColumnShape<MetadataItem>;
  cellData: ReactText;
}) => {
  const handleChange = (e: any) => {
    updateCell(e.target.value, cellProps);
  };
  if (cellProps.column.editMode) {
    return (
      <Input
        type="text"
        value={cellProps.cellData}
        fullWidth
        onChange={handleChange}
      />
    );
  }
  return <span>{cellProps.cellData}</span>;
};

const components = {
  TableCell: EditableCell,
};

export const MetaDataTable = (props: MetadataTableProps) => {
  let tableInstance: ReactBaseTable<MetadataItem>;
  const setRef = (ref: ReactBaseTable<MetadataItem>) => {
    tableInstance = ref;
  };

  useEffect(() => {
    const dataLength = props.data.length;
    // scroll to bottom if blank row
    if (tableInstance && dataLength && props.data[dataLength - 1].key === '') {
      tableInstance.scrollToRow(dataLength - 1);
    }
  });

  const columns: ColumnShape<MetadataItem>[] = [
    {
      key: 'key',
      title: 'Key',
      dataKey: 'key',
      width: props.columnWidth,
      align: Column.Alignment.LEFT,
      editMode: props.editMode,
    },
    {
      key: 'value',
      title: 'Value',
      dataKey: 'value',
      width: props.columnWidth,
      align: Column.Alignment.LEFT,
      editMode: props.editMode,
    },
  ];

  return (
    <Container>
      <TitleHeader>
        <Title level={6}>{props.title}</Title>
      </TitleHeader>
      <TableWrapper>
        <ReactBaseTable<MetadataItem>
          ref={setRef}
          columns={columns}
          maxHeight={Infinity}
          width={props.columnWidth * columns.length}
          data={props.data}
          components={components}
        />
      </TableWrapper>
    </Container>
  );
};
