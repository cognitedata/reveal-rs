import { TooltipRendererProps } from '../../../../LineChart';
import { TimeseriesDatapoint } from '../../../domain/service/types';
import { getFormattedDateWithTimezone } from '../../../utils/getFormattedDateWithTimezone';
import { getTooltipNumericValue } from '../../../utils/getTooltipNumericValue';

export const formatTooltipContent = ({ customData }: TooltipRendererProps) => {
  const datapoint = customData as TimeseriesDatapoint;

  if ('value' in datapoint) {
    return [{ label: 'Value', value: datapoint.value }];
  }

  const { average, timestamp } = datapoint;

  return [
    { label: 'Average', value: getTooltipNumericValue(average) },
    { label: 'Date', value: getFormattedDateWithTimezone(timestamp) },
  ];
};
