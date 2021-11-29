import React from 'react';
import { Flex, Loader } from '@cognite/cogs.js';

import { useActiveTableContext } from 'contexts';
import { useTableData } from 'hooks/table-data';

import { FilterBar } from './FilterBar';
import { Table } from './Table';

export const Spreadsheet = (): JSX.Element => {
  const { database, table } = useActiveTableContext();
  const {
    rows,
    filteredColumns,
    isLoading,
    isFetched,
    hasNextPage,
    fetchNextPage,
  } = useTableData();

  const isEmpty = isFetched && !rows?.length;

  return (
    <Flex direction="column" style={{ width: '100%', height: '100%' }}>
      <FilterBar key={`${database}_${table}`} isEmpty={isEmpty} />
      {isLoading ? (
        <Loader />
      ) : (
        <Table
          isEmpty={isEmpty}
          rows={rows}
          columns={filteredColumns}
          onEndReach={() => {
            if (hasNextPage) {
              fetchNextPage();
            }
          }}
        />
      )}
    </Flex>
  );
};
