import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { getMockCurveOptions } from '__test-utils/fixtures/measurements';

import {
  mapStringCurvesToOptions,
  mapOptionsToCurves,
  extractSelectedCurvesFromOptions,
} from '../utils';

const curves = ['CP_POST', 'SHMIN_SHALE_ML_PRE'];
const curveOptions = [
  {
    label: 'CP_POST',
    value: 'CP_POST',
  },
  {
    label: 'SHMIN_SHALE_ML_PRE',
    value: 'SHMIN_SHALE_ML_PRE',
  },
];

const changeSomeOptions = [
  {
    value: {
      measurementType: 'geomechanics',
      columnExternalId: 'GEO',
      unit: 'psi',
      description: 'geomechanics',
    },
    label: 'GEO',
  },
  {
    value: {
      measurementType: 'geomechanics post drill',
      columnExternalId: 'GEO_POST_DRILL',
      unit: 'psi',
      description: 'geomechanics post drill',
    },
    label: 'GEO_POST_DRILL',
  },
];

const changeAllOptions = [
  {
    label: 'Curves',
    options: [
      {
        value: {
          measurementType: 'geomechanics',
          columnExternalId: 'GEO',
          unit: 'psi',
          description: 'geomechanics',
        },
        label: 'GEO',
      },
      {
        value: {
          measurementType: 'geomechanics pre drill',
          columnExternalId: 'GEO_PRE_DRILL',
          unit: 'psi',
          description: 'geomechanics pre drill',
        },
        label: 'GEO_PRE_DRILL',
      },
      {
        value: {
          measurementType: 'geomechanics post drill',
          columnExternalId: 'GEO_POST_DRILL',
          unit: 'psi',
          description: 'geomechanics post drill',
        },
        label: 'GEO_POST_DRILL',
      },
    ],
  },
];

describe('Measurement filter utils', () => {
  test('Should return curve options', () => {
    expect(mapStringCurvesToOptions(curves)).toEqual(curveOptions);
  });

  test('Should return curves from options', () => {
    expect(mapOptionsToCurves(curveOptions)).toEqual(curves);
  });
});

describe('extractSelectedCurvesFromOptions tests', () => {
  test('Should return same options since not a select all', () => {
    expect(
      extractSelectedCurvesFromOptions<DepthMeasurementColumn>(
        changeSomeOptions,
        getMockCurveOptions()
      )
    ).toEqual(changeSomeOptions);
  });

  test('Should return options of the first option since it is a select all )', () => {
    expect(extractSelectedCurvesFromOptions(changeAllOptions, [])).toEqual(
      getMockCurveOptions()
    );
  });
});
