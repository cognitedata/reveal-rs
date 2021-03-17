import { nanoid } from 'nanoid';
import { Chart, ChartTimeSeries, ChartWorkflow } from 'reducers/charts/types';
import {
  addTimeseries,
  addWorkflow,
  duplicate,
  removeTimeseries,
  removeWorkflow,
  updateTimeseries,
  updateWorkflow,
} from './charts';

describe('charts util', () => {
  const id = nanoid();
  const chart: Chart = {
    id,
    version: 1,
    name: 'test chart',
    user: 'user_1@example.org',
    updated: 1615976865123,
    created: 1615976863997,
    public: true,
    dateFrom: 'then',
    dateTo: 'now',
  };
  describe('duplicate', () => {
    it('should update the appropriate fields', () => {
      expect(duplicate(chart, 'user_2@example.org').public).toBe(false);
      expect(duplicate(chart, 'user_2@example.org').user).toEqual(
        'user_2@example.org'
      );
      expect(duplicate(chart, 'user_2@example.org').name).toEqual(
        'test chart Copy'
      );
      expect(duplicate(chart, 'user_2@example.org').id).not.toEqual(id);
      expect(duplicate(chart, 'user_2@example.org').created).not.toEqual(chart.created);
      expect(duplicate(chart, 'user_2@example.org').updated).not.toEqual(chart.updated);
    });
    it('should not update the other fields', () => {
      expect(duplicate(chart, 'user_2@example.org').dateFrom).toEqual('then');
      expect(duplicate(chart, 'user_2@example.org').dateTo).toEqual('now');
      expect(duplicate(chart, 'user_2@example.org').version).toEqual(1);
    });
  });
  describe('ChartTimerseries functions', () => {
    const ts: ChartTimeSeries = {
      id: '42',
      name: 'ts1',
      color: 'red',
      enabled: true,
      tsId: 42,
    };
    const chartWithTS: Chart = {
      ...chart,
      timeSeriesCollection: [ts],
    };
    describe('updateTimeseries', () => {
      it('should do nothing for unknown ts', () => {
        expect(updateTimeseries(chart, 'foo', { color: 'red' })).toEqual(chart);
        expect(
          updateTimeseries(
            {
              ...chart,
              timeSeriesCollection: [],
            },
            '42',
            { color: 'red' }
          )
        ).toEqual({
          ...chart,
          timeSeriesCollection: [],
        });
      });
      it('should update existing ts', () => {
        expect(
          updateTimeseries(chartWithTS, '42', { color: 'blue', enabled: false })
        ).toEqual({
          ...chart,
          timeSeriesCollection: [
            {
              ...ts,
              enabled: false,
              color: 'blue',
            },
          ],
        });
      });
    });
    describe('removeTimeseries', () => {
      it('should remove time series, if found', () => {
        expect(removeTimeseries(chartWithTS, '42')).toEqual({
          ...chart,
          timeSeriesCollection: [],
        });
      });
      it('should remove return an unchanged chart for unknown ids', () => {
        expect(removeTimeseries(chartWithTS, '44')).toEqual(chartWithTS);
      });
    });
    describe('addTimeseries', () => {
      it('should add timeseries to charts', () => {
        expect(addTimeseries(chart, ts)).toEqual(chartWithTS);
      });
    });
  });

  describe('ChartWorkflow functions', () => {
    const wf: ChartWorkflow = {
      id: '42',
      name: 'ts1',
      color: 'red',
      enabled: true,
    };
    const chartWithWF: Chart = {
      ...chart,
      workflowCollection: [wf],
    };
    describe('updateWorkflow', () => {
      it('should do nothing for unknown wf', () => {
        expect(updateWorkflow(chart, 'foo', { color: 'red' })).toEqual(chart);
        expect(
          updateWorkflow(
            {
              ...chart,
              workflowCollection: [],
            },
            '42',
            { color: 'red' }
          )
        ).toEqual({
          ...chart,
          workflowCollection: [],
        });
      });
      it('should update existing ts', () => {
        expect(
          updateWorkflow(chartWithWF, '42', { color: 'blue', enabled: false })
        ).toEqual({
          ...chart,
          workflowCollection: [
            {
              ...wf,
              enabled: false,
              color: 'blue',
            },
          ],
        });
      });
    });
    describe('removeWorkflow', () => {
      it('should remove time series, if found', () => {
        expect(removeWorkflow(chartWithWF, '42')).toEqual({
          ...chart,
          workflowCollection: [],
        });
      });
      it('should remove return an unchanged chart for unknown ids', () => {
        expect(removeWorkflow(chartWithWF, '44')).toEqual(chartWithWF);
      });
    });
    describe('addWorkflow', () => {
      it('should add timeseries to charts', () => {
        expect(addWorkflow(chart, wf)).toEqual(chartWithWF);
      });
    });
  });
});
