import 'services/wellSearch/__mocks/setupWellsMockSDK';
import flatten from 'lodash/flatten';
import { setupServer } from 'msw/node';
import {
  getMockDepthMeasurements,
  getMockDepthMeasurementData,
  getMockDepthMeasurementDataRejectAll,
} from 'services/well/measurements/__mocks/mockMeasurements';

import { getMeasurementsByWellboreIds } from '../measurementsV3';

const mockServer = setupServer(
  getMockDepthMeasurements(),
  getMockDepthMeasurementData()
);

const mockServerWithErrorApiCalls = setupServer(
  getMockDepthMeasurements(),
  getMockDepthMeasurementDataRejectAll()
);

describe('Measurement service', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  test('fetch measurments', async () => {
    const matchingIds = ['pequin-wellbore-OMN2000002000'];
    const result = await getMeasurementsByWellboreIds(matchingIds, {
      measurements: { enabled: true },
    });
    expect(result).not.toBeUndefined();
    const wellMeasurements = result[matchingIds[0]];
    expect(wellMeasurements.length).toBe(1);
    expect(wellMeasurements[0].data?.rows).not.toBe([]);
  });
});

describe('Measurement service with error codes', () => {
  beforeAll(() => mockServerWithErrorApiCalls.listen());
  afterAll(() => mockServerWithErrorApiCalls.close());

  test('fetch measurments while 50% of row data calls failing', async () => {
    const matchingIds = ['pequin-wellbore-OMN2000002000'];
    const result = await getMeasurementsByWellboreIds(matchingIds, {
      measurements: { enabled: true },
    });
    expect(result).not.toBeUndefined();
    const wellMeasurements = result[matchingIds[0]];
    expect(wellMeasurements.length).toBe(1);

    const errors = flatten(Object.values(result))
      .filter((measurement) => measurement.errors)
      .map((result) => result.errors);
    expect(errors).not.toEqual([]);
  });
});
