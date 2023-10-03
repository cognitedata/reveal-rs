import { useChartAtom } from '../../../../models/chart/atom';
import { useScheduledCalculationDataValue } from '../../../../models/scheduled-calculation-results/atom';
import {
  getTsExternalIdsFromScheduledCalculations,
  getTsIdsFromTsCollection,
} from '../transformers/getTsIds';

export const useGetTsExternalIdsFromScheduledCalculations = () => {
  const scheduledCalculationsData = useScheduledCalculationDataValue();
  return getTsExternalIdsFromScheduledCalculations(scheduledCalculationsData);
};

export const useGetTsIdsFromTimeseriesCollection = () => {
  const [chart] = useChartAtom();
  return getTsIdsFromTsCollection(chart);
};
