import { useState } from 'react';
import { useQuery, useQueryClient } from 'react-query';

import { LOG_CASING, LOG_WELLS_CASING_NAMESPACE } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useMetricLogger, TimeLogStages } from 'hooks/useTimeLog';
import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/hooks/useWellInspect';
import {
  useWellInspectWellboreAssetIdMap,
  useWellInspectWellboreExternalIdMap,
} from 'modules/wellInspect/hooks/useWellInspectIdMap';

import { getCasingByWellboreIds } from '../service';
import { WellboreSequencesMap } from '../types';
import { trimCachedData } from '../utils/common';

import { useEnabledWellSdkV3 } from './useEnabledWellSdkV3';
import { useWellConfig } from './useWellConfig';

export const useSelectedWellboresCasingsQuery = () => {
  const enabledWellSDKV3 = useEnabledWellSdkV3();
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const { data: config } = useWellConfig();
  const wellboreAssetIdMap = useWellInspectWellboreAssetIdMap();
  const wellboresSourceExternalIdMap = useWellInspectWellboreExternalIdMap();
  const cache = useQueryClient();
  const [fetchingNewData, setFetchingNewData] = useState<boolean>(false);
  const metricLogger = useMetricLogger(
    LOG_CASING,
    TimeLogStages.Network,
    LOG_WELLS_CASING_NAMESPACE
  );
  const newDataMetricLogger = useMetricLogger(
    LOG_CASING,
    TimeLogStages.Network,
    LOG_WELLS_CASING_NAMESPACE
  );

  // Do the initial search with react-query
  const { data, isLoading } = useQuery(WELL_QUERY_KEY.CASINGS, () =>
    getCasingByWellboreIds(
      wellboreIds,
      wellboreAssetIdMap,
      wellboresSourceExternalIdMap,
      config?.casing?.queries?.[0],
      metricLogger,
      enabledWellSDKV3
    )
  );

  if (isLoading || !data) {
    return { isLoading: true };
  }

  // Check if there are ids not in the cached data. Also filter cached data by requested ids
  const { newIds, trimmedData } = trimCachedData(data, wellboreIds);
  if (newIds.length === 0) {
    return { data: trimmedData as WellboreSequencesMap };
  }

  // If there are ids not in the cached data, do a search for new ids and update the cache
  if (newIds.length && !fetchingNewData) {
    setFetchingNewData(true);
    getCasingByWellboreIds(
      newIds,
      wellboreAssetIdMap,
      wellboresSourceExternalIdMap,
      config?.casing?.queries?.[0],
      newDataMetricLogger,
      enabledWellSDKV3
    ).then((response) => {
      cache.setQueryData(WELL_QUERY_KEY.CASINGS, {
        ...response,
        ...data,
      });
      setFetchingNewData(false);
    });
  }

  return { isLoading: true };
};
