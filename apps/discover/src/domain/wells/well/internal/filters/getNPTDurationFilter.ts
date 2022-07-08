import { filters } from 'domain/wells/well/internal/filters';

import isEmpty from 'lodash/isEmpty';
import isObject from 'lodash/isObject';

import { WellFilter } from '@cognite/sdk-wells';

export const getNPTDurationFilter = (
  value: unknown
): Pick<WellFilter, 'npt'> => {
  if (isEmpty(value)) {
    return {};
  }

  if (isObject(value)) {
    return {
      npt: {
        exists: true,
        duration: filters.toHourRange(value),
      },
    };
  }

  return {};
};
