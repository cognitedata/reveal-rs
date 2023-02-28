import { createLink } from '@cognite/cdf-utilities';
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
