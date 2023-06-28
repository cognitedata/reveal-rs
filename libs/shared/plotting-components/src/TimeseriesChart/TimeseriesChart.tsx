import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';

import difference from 'lodash/difference';

import { PlotRange } from '../LineChart';

import { DateRangePicker } from './components/DateRangePicker';
import { OpenInChartsButton } from './components/OpenInChartsButton';
import { TimePeriods } from './components/TimePeriods';
import { TimePeriodSelect } from './components/TimePeriodSelect';
import { DEFAULT_DATE_RANGE, TIME_PERIOD_OPTIONS } from './constants';
import { useTimeseriesChartData } from './domain/internal/hooks/useTimeseriesChartData';
import {
  DateRange,
  TimePeriod,
  TimeseriesChartProps,
  UpdateTimePeriodProps,
} from './types';
import { formatDateRangeForAxis } from './utils/formatDateRangeForAxis';
import { getChartByVariant } from './utils/getChartByVariant';

export const TimeseriesChart: React.FC<TimeseriesChartProps> = ({
  timeseriesId,
  variant = 'large',
  numberOfPoints,
  quickTimePeriodOptions = [],
  dateRange: dateRangeProp = DEFAULT_DATE_RANGE,
  height,
  dataFetchOptions,
  autoRange,
  onChangeTimePeriod,
  onChangeDateRange,
  hideActions,
  styles,
}) => {
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod>();
  const [dateRange, setDateRange] = useState<DateRange>(dateRangeProp);

  const { data, metadata, isLoading } = useTimeseriesChartData({
    query: {
      timeseriesId,
      dateRange,
      numberOfPoints,
    },
    dataFetchOptions,
  });

  const timePeriodSelectOptions = useMemo(() => {
    return difference(TIME_PERIOD_OPTIONS, quickTimePeriodOptions);
  }, [quickTimePeriodOptions]);

  const chartRange = useMemo(() => {
    if (autoRange) {
      return undefined;
    }
    return {
      x: formatDateRangeForAxis(dateRange),
    };
  }, [autoRange, dateRange]);

  const handleChangeTimePeriod = (props: UpdateTimePeriodProps) => {
    setSelectedTimePeriod(props.timePeriod);
    setDateRange(props.dateRange);
    onChangeTimePeriod?.(props);
  };

  const handleChangeDateRange = (newDateRange: DateRange) => {
    setSelectedTimePeriod(undefined);
    setDateRange(newDateRange);
    onChangeDateRange?.(newDateRange);
  };

  const handleRangeChange = (range: PlotRange) => {
    const [from, to] = range.x;
    setSelectedTimePeriod(undefined);
    setDateRange([new Date(from), new Date(to)]);
  };

  useEffect(() => {
    setSelectedTimePeriod(undefined);
    setDateRange(dateRangeProp);
  }, [dateRangeProp, timeseriesId]);

  const Chart = getChartByVariant(variant);

  return (
    <Chart
      data={data}
      metadata={metadata}
      dataRevision={timeseriesId}
      isLoading={isLoading}
      range={chartRange}
      style={{ height, ...styles }}
      onRangeChange={handleRangeChange}
      renderFilters={() => [
        <TimePeriods
          options={quickTimePeriodOptions}
          value={selectedTimePeriod}
          onChange={handleChangeTimePeriod}
        />,
        <TimePeriodSelect
          options={timePeriodSelectOptions}
          value={selectedTimePeriod}
          onChange={handleChangeTimePeriod}
        />,
        <DateRangePicker value={dateRange} onChange={handleChangeDateRange} />,
      ]}
      renderActions={
        hideActions
          ? undefined
          : () => [
              <OpenInChartsButton
                timeseriesId={timeseriesId}
                dateRange={dateRange}
              />,
            ]
      }
    />
  );
};
