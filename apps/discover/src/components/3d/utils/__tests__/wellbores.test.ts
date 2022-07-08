import { WellInternal } from 'domain/wells/well/internal/types';

import {
  getMockWell,
  mockedWellboreResultFixture,
  mockWellboreOptions,
} from '__test-utils/fixtures/well';

import { mapWellboresTo3D } from '../wellbores';

describe('mapWellboresTo3D', () => {
  it('should return wells in 3d format', () => {
    const wells: WellInternal[] = [
      { ...getMockWell(), wellbores: mockedWellboreResultFixture },
    ];
    const results = mapWellboresTo3D(wells);
    expect(results).toEqual([
      {
        description: 'wellbore B desc',
        id: '759155409324883',
        matchingId: '759155409324883',
        metadata: {
          bh_x_coordinate: '',
          bh_y_coordinate: '',
          elevation_type: 'KB',
          elevation_value: '',
          elevation_value_unit: '',
        },
        name: 'wellbore B',
        parentId: '1234',
        sources: [],
        wellId: '1234',
        wellMatchingId: '1234',
        ...mockWellboreOptions,
      },
      {
        metadata: {
          bh_x_coordinate: '',
          bh_y_coordinate: '',
          elevation_type: 'KB',
          elevation_value: '',
          elevation_value_unit: '',
        },
        name: 'wellbore A',
        id: '759155409324993',
        matchingId: '759155409324993',
        externalId: 'Wellbore A:759155409324993',
        wellId: '1234',
        wellMatchingId: '1234',
        description: 'wellbore A desc',
        sources: [
          {
            assetExternalId: 'Wellbore A:759155409324993',
            sourceName: 'Source A',
          },
        ],
        parentId: '1234',
        ...mockWellboreOptions,
      },
    ]);
  });
});
