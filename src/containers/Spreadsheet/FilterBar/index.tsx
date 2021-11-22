import React from 'react';
import styled from 'styled-components';
import { Body, Flex, Icon, Input } from '@cognite/cogs.js';

import { useTableData } from 'hooks/table-data';
import { useFilters } from 'hooks/table-filters';
import { FILTER_BAR_HEIGHT } from 'utils/constants';

import { Separator } from 'components/Separator';
import { FilterItem, FilterType } from 'components/FilterItem';
import { Actions } from './Actions';
import { useTotalRowCount } from 'hooks/sdk-queries';
import { useActiveTableContext } from 'contexts';

type Props = {
  isEmpty?: boolean;
  columnFilter: string;
  setColumnFilter: (columnQuery: string) => void;
};

export const FilterBar = ({
  isEmpty,
  columnFilter,
  setColumnFilter,
}: Props): JSX.Element => {
  const { database, table } = useActiveTableContext();
  const { rows, isFetched } = useTableData();
  const { filters, activeFilters, setFilter } = useFilters();
  const tableLength = isFetched ? (
    rows.length ?? 0
  ) : (
    <Icon type="LoadingSpinner" style={{ marginRight: '4px' }} />
  );

  const { data: totalRows } = useTotalRowCount({ database, table });

  const onFilterClick = (filter: FilterType) => setFilter(filter.type);
  const onColumnFilterChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setColumnFilter(e.target.value);

  return (
    <Bar justifyContent="space-between" alignItems="center">
      <FilterBar.List justifyContent="center" alignItems="center">
        {!isEmpty && (
          <>
            <Input
              placeholder="Search column name"
              value={columnFilter}
              onChange={onColumnFilterChange}
            />
            <Separator style={{ margin: '0 12px' }} />
            {filters.map((filter: FilterType) => {
              const active = activeFilters.includes(filter.type);
              return (
                <FilterItem
                  filter={filter}
                  active={active}
                  onClick={onFilterClick}
                />
              );
            })}
          </>
        )}
      </FilterBar.List>
      <Flex justifyContent="center" alignItems="center">
        <Separator style={{ margin: '0 12px' }} />
        <Body
          level={2}
          strong
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {tableLength} {Number.isFinite(totalRows) ? `/ ${totalRows}` : ''}{' '}
          rows
        </Body>
        <Separator style={{ margin: '0 12px' }} />
        <FilterBar.Actions />
      </Flex>
    </Bar>
  );
};

const Bar = styled(Flex)`
  padding: 16px;
  height: ${FILTER_BAR_HEIGHT}px;
  box-sizing: border-box;
`;

const List = styled(Flex)`
  & > :not(:first-child) {
    margin-right: 8px;
  }
`;

FilterBar.List = List;
FilterBar.Actions = Actions;
