import isObject from 'lodash/isObject';
import startCase from 'lodash/startCase';

import { formatDate } from '@cognite/cogs.js';
import { DateRange, Metadata } from '@cognite/sdk';

import { METADATA_ALL_VALUE, TFunction } from '@data-exploration-lib/core';
import {
  NIL_FILTER_VALUE,
  NIL_FILTER_LABEL,
} from '@data-exploration-lib/domain-layer';

import { CUSTOM_FILTER_TITLE } from './constants';

export const getTitle = (input: string) => {
  return CUSTOM_FILTER_TITLE[input] || startCase(input);
};

// Not really sure where to put this type, leaving it here for now.
type FilterValues =
  | {
      label?: string | undefined;
      value: number;
    }
  | string
  | Metadata
  | DateRange
  | number
  | boolean
  | undefined;

export const formatValue = (
  input: FilterValues = undefined,
  t: TFunction
): string => {
  if (input === undefined) {
    return '';
  }

  if (typeof input === 'boolean') {
    return input ? t('TRUE', 'True') : t('FAlSE', 'False');
  }

  if (typeof input === 'string') {
    if (input === NIL_FILTER_VALUE) {
      return t('NOT_AVAILABLE', NIL_FILTER_LABEL);
    }

    return input;
  }

  if (typeof input === 'number') {
    return String(input);
  }

  if ('min' in input || 'max' in input) {
    if (input.min && input.max) {
      return `${formatDate(input.min as number)} - ${formatDate(
        input.max as number
      )}`;
    }

    if (input.min) {
      return t('AFTER_DATE', `After ${formatDate(input.min as number)}`, {
        date: formatDate(input.min as number),
      });
    }

    if (input.max) {
      return t('BEFORE_DATE', `Before ${formatDate(input.max as number)}`, {
        date: formatDate(input.min as number),
      });
    }
  }

  if ('key' in input && 'value' in input) {
    if (input.value === METADATA_ALL_VALUE) {
      return `${input.key}`;
    }
    return `${input.key}=${input.value}`;
  }

  if ('label' in input || 'value' in input) {
    return input.label || String(input.value);
  }

  if (isObject(input)) {
    return Object.entries(input)
      .map(([key, value]) => {
        return `${key}=${value}`;
      })
      .join(', ');
  }

  return JSON.stringify(input);
};
