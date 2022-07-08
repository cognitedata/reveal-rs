import keyBy from 'lodash/keyBy';

import { Wellbore } from '@cognite/sdk-wells';

export const keyByWellbore = <T extends { wellboreMatchingId: string }>(
  items: T[]
): Record<Wellbore['matchingId'], T> => keyBy(items, 'wellboreMatchingId');
