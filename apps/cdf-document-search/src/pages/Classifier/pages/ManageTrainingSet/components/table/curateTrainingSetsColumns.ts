import { Table } from '@cognite/cogs.js';
import { TableCell } from '../../../../../../components/table/TableCell';
import { Navigation } from '../../../../../../hooks/useNavigation';

export const curateColumns = (navigate: Navigation) => {
  return [
    {
      Header: 'Label',
      accessor: 'label',
      Filter: Table.InputFilter(),
      filter: 'fuzzyText',
      filterIcon: 'Search',
      Cell: TableCell.Label(),
    },
    {
      Header: 'Description',
      accessor: 'description',
      Cell: TableCell.Text(),
    },
    {
      Header: 'Files in label',
      accessor: 'count',
      Cell: TableCell.DocumentTag(),
    },
    {
      Header: '',
      accessor: 'settings',
      Cell: TableCell.ManageFilesButton(navigate),
      disableSortBy: true,
    },
  ];
};
