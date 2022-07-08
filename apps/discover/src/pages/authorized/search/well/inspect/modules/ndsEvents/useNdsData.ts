import { useNdsWithTvdData } from 'domain/wells/nds/internal/hooks/useNdsWithTvdData';
import { useNdsAggregatesSummaryQuery } from 'domain/wells/nds/internal/queries/useNdsAggregatesSummaryQuery';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboreIds';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellbores';

import keyBy from 'lodash/keyBy';

import { useDeepMemo } from 'hooks/useDeep';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';

import { processNdsData } from './utils/processNdsData';

export const useNdsData = () => {
  const wellbores = useWellInspectSelectedWellbores();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const wellboreMatchingIdMap = keyBy(wellbores, 'matchingId');
  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const { data: ndsData, isLoading } = useNdsWithTvdData({
    wellboreIds,
  });

  const { data: ndsAggregates } = useNdsAggregatesSummaryQuery(wellboreIds);

  const processedData = useDeepMemo(() => {
    if (!ndsData) {
      return [];
    }

    return ndsData.map((nds) => {
      const { wellboreMatchingId } = nds;
      const wellbore = wellboreMatchingIdMap[wellboreMatchingId];

      return processNdsData(nds, wellbore);
    });
  }, [ndsData, userPreferredUnit]);

  return {
    isLoading,
    data: processedData,
    ndsAggregates: ndsAggregates || {},
  };
};
