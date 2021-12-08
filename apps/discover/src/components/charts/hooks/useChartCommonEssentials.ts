import { useCallback, useEffect, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

import { useCompare } from 'hooks/useCompare';

import { AxisPlacement, XAxisPlacement } from '../common/Axis';
import { LegendCheckboxState, LegendProps } from '../common/Legend';
import { getLegendInitialCheckboxState } from '../common/Legend/utils';
import {
  DEFAULT_MARGINS,
  DEFAULT_X_AXIS_PLACEMENT,
  DEFAULT_X_AXIS_SPACING,
  DEFAULT_Y_AXIS_SPACING,
} from '../constants';
import { BaseChartOptions, ChartAxis } from '../types';
import {
  filterUndefinedValues,
  getDefaultColorConfig,
  getFilteredData,
} from '../utils';

export const useChartCommonEssentials = <T>({
  dataOriginal,
  xAxis,
  yAxis,
  options,
  onUpdate,
}: {
  dataOriginal: T[];
  xAxis: ChartAxis & XAxisPlacement;
  yAxis: ChartAxis;
  options: BaseChartOptions<T> & any;
  onUpdate?: () => void;
}) => {
  const data = useMemo(
    () => filterUndefinedValues<T>(dataOriginal, yAxis.accessor),
    useCompare([dataOriginal])
  );

  const [filteredData, setFilteredData] = useState<T[]>(data);
  const [legendCheckboxState, setLegendCheckboxState] =
    useState<LegendCheckboxState>({});

  const margins = { ...DEFAULT_MARGINS, ...options?.margins };

  const xAccessor = xAxis.accessor;
  const yAccessor = yAxis.accessor;
  const accessors = { x: xAccessor, y: yAccessor };

  const xAxisPlacement = xAxis.placement || DEFAULT_X_AXIS_PLACEMENT;
  const isXAxisOnTop = xAxisPlacement === AxisPlacement.Top;

  const spacings = {
    x: xAxis.spacing || DEFAULT_X_AXIS_SPACING,
    y: yAxis.spacing || DEFAULT_Y_AXIS_SPACING,
  };

  const colorConfig =
    options?.colorConfig ||
    getDefaultColorConfig(options?.legendOptions?.accessor);

  const isolateLegend = !isUndefined(options?.legendOptions?.isolate)
    ? options?.legendOptions?.isolate
    : true;

  const chartOffsetBottom =
    isolateLegend && options?.legendOptions?.overlay && isXAxisOnTop
      ? spacings.y
      : undefined;

  const initialCheckboxState: LegendCheckboxState = useMemo(() => {
    if (isEmpty(data) || isUndefined(colorConfig)) return {};
    return getLegendInitialCheckboxState<T>(data, colorConfig.accessor);
  }, useCompare([data]));

  const onChangeLegendCheckbox = useCallback(
    (option: string, checked: boolean) => {
      if (isUndefined(colorConfig)) return;

      const updatedCheckboxState = {
        ...legendCheckboxState,
        [option]: checked,
      };

      const filteredData = getFilteredData<T>(
        data,
        colorConfig.accessor,
        updatedCheckboxState
      );

      setLegendCheckboxState(updatedCheckboxState);
      setTimeout(() => setFilteredData(filteredData));

      if (onUpdate) onUpdate();
    },
    useCompare([data, legendCheckboxState])
  );

  const handleResetToDefault = useCallback(() => {
    setFilteredData(data);
    setLegendCheckboxState(initialCheckboxState);
    if (onUpdate) onUpdate();
  }, useCompare([data]));

  useEffect(() => {
    setFilteredData(data);
    setLegendCheckboxState(initialCheckboxState);
  }, useCompare([data]));

  const legendProps: LegendProps = {
    legendCheckboxState,
    onChangeLegendCheckbox,
    colorConfig,
    isolateLegend,
    legendOptions: options?.legendOptions,
  };

  return useMemo(
    () => ({
      data,
      filteredData,
      margins,
      xAccessor,
      yAccessor,
      accessors,
      xAxisPlacement,
      legendProps,
      colorConfig,
      chartOffsetBottom,
      spacings,
      handleResetToDefault,
    }),
    useCompare([data, filteredData, legendCheckboxState])
  );
};
