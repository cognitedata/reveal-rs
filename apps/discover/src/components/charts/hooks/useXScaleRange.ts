import { useMemo } from 'react';

import compact from 'lodash/compact';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import isUndefined from 'lodash/isUndefined';

import { useCompare } from 'hooks/useCompare';

import { Accessors, ScaleRange } from '../types';
import { getRangeScaleFactor, getSumOfValuesOfObjectsByKey } from '../utils';

export const useXScaleRange = <T>({
  data,
  accessors,
  useGroupedValues = false,
  scaleFactor,
}: {
  data: T[];
  accessors: Accessors;
  useGroupedValues?: boolean;
  scaleFactor?: number;
}): ScaleRange => {
  const { x: xAccessor, y: yAccessor } = accessors;
  const [scaleFactorMin, scaleFactorMax] = getRangeScaleFactor(scaleFactor);

  const getGroupedValues = () => {
    const compactData = data.filter(
      (dataElement) => !isUndefined(get(dataElement, yAccessor))
    );
    const groupedData = groupBy(compactData, yAccessor);
    const xAxisValues = Object.keys(groupedData).map((key) =>
      getSumOfValuesOfObjectsByKey(groupedData[key], xAccessor)
    );
    return xAxisValues;
  };

  const getUngroupedValues = () => {
    const xAxisValues = compact(
      data.map((dataElement) => get(dataElement, xAccessor))
    );
    return xAxisValues;
  };

  return useMemo(() => {
    const xAxisValues = useGroupedValues
      ? getGroupedValues()
      : getUngroupedValues();

    const min = Math.floor(Math.min(...xAxisValues) * scaleFactorMin);
    const max = Math.ceil(Math.max(...xAxisValues) * scaleFactorMax);

    return [min, max];
  }, useCompare([data]));
};
