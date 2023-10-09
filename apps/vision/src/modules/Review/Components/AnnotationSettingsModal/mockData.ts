import { PredefinedKeypointCollection, PredefinedShape } from '../../types';

export const predefinedKeypoints: PredefinedKeypointCollection[] = [
  {
    collectionName: 'Dial',
    color: 'red',
    keypoints: [
      {
        caption: 'Centre',
        order: '1',
        color: '#e3a1ec',
      },
      {
        caption: 'V1',
        order: '2',
        color: '#4a67fb',
      },
      {
        caption: 'V2',
        order: '3',
        color: '#fd5190',
      },
      {
        caption: 'V3',
        order: '4',
        color: '#ffbb00',
      },
    ],
  },
  {
    collectionName: 'Level',
    color: 'red',
    keypoints: [
      {
        caption: 'V2',
        order: '1',
        color: '#fd5190',
      },
      {
        caption: 'V3',
        order: '2',
        color: '#ffbb00',
      },
    ],
  },
  {
    collectionName: 'Large gauge',
    color: 'red',
    keypoints: [
      {
        caption: 'Center',
        order: '1',
        color: '#fd5190',
      },
    ],
  },
];

export const predefinedShapes: PredefinedShape[] = [
  { shapeName: 'Dial', color: '#00665c' },
  { shapeName: 'Gauge', color: '#6ED8BE' },
  { shapeName: 'Level', color: '#24D8ED' },
  { shapeName: 'Value', color: '#FF8746' },
];
