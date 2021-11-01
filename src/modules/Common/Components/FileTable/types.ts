import { BaseTableProps } from 'react-base-table';
import { SelectFilter, TableDataItem } from 'src/modules/Common/types';

export type PaginatedTableProps<T> = {
  data: T[];
  sortKey?: string;
  reverse?: boolean;
  setSortKey?: (key: string) => void;
  setReverse?: (rev: boolean) => void;
  tableFooter?: JSX.Element | null;
  fetchedCount?: number;
};

type TableViewProps<T> = {
  data: T[];
  totalCount: number;
  onRowSelect: (item: T, selected: boolean) => void;
  onRowClick: (item: T, showFileDetailsOnClick?: boolean) => void;
  focusedFileId?: number | null;
  selectedRowIds: number[];
  allRowsSelected: boolean;
  onSelectAllRows: (value: boolean, filter?: SelectFilter) => void;
  onSelectPage: (fileIds: number[]) => void;
  modalView?: boolean;
};

export type GridViewProps<T> = {
  data: T[];
  selectedIds: number[];
  onItemClicked: (item: T) => void;
  renderCell: (cellProps: any) => JSX.Element;
  tableFooter?: JSX.Element | null;
  isLoading: boolean;
  overlayRenderer: () => JSX.Element;
  emptyRenderer: () => JSX.Element;
};

type FileTableProps = Omit<BaseTableProps<TableDataItem>, 'data' | 'width'> &
  TableViewProps<TableDataItem>;

export type SortPaginate = {
  sortKey?: string;
  reverse?: boolean;
  currentPage: number;
  pageSize: number;
};

export type SortPaginateControls = SortPaginate & {
  setSortKey?: (key: string) => void;
  setReverse?: (reverse: boolean) => void;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
};

export type FileListTableProps = FileTableProps & {
  sortPaginateControls: SortPaginateControls;
  isLoading?: boolean;
};

export type FileGridTableProps = Omit<
  BaseTableProps<TableDataItem>,
  'data' | 'width'
> &
  Omit<GridViewProps<TableDataItem>, 'overlayRenderer' | 'emptyRenderer'> & {
    totalCount: number;
    pagination?: boolean;
    sortPaginateControls: SortPaginateControls;
    onSelect?: (item: TableDataItem, selected: boolean) => void;
  };

export type MapTableTabKey = {
  activeKey: string;
  setActiveKey: (key: string) => void;
};
export type FileMapTableProps = FileTableProps & {
  mapTableTabKey: MapTableTabKey;
  sortPaginateControlsLocation: SortPaginateControls;
  sortPaginateControlsNoLocation: SortPaginateControls;
};
