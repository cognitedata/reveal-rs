import {
  Aggregate,
  CogniteClient,
  DatapointAggregate,
  Timeseries,
} from '@cognite/sdk';

import { subDays } from 'date-fns';
import { Chart } from 'reducers/charts/types';

const OUTLIER_THRESHOLD = 1000;

const filterOutliers = (someArray: number[], threshold = 1.5) => {
  if (someArray.length < 4) {
    return someArray;
  }
  const values = [...someArray].slice().sort((a, b) => a - b);
  let q1;
  let q3;
  if ((values.length / 4) % 1 === 0) {
    // find quartiles
    q1 = (1 / 2) * (values[values.length / 4] + values[values.length / 4 + 1]);
    q3 =
      (1 / 2) *
      (values[values.length * (3 / 4)] + values[values.length * (3 / 4) + 1]);
  } else {
    q1 = values[Math.floor(values.length / 4 + 1)];
    q3 = values[Math.ceil(values.length * (3 / 4) + 1)];
  }

  const iqr = q3 - q1;
  const maxValue = q3 + iqr * threshold;
  const minValue = q1 - iqr * threshold;

  return values.filter((x) => x >= minValue && x <= maxValue);
};

export const roundToSignificantDigits = (value: number, digits: number) => {
  if (value === undefined) return undefined;
  const [_, fraction] = value.toString().split('.');
  if (fraction === undefined) return value;
  let zeros = 10;
  for (let i = 0; i < digits - 1; i += 1) {
    zeros *= 10;
  }
  for (let i = 0; i < fraction.length; i += 1) {
    if (fraction[i] === '0') {
      zeros *= 10;
    } else {
      break;
    }
  }
  return Math.round(value * zeros) / zeros;
};

export async function calculateDefaultYAxis({
  sdk,
  chart,
  timeSeries,
}: {
  sdk: CogniteClient;
  chart: Chart;
  timeSeries: Timeseries;
}) {
  const dateFrom = subDays(new Date(chart.dateTo), 365);
  const dateTo = new Date(chart.dateTo);

  const lastYearDatapointsQuery = {
    items: [{ id: timeSeries.id }],
    start: dateFrom,
    end: dateTo,
    aggregates: ['average'] as Aggregate[],
    granularity: '1h',
    limit: 8760, // 365 days * 24 hours = 1 year in hours
  };

  const lastYearDatapoints = await sdk.datapoints
    .retrieve(lastYearDatapointsQuery)
    .then((r) => r[0]?.datapoints);

  const lastYearDatapointsSorted = (lastYearDatapoints as DatapointAggregate[])
    .map((datapoint: DatapointAggregate) => datapoint.average)
    .filter((value: number | undefined) => value !== undefined)
    .sort() as number[];

  const filteredSortedDatapoints = filterOutliers(
    lastYearDatapointsSorted,
    OUTLIER_THRESHOLD
  );

  const roundedMin = roundToSignificantDigits(filteredSortedDatapoints[0], 3);
  const roundedMax = roundToSignificantDigits(
    filteredSortedDatapoints[filteredSortedDatapoints.length - 1],
    3
  );

  const isValidRange =
    !Number.isNaN(roundedMin) &&
    !Number.isNaN(roundedMax) &&
    typeof roundedMin === 'number' &&
    typeof roundedMax === 'number';

  const range = isValidRange ? [roundedMin, roundedMax] : [];

  return range as number[];
}
