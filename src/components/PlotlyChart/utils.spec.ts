import { addMinutes } from 'date-fns';
import {
  getYaxisUpdatesFromEventData,
  getXaxisUpdateFromEventData,
  SeriesData,
} from './utils';

const seriesData: SeriesData[] = [
  {
    unit: 'PSI',
    range: [1459.8294756630028, 1491.8053766553744],
    series: [
      {
        id: 'VAL_RESERVOIR_PT_well01',
        type: 'timeseries',
        color: '#8E44AD',
        name: 'VAL_RESERVOIR_PT_well01',
        width: 2,
        dash: 'solid',
        mode: 'lines',
        datapoints: [
          { average: 1, timestamp: new Date('2021-01-01T00:00:00.000Z') },
          { average: 1, timestamp: new Date('2021-01-01T00:10:00.000Z') },
        ],
      },
    ],
  },
  {
    unit: 'PSI',
    range: [1456.247265175954, 1488.6541100613447],
    series: [
      {
        id: 'VAL_RESERVOIR_PT_well09',
        type: 'timeseries',
        color: '#e1b12c',
        name: 'VAL_RESERVOIR_PT_well09',
        width: 2,
        dash: 'solid',
        mode: 'lines',
        datapoints: [
          { average: 1, timestamp: new Date('2021-01-01T00:10:00.000Z') },
          { average: 1, timestamp: new Date('2021-01-01T00:20:00.000Z') },
        ],
      },
    ],
  },
  {
    unit: 'PSI',
    range: [1523.9999095776425, 1523.9999896001514],
    series: [
      {
        id: 'VAL_RESERVOIR_PT_well07',
        type: 'timeseries',
        name: 'VAL_RESERVOIR_PT_well07',
        color: '#0097e6',
        width: 2,
        dash: 'solid',
        mode: 'lines',
        datapoints: [
          { average: 1, timestamp: new Date('2021-01-01T00:00:00.000Z') },
          { average: 1, timestamp: new Date('2021-01-01T00:30:00.000Z') },
        ],
      },
    ],
  },
];

describe('getYaxisUpdatesFromEventData', () => {
  it('handles valid input', () => {
    const eventdata = {
      'xaxis.range[0]': '2021-01-02 10:14:11.8191',
      'xaxis.range[1]': '2021-02-14 09:17:59.1984',
      'yaxis.range[0]': 1465.6653548178783,
      'yaxis.range[1]': 1482.7808212612363,
      'yaxis2.range[0]': 1462.1617953274906,
      'yaxis2.range[1]': 1479.5079294146385,
      'yaxis3.range[0]': 1523.9999241824444,
      'yaxis3.range[1]': 1523.9999670154064,
    };

    const axisUpdates = getYaxisUpdatesFromEventData(seriesData, eventdata);

    expect(axisUpdates).toEqual([
      {
        id: 'VAL_RESERVOIR_PT_well01',
        type: 'timeseries',
        range: [1465.6653548178783, 1482.7808212612363],
      },
      {
        id: 'VAL_RESERVOIR_PT_well09',
        type: 'timeseries',
        range: [1462.1617953274906, 1479.5079294146385],
      },
      {
        id: 'VAL_RESERVOIR_PT_well07',
        type: 'timeseries',
        range: [1523.9999241824444, 1523.9999670154064],
      },
    ]);
  });

  it('handles valid input (2)', () => {
    const eventdata = {
      'yaxis.range[1]': 500,
    };

    const axisUpdates = getYaxisUpdatesFromEventData(seriesData, eventdata);

    expect(axisUpdates).toEqual([
      {
        id: 'VAL_RESERVOIR_PT_well01',
        type: 'timeseries',
        range: [1459.8294756630028, 500],
      },
    ]);
  });

  it('handles valid input (3)', () => {
    const eventdata = {
      'yaxis.range[0]': 500,
    };

    const axisUpdates = getYaxisUpdatesFromEventData(seriesData, eventdata);

    expect(axisUpdates).toEqual([
      {
        id: 'VAL_RESERVOIR_PT_well01',
        type: 'timeseries',
        range: [500, 1491.8053766553744],
      },
    ]);
  });

  it('handles empty input', () => {
    const eventdata = {};

    const axisUpdates = getYaxisUpdatesFromEventData(seriesData, eventdata);

    expect(axisUpdates).toEqual([]);
  });
});

describe('getXaxisUpdate', () => {
  it('handles valid input', () => {
    const eventdata = {
      'xaxis.range[0]': '2021-01-02 10:14:11.8191',
      'xaxis.range[1]': '2021-02-14 09:17:59.1984',
      'yaxis.range[0]': 1465.6653548178783,
      'yaxis.range[1]': 1482.7808212612363,
      'yaxis2.range[0]': 1462.1617953274906,
      'yaxis2.range[1]': 1479.5079294146385,
      'yaxis3.range[0]': 1523.9999241824444,
      'yaxis3.range[1]': 1523.9999670154064,
    };

    const axisUpdates = getXaxisUpdateFromEventData(eventdata);

    expect(axisUpdates).toEqual([
      addMinutes(
        new Date('2021-01-02T10:14:11.819Z'),
        new Date('2021-01-02T10:14:11.819Z').getTimezoneOffset()
      ).toJSON(),
      addMinutes(
        new Date('2021-02-14T09:17:59.198Z'),
        new Date('2021-02-14T09:17:59.198Z').getTimezoneOffset()
      ).toJSON(),
    ]);
  });

  it('handles empty input', () => {
    const eventdata = {};

    const axisUpdates = getXaxisUpdateFromEventData(eventdata);

    expect(axisUpdates).toEqual([]);
  });
});
