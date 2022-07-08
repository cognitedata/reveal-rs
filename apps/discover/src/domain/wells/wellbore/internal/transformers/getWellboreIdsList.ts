import { WellInternal } from 'domain/wells/well/internal/types';

import { WellboreId } from 'modules/wellSearch/types';

export const getWellboreIdsList = (wells?: WellInternal[]) => {
  if (!wells) {
    return [];
  }

  return wells.reduce((list: WellboreId[], currentWell) => {
    if (!currentWell?.wellbores) {
      return list;
    }

    return [
      ...list,
      ...currentWell.wellbores.map(({ matchingId }) => matchingId),
    ];
  }, []);
};
