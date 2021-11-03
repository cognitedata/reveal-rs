import React, { useMemo } from 'react';
import * as CONST from 'src/constants/PaginationConsts';
import { TableDataItem } from 'src/modules/Common/types';
import styled from 'styled-components';
import {
  SortPaginateControls,
  PaginatedTableProps,
} from 'src/modules/Common/Components/FileTable/types';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { filesAnnotationCounts } from 'src/modules/Common/store/annotationSlice';
import { Footer } from './Footer';
import { Paginator } from './Paginator';

const getData = (
  data: TableDataItem[],
  sortKey?: string,
  sorters?: {
    [key: string]: (
      data: TableDataItem[],
      reverse: boolean,
      args?: any
    ) => TableDataItem[];
  },
  sorterArgs?: any,
  reverse?: boolean,
  pagination?: boolean,
  pageNumber?: number,
  pageSize?: number
): TableDataItem[] => {
  let tableData = data;
  // if sorting enabled
  if (sorters && sortKey && reverse !== undefined) {
    const sorter = sorters[sortKey];
    tableData = sorter ? sorter(data, reverse, sorterArgs) : data;
  }
  // if pagination enabled
  if (pagination && pageNumber && pageSize) {
    if (pageNumber > 0 && pageSize > 0) {
      const startIndex = (pageNumber - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      tableData = tableData.slice(startIndex, endIndex);
    }
  } else {
    const startIndex = 0;
    const endIndex = startIndex + CONST.DEFAULT_PAGE_SIZE;
    tableData = tableData.slice(startIndex, endIndex);
  }
  return tableData;
};

type SorterPaginationWrapperProps = {
  data: TableDataItem[];
  totalCount: number;
  sorters?: {
    [key: string]: (data: TableDataItem[], reverse: boolean) => TableDataItem[];
  };
  pagination?: boolean;
  sortPaginateControls: SortPaginateControls;
  isLoading: boolean;
  children: (tableProps: PaginatedTableProps<TableDataItem>) => React.ReactNode;
};

export const SorterPaginationWrapper = ({
  data,
  totalCount,
  sorters,
  pagination,
  sortPaginateControls,
  isLoading,
  children,
}: SorterPaginationWrapperProps) => {
  const {
    sortKey,
    reverse,
    currentPage,
    pageSize,
    setSortKey,
    setReverse,
    setCurrentPage,
    setPageSize,
  } = sortPaginateControls;
  const fetchedCount = data.length;
  const totalPages =
    pageSize > 0
      ? Math.ceil(fetchedCount / pageSize)
      : Math.ceil(fetchedCount / CONST.DEFAULT_PAGE_SIZE);

  const tableFooter =
    totalCount > fetchedCount && totalPages === currentPage ? (
      <Footer fetchedCount={fetchedCount} totalCount={totalCount} />
    ) : null;

  const sorterArgs = useSelector(({ annotationReducer }: RootState) =>
    filesAnnotationCounts(
      annotationReducer,
      data.map((item) => item.id)
    )
  );

  const pagedData = useMemo(() => {
    return getData(
      data,
      sortKey,
      sorters,
      sorterArgs,
      reverse,
      pagination,
      currentPage,
      pageSize
    );
  }, [data, sortKey, sorters, reverse, pagination, currentPage, pageSize]);

  return (
    <Container>
      <TableContainer>
        {children({
          sortKey,
          reverse,
          setSortKey,
          setReverse,
          data: pagedData,
          tableFooter,
          fetchedCount,
        })}
      </TableContainer>
      <PaginationContainer>
        {pagination && !isLoading ? (
          <Paginator
            currentPage={currentPage}
            pageSize={pageSize}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
            setPageSize={setPageSize}
          />
        ) : null}
      </PaginationContainer>
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-rows: auto max-content;
  grid-template-columns: 100%;
  height: 100%;
  width: 100%;
`;

const TableContainer = styled.div`
  height: inherit;
`;

const PaginationContainer = styled.div`
  height: inherit;
`;
