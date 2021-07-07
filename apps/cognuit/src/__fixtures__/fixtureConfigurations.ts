import { columnRules } from 'pages/Configurations/components/Table/columnRules';
import { ConfigurationsResponse } from 'types/ApiInterface';
import {
  ExtendedConfigurationsResponse,
  GenerateConfigurationsColumns,
} from 'typings/interfaces';

const defaultConfigurations = [
  {
    source: {
      external_id: 'SourceTestProject',
      source: 'Studio',
    },
    target: {
      external_id: 'TargetTestProject',
      source: 'Openworks',
    },
    business_tags: ['Cognuit', 'Integration'],
    author: 'Cognuit',
    datatypes: ['PointSet', 'Target', 'FaultInterpretation'],
    data_status: [],
    name: 'Cognuit 91523',
    ow_to_studio_config: {
      folder: 'string',
      session_name: 'string',
      tag_name: 'string',
    },
    id: 123,
    created_time: 1617525416,
    last_updated: 1617557732,
    status_active: true,
    progress: {
      PointSet: {
        in_progress: 100,
        outdated: 0,
        not_uploaded: 0,
        succeeded: 0,
        new: 0,
        total: 100,
      },
      Target: {
        in_progress: 100,
        outdated: 0,
        not_uploaded: 0,
        succeeded: 0,
        new: 0,
        total: 100,
      },
    },
  },
] as ConfigurationsResponse[];

const extendedConfigurations = [
  {
    ...defaultConfigurations[0],
    statusColor: defaultConfigurations[0].status_active,
    repoProject: `${defaultConfigurations[0].source.external_id} / ${defaultConfigurations[0].target.external_id}`,
    actions: {
      direction:
        defaultConfigurations[0].source.source === 'Studio'
          ? 'psToOw'
          : 'owToPs',
      statusActive: defaultConfigurations[0].status_active,
      id: defaultConfigurations[0].id,
      name: defaultConfigurations[0].name,
    },
    conf_name: {
      name: defaultConfigurations[0].name,
      id: defaultConfigurations[0].id,
    },
  },
] as ExtendedConfigurationsResponse[];

const generatedColumns = [
  {
    title: 'Author',
    dataIndex: 'author',
    key: 'author',
    sorter: expect.any(Boolean),
  },
  {
    title: 'Last updated',
    dataIndex: 'last_updated',
    key: 'last_updated',
    sorter: expect.any(Boolean),
  },
  {
    title: 'Status',
    dataIndex: 'status_active',
    key: 'status_active',
    sorter: expect.any(Boolean),
  },
  {
    title: 'Progress',
    dataIndex: 'progress',
    key: 'progress',
    sorter: expect.any(Boolean),
  },
  {
    title: '',
    dataIndex: 'statusColor',
    key: 'statusColor',
    sorter: true,
  },
  {
    title: 'Repository/Project',
    dataIndex: 'repoProject',
    key: 'repoProject',
    sorter: expect.any(Boolean),
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    sorter: true,
  },
  {
    title: 'Name',
    dataIndex: 'conf_name',
    key: 'conf_name',
    sorter: expect.any(Boolean),
  },
] as GenerateConfigurationsColumns[];

const getColumnRules = columnRules({
  handleNameChange: jest.fn(),
  handleStopStart: jest.fn(),
  handleRestart: jest.fn(),
});

const curatedColumns = [
  {
    Header: 'Author',
    accessor: 'author',
    Cell: expect.any(Function),
    disableSortBy: expect.any(Boolean),
  },
  {
    Header: 'Last updated',
    accessor: 'last_updated',
    Cell: expect.any(Function),
    disableSortBy: expect.any(Boolean),
  },
  {
    Header: 'Status',
    accessor: 'status_active',
    Cell: expect.any(Function),
    disableSortBy: expect.any(Boolean),
  },
  {
    Header: 'Progress',
    accessor: 'progress',
    Cell: expect.any(Function),
    disableSortBy: expect.any(Boolean),
  },
  {
    Header: '',
    accessor: 'statusColor',
    Cell: expect.any(Function),
    disableSortBy: true,
  },
  {
    Header: 'Repository/Project',
    accessor: 'repoProject',
    Cell: expect.any(Function),
    disableSortBy: expect.any(Boolean),
  },
  {
    Header: 'Actions',
    accessor: 'actions',
    Cell: expect.any(Function),
    disableSortBy: true,
  },
  {
    Header: 'Name',
    accessor: 'conf_name',
    Cell: expect.any(Function),
    disableSortBy: expect.any(Boolean),
  },
];

export {
  defaultConfigurations,
  extendedConfigurations,
  generatedColumns,
  getColumnRules,
  curatedColumns,
};
