import { BaseTableProps } from 'react-base-table';
import { TableDataItem } from 'src/modules/Common/types';

export type PaginatedTableProps<T> = {
  data: T[];
  totalCount: number;
  onRowSelect: (item: T, selected: boolean) => void;
  onRowClick: (item: T) => void;
  selectedFileId?: number | null;
};
export type FileTableProps = Omit<
  BaseTableProps<TableDataItem>,
  'data' | 'width'
> &
  PaginatedTableProps<TableDataItem> & {
    allRowsSelected: boolean;
    onSelectAllRows: (value: boolean) => void;
  };

export type FileExplorerTableProps = Omit<
  BaseTableProps<TableDataItem>,
  'data' | 'width'
> &
  PaginatedTableProps<TableDataItem> & {
    allRowsSelected: boolean;
    onSelectAllRows: (value: boolean) => void;
  };
