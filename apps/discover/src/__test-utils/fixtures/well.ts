import map from 'lodash/map';

import {
  SequenceRow,
  Well as OldWellType,
  FilterConfig,
  FilterTypes,
  FilterCategoricalData,
  Wellbore,
  Measurement,
  Well,
} from 'modules/wellSearch/types';
import { toWellSequence } from 'modules/wellSearch/utils';

import { FIELD_BLOCK_OPERATOR } from '../../../src/modules/wellSearch/constantsSidebarFilters';

import { createdAndLastUpdatedTime } from './log';

export const WELL_TRAJ_COLUMNS = [
  { name: 'MD_DSDSUNIT', externalId: 'MD_DSDSUNIT', valueType: 'STRING' },
  { name: 'OFFSET_EAST', externalId: 'OFFSET_EAST', valueType: 'DOUBLE' },
];

export const getMockWell = (extras?: Partial<Well>): Well => {
  return {
    name: 'test-well',
    description: 'test-well-desc',
    id: 1234,
    waterDepth: {
      value: 23.523422,
      unit: 'ft',
    },
    spudDate: new Date(1622190752316),
    sourceAssets: () => Promise.resolve([]),
    ...extras,
  };
};

export const getMockWellbore = (extras?: Partial<Wellbore>): Wellbore => {
  return {
    id: '1234',
    name: 'test-wellbore',
    description: 'test-wellbore-description',
    sourceWellbores: [],
    ...mockWellboreOptions,
    ...extras,
  };
};

export const getMockWellOld = (extras?: Partial<OldWellType>): OldWellType => {
  return {
    name: '16/1',
    description: 'GC16',
    sourceAssets: () => Promise.resolve([]),
    id: 1234,
    waterDepth: {
      value: 23.523422,
      unit: 'ft',
    },
    ...extras,
  };
};

export const mockedWellResultFixture: OldWellType[] = [
  getMockWell({
    name: '16/1',
    description: 'A007',
    id: 1234,
  }),
  getMockWell({
    name: '16/2',
    description: 'A008',
    id: 1235,
  }),
];

export const mockWellboreOptions = {
  trajectory: jest.fn(),
  casings: jest.fn(),
  parentWell: jest.fn(),
  getWellhead: jest.fn(),
  sourceAssets: jest.fn(),
};

export const mockedWellboreResultFixture: Wellbore[] = [
  {
    name: 'wellbore B',
    id: 759155409324883,
    wellId: 1234,
    description: 'wellbore B desc',
    sourceWellbores: [],
    ...mockWellboreOptions,
  },
  {
    name: 'wellbore A',
    id: 759155409324993,
    externalId: 'Wellbore A:759155409324993',
    wellId: 1234,
    description: 'wellbore A desc',
    sourceWellbores: [
      {
        id: 759155409324993,
        externalId: 'Wellbore A:759155409324993',
        source: 'Source A',
      },
    ],
    ...mockWellboreOptions,
  },
];

export const mockedWellsFixture = mockedWellResultFixture.map((well) => ({
  ...well,
  wellbores: mockedWellboreResultFixture.filter(
    (wellbore) => wellbore.wellId === well.id
  ),
}));

export const mockedWellsFixtureWellIds = map(mockedWellsFixture, 'id');
export const mockedWellsFixtureWellbores = mockedWellsFixture.flatMap(
  (well) => well.wellbores
);
export const mockedWellsFixtureWellboreIds = map(
  mockedWellsFixtureWellbores,
  'id'
);

export const mockedWellStateFixture = {
  wellSearch: {
    wells: mockedWellResultFixture.map((well) => ({
      ...well,
      wellbores: mockedWellboreResultFixture.filter(
        (wellbore) => wellbore.wellId === well.id
      ),
    })),
  },
};

