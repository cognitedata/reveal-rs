import { useMemo } from 'react';

import compact from 'lodash/compact';
import get from 'lodash/get';
import uniq from 'lodash/uniq';

import { useCompare } from 'hooks/useCompare';

export const useYScaleDomain = <T>(
  data: T[],
  yAccessor: string,
  yScaleDomainCustom?: string[]
) => {
  if (yScaleDomainCustom) return yScaleDomainCustom;

  return useMemo(() => {
    const yScaleValues = data.map((dataElement) => get(dataElement, yAccessor));
    return uniq(compact(yScaleValues));
  }, useCompare([data]));
};
