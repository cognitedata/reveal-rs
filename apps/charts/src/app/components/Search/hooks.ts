import { useRecoilState } from 'recoil';

import { Timeseries } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { useAddToRecentLocalStorage } from '../../hooks/recently-used';
import chartAtom from '../../models/chart/atom';
import {
  removeTimeseries,
  convertTSToChartTS,
  addTimeseries,
  updateSourceAxisForChart,
} from '../../models/chart/updates';
import { calculateDefaultYAxis } from '../../utils/axis';
import { AxisUpdate } from '../PlotlyChart/utils';

export const useAddRemoveTimeseries = () => {
  const sdk = useSDK();
  const [chart, setChart] = useRecoilState(chartAtom);
  const { addAssetToRecent, addTimeseriesToRecent } =
    useAddToRecentLocalStorage();

  return async (
    ts: Pick<
      Timeseries,
      | 'assetId'
      | 'id'
      | 'externalId'
      | 'name'
      | 'unit'
      | 'isStep'
      | 'description'
    >
  ) => {
    if (!chart) {
      return;
    }

    const tsToRemove = chart.timeSeriesCollection?.find(
      (t) => t.tsExternalId === ts.externalId
    );

    if (tsToRemove) {
      setChart((oldChart) => removeTimeseries(oldChart!, tsToRemove.id));
    } else {
      const newTs = convertTSToChartTS(ts, chart.id, []);
      setChart((oldChart) => addTimeseries(oldChart!, newTs));

      if (ts.assetId) {
        // add both asset and ts if asset exists
        addAssetToRecent(ts.assetId, ts.id);
      } else {
        addTimeseriesToRecent(ts.id);
      }

      // Calculate y-axis / range
      const range = await calculateDefaultYAxis({
        chart,
        sdk,
        timeSeriesExternalId: ts.externalId || '',
      });

      const axisUpdate: AxisUpdate = {
        id: newTs.id,
        type: 'timeseries',
        range,
      };

      // Update y axis when ready
      setChart((oldChart) =>
        updateSourceAxisForChart(oldChart!, { x: [], y: [axisUpdate] })
      );
    }
  };
};