export const mockedWellStateWithSelectedWells = {
  wellSearch: {
    ...mockedWellStateFixture.wellSearch,
    selectedWellIds: {
      1234: true,
    },
    selectedWellboreIds: {
      759155409324993: true,
    },
    wellboreData: {
      759155409324993: {
        logType: [],
        ppfg: [],
      },
      '7591554': {
        logType: [],
        ppfg: [],
        digitalRocks: [
          {
            asset: {
              id: 1123123,
            },
          },
        ],
      },
      '75915540932499342': {
        logType: [],
        ppfg: [],
        digitalRocks: [
          {
            asset: {
              id: 1123123,
            },
            digitalRockSamples: [
              {
                asset: {
                  id: 122342,
                },
              },
            ],
          },
        ],
      },
      '75915540932499343': {
        logType: [],
        ppfg: [],
        digitalRocks: [
          {
            asset: {
              id: 1123123,
            },
            digitalRockSamples: [
              {
                asset: {
                  id: 122342,
                },
                gpart: [{ id: 32134 }],
              },
            ],
          },
        ],
      },
      '75915540932499344': {
        logType: [],
        ppfg: [],
        digitalRocks: [
          {
            asset: {
              id: 1123123,
            },
            digitalRockSamples: [
              {
                asset: {
                  id: 122342,
                },
                gpart: [
                  {
                    sequence: {
                      id: 32134,
                      columns: [
                        {
                          name: 'ColumnA',
                        },
                        {
                          name: 'ColumnB',
                        },
                        {
                          name: 'ColumnY',
                        },
                      ],
                    },
                    rows: [
                      new SequenceRow(
                        0,
                        [1, 2, 3, 4],
                        [
                          {
                            name: 'ColumnA',
                          },
                          {
                            name: 'ColumnB',
                          },
                          {
                            name: 'ColumnY',
                          },
                        ]
                      ),
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  },
  wellInspect: {
    selectedWellIds: {},
    selectedWellboreIds: {},
    coloredWellbores: false,
    selectedRelatedDocumentsColumns: {
      fileName: true,
      author: true,
      topFolder: true,
      source: true,
      category: true,
    },
  },
};

export const mockedWellSearchState = {
  ...mockedWellStateFixture.wellSearch,
  wellboreData: {},
};

export const mockedSequencesResultFixture = [
  {
    parentId: 759155409324883,
    assetId: 759155409324883,
    externalId: 'BBHLH0L1CT-POS7ICp7Al-0007I',
    id: 23891231812,
    columns: [],
    lastUpdatedTime: new Date('01-01-1970'),
    createdTime: new Date('01-01-1980'),
    metadata: {
      fileType: 'MUDLOG',
      source: 'unknown',
      subType: 'Exploration',
      type: 'unknown',
      wellboreName: 'wellbore a',
    },
  },
  {
    parentId: 759155409324883,
    assetId: 123214123312,
    externalId: 'BBHLH0L1CT-POS7ICp7Al-0007I',
    id: 123213123,
    columns: [],
    lastUpdatedTime: new Date('01-01-1970'),
    createdTime: new Date('01-01-1980'),
    metadata: {
      fileType: 'MUDLOG',
      source: 'unknown',
      subType: 'Exploration',
      type: 'unknown',
      wellboreName: 'wellbore b',
    },
  },
];

export const mockedSequenceFixtures = mockedSequencesResultFixture.map(
  (asset: any) => toWellSequence(asset)
);

export const getDefaultWell = (includeWellBore = false) => {
  const well: OldWellType = mockedWellResultFixture[0];
  return {
    ...well,
    wellbores: includeWellBore ? [getDefaultWellbore()] : undefined,
  };
};

export const getDefaultWellbore = () => ({
  ...mockedWellboreResultFixture[0],
  wellId: mockedWellResultFixture[0].id,
});

export const getDefaultSequence = () => ({ ...mockedSequenceFixtures[0] });

export const getMockFilterConfig = (extras?: any): FilterConfig => ({
  id: 12345,
  name: 'filter-name',
  key: 'filter-key',
  category: 'filter-category',
  type: FilterTypes.CHECKBOXES,
  ...extras,
});

export const getMockFilterConfigByCategory = (): FilterCategoricalData[] => [
  {
    title: FIELD_BLOCK_OPERATOR,
    filterConfigs: [
      {
        id: 2,
        name: 'Field',
        key: 'field_block_operator_filter.field',
        category: FIELD_BLOCK_OPERATOR,
        type: 0,
      },
      {
        id: 4,
        category: FIELD_BLOCK_OPERATOR,
        key: 'field_block_operator_filter.operator',
        name: 'Operator',
        type: 0,
        isTextCapitalized: false,
      },
    ],
    filterConfigIds: [2, 4],
  },
  {
    title: 'Well Characteristics',
    filterConfigs: [
      {
        id: 7,
        name: 'Water Depth (ft)',
        key: 'well_characteristics_filter.water_depth',
        category: 'Well Characteristics',
        type: 2,
      },
      {
        id: 8,
        name: 'Spud Date',
        key: 'well_characteristics_filter.spud_date',
        category: 'Well Characteristics',
        type: 3,
      },
    ],
    filterConfigIds: [7, 8],
  },
  {
    title: 'Measurements',
    filterConfigs: [
      {
        id: 10,
        name: '',
        key: 'measurements_filter',
        category: 'Measurements',
        type: 1,
        isTextCapitalized: false,
      },
    ],
    filterConfigIds: [10],
  },
  {
    title: 'NDS - No Drilling Surprise',
    filterConfigs: [
      {
        id: 12,
        key: 'nds_filter',
        name: 'NDS Risk Type',
        category: 'NDS - No Drilling Surprise',
        type: 0,
      },
      {
        id: 13,
        key: 'nds_filter',
        name: 'NDS Severity',
        category: 'NDS - No Drilling Surprise',
        type: 0,
      },
      {
        id: 14,
        key: 'nds_filter',
        name: 'NDS Probability',
        category: 'NDS - No Drilling Surprise',
        type: 0,
      },
    ],
    filterConfigIds: [12, 13, 14],
  },
  {
    title: 'NPT - Non Productive Time',
    filterConfigs: [
      {
        id: 15,
        name: 'NPT Duration (hrs)',
        key: 'npt_filter',
        category: 'NPT - Non Productive Time',
        type: 2,
      },
      {
        id: 16,
        name: 'NPT Code',
        key: 'npt_filter',
        category: 'NPT - Non Productive Time',
        type: 0,
      },
      {
        id: 17,
        name: 'NPT Detail Code',
        key: 'npt_filter',
        category: 'NPT - Non Productive Time',
        type: 0,
      },
    ],
    filterConfigIds: [15, 16, 17],
  },
];

export const getMockWellFilterConfig = () => ({
  filters: {},
  wellbores: {},
  overview: { enabled: true },
  nds: { enabled: true },
  npt: { enabled: true },
  nds_filter: { enabled: true },
  npt_filter: { enabled: true },
  data_source_filter: { enabled: false },
  field_block_operator_filter: {
    operator: { enabled: true },
    field: { enabled: true },
    block: { enabled: false },
  },
  well_characteristics_filter: {
    well_type: { enabled: true },
    kb_elevation: { enabled: false },
    tvd: { enabled: false },
    maximum_inclination_angle: { enabled: false },
    spud_date: { enabled: true },
    water_depth: { enabled: true },
  },
  measurements_filter: { enabled: true },
});

export const mockedMeasurementsResultFixture: Measurement[] = [
  {
    assetId: 759155409324883,
    externalId: 'BBHLH0L1CT-POS7ICp7Al-0007I',
    id: 23891231812,
    columns: [
      {
        name: 'SHMIN_SHALE_ML_PRE',
        valueType: 'STRING',
        ...createdAndLastUpdatedTime,
        id: 1,
      },
      {
        name: 'FRICTION_ANGLE_PRE',
        valueType: 'STRING',
        ...createdAndLastUpdatedTime,
        id: 2,
      },
      {
        name: 'CP_POST',
        valueType: 'STRING',
        ...createdAndLastUpdatedTime,
        id: 3,
      },
    ],
    lastUpdatedTime: new Date('01-01-1970'),
    createdTime: new Date('01-01-1980'),
    metadata: {
      fileType: 'MUDLOG',
      source: 'unknown',
      subType: 'Exploration',
      type: 'unknown',
      wellboreName: 'wellbore a',
    },
  },
  {
    assetId: 123214123312,
    externalId: 'BBHLH0L1CT-POS7ICp7Al-0007I',
    id: 123213123,
    columns: [
      {
        name: 'SHMIN_SHALE_ML_PRE',
        valueType: 'STRING',
        ...createdAndLastUpdatedTime,
        id: 1,
      },
      {
        name: 'PP_COMPOSITE_POST',
        valueType: 'STRING',
        ...createdAndLastUpdatedTime,
        id: 2,
      },
      {
        name: 'CP_ZERO_PRE',
        valueType: 'STRING',
        ...createdAndLastUpdatedTime,
        id: 3,
      },
    ],
    lastUpdatedTime: new Date('01-01-1970'),
    createdTime: new Date('01-01-1980'),
    metadata: {
      fileType: 'MUDLOG',
      source: 'unknown',
      subType: 'Exploration',
      type: 'unknown',
      wellboreName: 'wellbore b',
    },
  },
];
