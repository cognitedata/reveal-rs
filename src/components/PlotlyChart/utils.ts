import { DatapointAggregate, Datapoints, DoubleDatapoint } from '@cognite/sdk';

export function convertLineStyle(lineStyle?: 'solid' | 'dashed' | 'dotted') {
  switch (lineStyle) {
    case 'solid':
      return 'solid';
    case 'dashed':
      return 'dash';
    case 'dotted':
      return 'dot';
    default:
      return 'solid';
  }
}

export type PlotlyEventData = {
  [key: string]: any;
};

export type SeriesData = {
  id: string | undefined;
  type: string;
  range: number[] | undefined;
  name: string | undefined;
  color: string | undefined;
  width: number | undefined;
  dash: string;
  mode: string | undefined;
  unit: string | undefined;
  datapoints: Datapoints | DatapointAggregate[];
  outdatedData?: boolean;
};

export type AxisUpdate = {
  id: string;
  type: string;
  range: any[];
};

export function getYaxisUpdatesFromEventData(
  seriesData: SeriesData[],
  eventdata: PlotlyEventData
) {
  const axisUpdates: AxisUpdate[] = Object.values(
    Object.keys(eventdata)
      .filter((key) => key.includes('yaxis'))
      .reduce((result: { [key: string]: any }, key) => {
        const axisIndex = (+key.split('.')[0].split('yaxis')[1] || 1) - 1;
        const series = seriesData[axisIndex];
        const { id = '', type = '' } = series;
        const isAutoscale = key.includes('autorange');

        const range = isAutoscale
          ? []
          : ((result[id] || {}).range || []).concat(eventdata[key]);

        return {
          ...result,
          [id]: {
            ...(result[id] || {}),
            id,
            type,
            range,
          },
        };
      }, {})
  );

  return axisUpdates;
}

function getAutoScaleRange(seriesData: SeriesData[]) {
  let min: Date | undefined;
  let max: Date | undefined;

  seriesData.forEach((series) => {
    if (Array.isArray(series.datapoints)) {
      series.datapoints.forEach((datapoint) => {
        if ('timestamp' in datapoint) {
          if (min === undefined || datapoint.timestamp < min) {
            min = datapoint.timestamp;
          }
          if (max === undefined || datapoint.timestamp > max) {
            max = datapoint.timestamp;
          }
        }
      });
    }
  });

  min = min || new Date();
  max = max || new Date();

  return [min.toJSON(), max.toJSON()];
}

export function getXaxisUpdateFromEventData(
  seriesData: SeriesData[],
  eventdata: PlotlyEventData
): string[] {
  const xaxisKeys = Object.keys(eventdata).filter((key) =>
    key.includes('xaxis')
  );

  const isAutoscale = xaxisKeys.some((key) => key.includes('autorange'));

  const range = isAutoscale
    ? getAutoScaleRange(seriesData)
    : xaxisKeys.map((key) => new Date(eventdata[key]).toJSON());

  return range;
}

export function calculateStackedYRange(
  datapoints: (Datapoints | DatapointAggregate)[],
  index: number,
  numSeries: number
): number[] {
  const data = datapoints.map((datapoint) =>
    'average' in datapoint
      ? datapoint.average
      : (datapoint as DoubleDatapoint).value
  );

  const min = Math.min(...(data as number[]));
  const max = Math.max(...(data as number[]));
  const range = max - min;

  const lower = min - index * range;
  const upper = lower + numSeries * range;

  return [lower, upper];
}
