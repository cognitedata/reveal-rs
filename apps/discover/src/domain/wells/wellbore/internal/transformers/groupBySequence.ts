import groupBy from 'lodash/groupBy';

import { SequenceSource, Wellbore } from '@cognite/sdk-wells';

export const groupBySequence = <T extends { source: SequenceSource }>(
  items: T[]
): Record<Wellbore['matchingId'], T[]> =>
  groupBy(items, 'source.sequenceExternalId');
