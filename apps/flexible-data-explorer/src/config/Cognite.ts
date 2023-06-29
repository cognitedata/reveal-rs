import { ProjectConfig } from './types';

export const cogniteConfig: ProjectConfig[] = [
  {
    site: 'Akerkvartalet',
    description:
      'All the data from the offices in Oslo is consolidated within this area.',
    imageUrl:
      'https://probea.no/wp-content/uploads/2019/03/probea_fornebu-17-1440x760.jpg',
    project: 'dss-dev',
    dataModels: [
      {
        name: 'MovieDM',
        space: 'deep',
        version: '4',
      },
      {
        name: 'IndustryCanvas',
        space: 'IndustryCanvas',
        version: '2',
      },
    ],
    nodeSpaces: undefined,
  },
  {
    site: 'My Site',
    description: 'Test site for 3D visualization.',
    imageUrl:
      'https://probea.no/wp-content/uploads/2019/03/probea_fornebu-17-1440x760.jpg',
    project: '3d-test',
    dataModels: [],
    nodeSpaces: undefined,
    threeDResources: [
      {
        type: 'cad',
        modelId: 1791160622840317,
        revisionId: 498427137020189,
      },
    ],
  },
];
