import { createLink } from '@cognite/cdf-utilities';
import { Metadata } from '@cognite/sdk';
import { message } from 'antd';
import { PredictionObject } from 'hooks/contextualization-api';
import {
  Dispatch,
  SetStateAction,
  useDebugValue,
  useState as reactUseState,
} from 'react';
import { styleScope } from 'styles/styleScope';

export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

export const createInternalLink = (path?: string | number) => {
  const mountPoint = window.location.pathname.split('/')[2];
  return createLink(`/${mountPoint}/${path || ''}`);
};

export function stringSorter<T extends Record<string, any>>(
  strA: T,
  strB: T,
  columnKey: keyof T
) {
  const a = strA[columnKey];
  const b = strB[columnKey];

  if (a.toLowerCase() < b.toLowerCase()) {
    return -1;
  } else if (b.toLowerCase() > a.toLowerCase()) {
    return 1;
  } else return 0;
}

export const stringContains = (value?: string, searchText?: string) => {
  if (!searchText) {
    return true;
  }
  try {
    return value && value.toUpperCase().search(searchText.toUpperCase()) >= 0;
  } catch (e) {
    message.error('Invalid search term');
    return 'Invalid search term';
  }
};

export const sleep = async (ms: number) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

export const formatPredictionObject = (o: PredictionObject): string => {
  return o.name || o.description || o.externalId || o.id.toString();
};

function useDebugState<S>(
  initialState: S | (() => S),
  label: string = 'unknown'
): [S, Dispatch<SetStateAction<S>>] {
  const [v, setV] = reactUseState<S>(initialState);
  useDebugValue(`${label}: ${JSON.stringify(v)}`);
  return [v, setV];
}

function useVanillaState<S>(
  initialState: S | (() => S),
  _: string = ''
): [S, Dispatch<SetStateAction<S>>] {
  return reactUseState<S>(initialState);
}

export const useContextState =
  process.env.NODE_ENV === 'production' ? useVanillaState : useDebugState;

/**
 * Transform all metadata keys to lowercase. This is convenient since metadata filters/aggregate are
 * case insensitive/down cased and this will make picking values out of metadata objects based on
 * aggregates a non-issue.
 */
export const downcaseMetadata = (md?: Metadata) => {
  return md
    ? Object.entries(md).reduce(
        (accl, [k, v]) => ({ ...accl, [k.toLowerCase()]: v }),
        {} as Metadata
      )
    : undefined;
};
