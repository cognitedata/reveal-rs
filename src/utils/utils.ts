import { ids } from 'cogs-variables';
import isEqual from 'lodash/isEqual';

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(ids.styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

export const sleep = (milliseconds: number) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export const abbreviateNumber = (n: number) => {
  if (n < 1e3) return n;
  if (n >= 1e3 && n < 1e6) return `${+(n / 1e3).toFixed(1)}K`;
  if (n >= 1e6 && n < 1e9) return `${+(n / 1e6).toFixed(1)}M`;
  if (n >= 1e9 && n < 1e12) return `${+(n / 1e9).toFixed(1)}B`;
  if (n >= 1e12) return `${+(n / 1e12).toFixed(1)}T`;
  return n;
};

export const mapArrayToObj = <T>(key: keyof T, items: T[]) => {
  return items.reduce(
    (acc, cur) => ({ ...acc, [cur[key] as unknown as string]: cur }),
    {}
  );
};

export const getUniqueValuesArray = <T>(arr: T[]): T[] =>
  arr.reduce((accl: T[], item: T) => {
    if (!accl.find((newItem) => isEqual(item, newItem))) accl.push(item);
    return accl;
  }, [] as T[]);
