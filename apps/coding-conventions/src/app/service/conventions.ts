import { System } from '../pages/conventions/types';

export const dummyConventions: System[] = [
  {
    id: '123',
    title: 'File name',
    subtitle: 'Extract file type',
    structure: 'ZZZZZZ NN-NN-NN NNN',
    conventions: [
      {
        range: {
          start: 7,
          end: 9,
        },
        keyword: 'NN',
        id: 'ABC',
        name: 'System',
        definitions: [
          {
            key: '10',
            id: 'system-10',
            description: 'Drilling Systems',
            type: 'Abbreviation',
          },
          {
            key: '11',
            id: 'system-11',
            description: 'Drilling process Systems',
            type: 'Abbreviation',
          },
          {
            key: '12',
            id: 'system-12',
            description: 'Drilling wellcontroll systems',
            type: 'Abbreviation',
          },
          {
            key: '13',
            id: 'system-13',
            description: 'Riser and well system',
            type: 'Abbreviation',
          },
          {
            key: '14',
            id: 'system-14',
            description: 'Riser operations ssytems',
            type: 'Abbreviation',
          },
          {
            key: '15',
            id: 'system-15',
            description: 'Well related production systems topside',
            type: 'Abbreviation',
          },
          {
            key: '16',
            id: 'system-16',
            description: 'Gas and water injection well ssytem topside',
            type: 'Abbreviation',
          },
          {
            key: '17',
            id: 'system-17',
            description:
              'subsea production system - installation, maintenance and workover systems',
            type: 'Abbreviation',
          },
          {
            key: '18',
            id: 'system-18',
            description: 'Not defined',
            type: 'Abbreviation',
          },
          {
            type: 'Range',
            value: [0, 10],
            id: 'system-123',
            description: 'LOL',
          },
        ],
      },
      {
        range: {
          start: 10,
          end: 12,
        },
        keyword: 'NN',
        id: 'XYZ',
        name: 'Subsystem',
        definitions: [
          {
            type: 'Abbreviation',
            key: '10',
            description: 'Derrick/mast and hoisting ',
            id: 'subsystem-10',
            dependsOn: 'system-10',
          },
        ],
        dependency: 'ABC',
      },
    ],
  },
];
