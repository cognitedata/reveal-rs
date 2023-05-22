import { FileInfo } from '@cognite/sdk/dist/src';

function* idMaker(): Generator<number> {
  let index = 1000;
  while (true) {
    yield index++;
  }
}

const id = idMaker();

export const fileWithExtentionAndMimeType: FileInfo = {
  id: id.next().value,
  name: 'Test_JPG_File.jpg',
  mimeType: 'image/jpg',
  uploaded: true,
  createdTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  lastUpdatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  sourceCreatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
};

export const fileWithExtention: FileInfo = {
  id: id.next().value,
  name: 'Test_JPG_File.jpg',
  uploaded: true,
  createdTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  lastUpdatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  sourceCreatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
};

export const fileWithMimeType: FileInfo = {
  id: id.next().value,
  name: 'Test_JPG_File',
  mimeType: 'image/jpg',
  uploaded: true,
  createdTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  lastUpdatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  sourceCreatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
};

export const fileWithoutExtentionAndMimeType: FileInfo = {
  id: id.next().value,
  name: 'Test_JPG_File',
  uploaded: true,
  createdTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  lastUpdatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
  sourceCreatedTime: new Date(2021, 0, 1, 7, 0, 0, 0),
};

export const CORRECT_TYPE = 'jpg';
export const INCORRECT_TYPE = 'png';

export const fileMockData: FileInfo[] = [
  {
    id: 1,
    externalId: 'SKA-AK-P-XB-2930-001.png',
    name: 'SKA-AK-P-XB-2930-001.png',
    mimeType: 'image/png',
    assetIds: [
      560489721305992, 607065467418725, 778676031640514, 979330430071423,
      1573619286832806, 3575569724807447, 4397051466722513, 5379193160777911,
      5943881697483384, 7404541461379072, 8220256008593149,
    ],
    dataSetId: 2980543378855428,
    uploaded: true,
    uploadedTime: new Date(),
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  },
  {
    id: 2,
    externalId: 'random.pdf',
    name: 'random long name for pdf.pdf',
    mimeType: 'application/pdf',
    assetIds: [8220256008593149],
    dataSetId: 2980543378855428,
    uploaded: true,
    uploadedTime: new Date(),
    createdTime: new Date(),
    lastUpdatedTime: new Date(),
  },
  {
    id: 478339823591112,
    name: 'DS10400-Q-VB-0007.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 723091561429342,
    externalId: 'PID-ME-P-1524',
    name: 'PID-ME-P-1524.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      33987996715382, 257783880334163, 259827378939714, 850612942170830,
      1052250357997236, 1494584059225401, 1855195408300447, 2164089001075929,
      2676319126872064, 2900347294974447, 3076502728325608, 4782098923532522,
      4954921733360862, 6789153559351670,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 833870613621619,
    name: 'DS0901-VB-73333.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 1064615894162000,
    name: 'DS03-3133-MB-Z34.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 1315439070651026,
    name: 'DS0901-I-XT-73333.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 1366215316818866,
    externalId: 'PID-ME-P-0021',
    name: 'PID-ME-P-0021.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 2576592392224232,
    name: 'DS-S3H1-YC-31.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 2728896425933006,
    name: 'LIR-CA-0002.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 2920808077692008,
    name: 'DSDD-SM-K-LA-0001.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 3139184643962087,
    name: 'DS03-SM-MB-65V1.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 3151537524544026,
    name: 'PID-ME-P-0021-SVG.svg',
    mimeType: 'image/svg+xml',
    assetIds: [
      164630481432948, 1071765526956292, 1450801451150559, 1828698668339204,
      1870001200180948, 2209665113840059, 2679831243599081, 2909001440089226,
      3001250406421789, 3300309141218297, 3688526904266189, 3856983239105900,
      3979322799512249, 4093427189665330, 4258388025919458, 4291077094026398,
      4305456667332874, 4474850466761302, 4681778555969979, 4980931738902780,
      5157499154504721, 5346135489068458, 6593472844046992, 6762486109619169,
      7062837851461712, 8108742991654259, 8776475537078816, 8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 3300496717195645,
    externalId: 'PID-ME-P-0221',
    name: 'PID-ME-P-0221.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      263919703463054, 1238945449067105, 3324190091761753, 5231398991217791,
      6261583685094872, 8108742991654259,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 4201366292098891,
    name: 'DS0901-SM-DDF-XI-94.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 4609402429444685,
    externalId: 'GRID_ZONES',
    name: 'LOR_threed_grid.json',
    mimeType: 'application/json',
    assetIds: [1918823365845105],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 4730669106529034,
    name: 'DS0901-SM-LKT-XI-92.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 5024770866320837,
    externalId: 'GLOBAL_UNIT_CONVERSIONS',
    name: 'UnitConversions.json',
    mimeType: 'application/json',
    assetIds: [1918823365845105],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 5456886656611084,
    name: 'DSDD-23S43K-VA-0001.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 6200690704974798,
    name: 'SM-E-XJ-1475-DST.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 6294961939954705,
    externalId: 'PID-ME-P-0024',
    name: 'PID-ME-P-0024.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      289559560512870, 331680864782840, 1911493918624450, 2744304201271994,
      4180951740045076, 5078472143282801, 5906475906253334, 6603080950550528,
      7164737926066288, 7207561122933117,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 6434505965380091,
    externalId: 'PID-ME-P-0102',
    name: 'PID-ME-P-0102.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      220777116804772, 700116006322008, 1590997086882381, 2415383556709531,
      2698066681490277, 3332507481998593, 3832111844508701, 4582695553316067,
      6332913977344535, 7336142711489477,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 7027464852527351,
    name: 'DS-ULI-P-LA-2746.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 7371963363500334,
    name: 'LIR-CA-0001.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 7660754220271677,
    externalId: 'PID-ME-P-0234',
    name: 'PID-ME-P-0234.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      271721601756665, 1358166556159813, 2389780757311964, 3573837681405686,
      3973014219035256, 6040842088302779, 6221319980333128,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 8245899588341778,
    name: 'XX_21PT1019.jpg',
    mimeType: 'image/jpeg',
    assetIds: [8108742991654259],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 8475132435485142,
    name: 'PM-ME-P-0265-001-SVG.svg',
    mimeType: 'image/svg+xml',
    assetIds: [
      3001250406421789, 4291077094026398, 4474850466761302, 4681778555969979,
      4980931738902780, 8108742991654259, 8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 8586087490111830,
    name: 'DS-LSCH-LA-0102.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 8639679521713036,
    name: 'DSZ1-SM-I-XY-Z9395.pdf',
    mimeType: 'application/pdf',
    assetIds: [
      164630481432948, 2209665113840059, 3001250406421789, 4291077094026398,
      4474850466761302, 4681778555969979, 4980931738902780, 8108742991654259,
      8850608887837407,
    ],
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
  {
    id: 334418,
    name: 'example.txt',
    mimeType: 'text/plain',
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },

  {
    id: 586501,
    name: 'example.json',
    mimeType: 'application/json',
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },

  {
    id: 448724,
    name: 'example.csv',
    mimeType: 'text/csv',
    uploaded: true,
    lastUpdatedTime: new Date(),
    createdTime: new Date(),
  },
];
