import React, { useMemo } from 'react';
import { Icon } from '@cognite/cogs.js';
import moment from 'moment';
import {
  useTable,
  useFilters,
  useGlobalFilter,
  useSortBy,
  useExpanded,
  HeaderGroup,
  Column,
  Cell,
  Row,
} from 'react-table';
import StatusMarker from '../integrations/cols/StatusMarker';
import { SortingIcon } from './TabsStyle';
import Wrapper from '../../styles/StyledTable';
import { mockDataRunsResponse } from '../../utils/mockResponse';

interface ITableProps {
  data: {
    timestamp: number;
    status: string;
    statusSeen: string;
  }[];
  columns: Column[];
}

interface ICell {
  row: Row;
  cell: Cell;
}

const showSorterIndicator = (sCol: HeaderGroup) => {
  if (!sCol.disableSortBy) {
    if (sCol.isSorted) {
      if (sCol.isSortedDesc) {
        return <SortingIcon type="SortDown" />;
      }
      return <SortingIcon type="SortUp" />;
    }
    return <SortingIcon type="OrderDesc" />;
  }
  return '';
};

const timeFromNow = (time: number) => {
  const date = moment(time);
  const isToday = date.valueOf() > moment().startOf('day').valueOf();
  const isYesterday =
    date.valueOf() > moment().subtract(1, 'days').startOf('day').valueOf();
  if (isToday) {
    return `Today ${date.format('HH:mm')}`;
  }
  if (isYesterday) {
    return `Yesterday ${date.format('HH:mm')}`;
  }
  return `${date.fromNow()} ${date.format('HH:mm')}`;
};

const Table = ({ columns, data }: ITableProps) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data,
    },
    useFilters,
    useGlobalFilter,
    useSortBy,
    useExpanded
  );

  return (
    <table {...getTableProps()} className="cogs-table integrations-table">
      <thead>
        {headerGroups.map((headerGroup: HeaderGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((col: HeaderGroup) => {
              return (
                <th
                  {...col.getHeaderProps(col.getSortByToggleProps())}
                  className={`${col.id}-col`}
                >
                  {col.render('Header')}
                  {showSorterIndicator(col)}
                </th>
              );
            })}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row: Row) => {
          prepareRow(row);
          const isParentRow =
            (row?.subRows?.length && row?.subRows?.length > 0) ?? false;
          const isChildRow = row.depth === 1;
          return (
            <tr
              {...row.getRowProps()}
              className={`cogs-table-row integrations-table-row ${
                row.isSelected ? 'row-active' : ''
              } ${isParentRow ? 'parent-row' : ''}
              ${isChildRow ? 'child-row' : ''}`}
            >
              {row.cells.map((cell: Cell) => {
                return (
                  <td
                    {...cell.getCellProps()}
                    className={`${cell.column.id}-col`}
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

const SidePanelTable = () => {
  const data = useMemo(() => mockDataRunsResponse, []);

  const columns = useMemo(
    () => [
      {
        Header: 'Seen',
        accessor: 'timestamp',
        sortType: 'basic',
        Cell: (cell: Cell) => {
          return timeFromNow(cell.value);
        },
      },
      {
        Header: 'Last run',
        accessor: 'status',
        disableSortBy: true,
        Cell: (cell: Cell) => {
          return <StatusMarker status={cell.value} />;
        },
      },
      {
        Header: 'Last seen',
        accessor: 'statusSeen',
        disableSortBy: true,
        Cell: ({ row, cell }: ICell) =>
          row.canExpand ? (
            <span
              {...row.getToggleRowExpandedProps({
                style: {
                  paddingLeft: `${row.depth * 2}rem`,
                },
              })}
            >
              <StatusMarker status={cell.value} />
              {row.isExpanded ? <Icon type="Down" /> : <Icon type="Right" />}
            </span>
          ) : (
            <StatusMarker status={cell.value} />
          ),
      },
    ],
    []
  );

  return (
    <Wrapper>
      <Table columns={columns} data={data} />
    </Wrapper>
  );
};

export default SidePanelTable;
