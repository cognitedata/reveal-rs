import { getWellSDKClient } from 'domain/wells/utils/authenticate';
import { convertToIdentifiers } from 'domain/wells/utils/convertToIdentifiers';

import { NptAggregate, NptAggregateEnum, Wellbore } from '@cognite/sdk-wells';

export const getNptAggregates = ({
  wellboreIds,
  groupBy,
}: {
  wellboreIds: Set<Wellbore['matchingId']>;
  groupBy: NptAggregateEnum[];
}) => {
  return getWellSDKClient()
    .npt.aggregate({
      filter: {
        wellboreIds: convertToIdentifiers(wellboreIds),
      },
      groupBy,
    })
    .then((response) => response.items as Array<NptAggregate>);
};
