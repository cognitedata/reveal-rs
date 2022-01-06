import { useQuery, useQueryClient, UseQueryResult } from 'react-query';

import { Metrics } from '@cognite/metrics';

import { LOG_WELL_SEARCH, LOG_WELL_SEARCH_NAMESPACE } from 'constants/logging';
import { WELL_QUERY_KEY } from 'constants/react-query';
import { useDeepEffect } from 'hooks/useDeep';
import { TimeLogStages } from 'hooks/useTimeLog';

import {
  getAllByFilters,
  getByFilters,
  getWellsWithWellbores,
} from '../service';
import { Well } from '../types';
import { handleWellSearchError } from '../utils/wellSearch';

import { useCommonWellFilter } from './useCommonWellFilter';
import { useEnabledWellSdkV3 } from './useEnabledWellSdkV3';
import { useWellConfig } from './useWellConfig';

const wellSearchMetric = Metrics.create(LOG_WELL_SEARCH);

export const useAllWellSearchResultQuery = (): UseQueryResult<Well[]> => {
  const { data: wellConfig } = useWellConfig();
  const wellFilter = useCommonWellFilter();
  const queryClient = useQueryClient();

  useDeepEffect(() => {
    queryClient.invalidateQueries([WELL_QUERY_KEY.SEARCH, 'allWells']);
  }, [wellFilter]);

  return useQuery(
    [WELL_QUERY_KEY.SEARCH, 'allWells'],
    ({ signal }) => {
      return getAllByFilters(wellFilter, { signal });
    },
    {
      enabled: !wellConfig?.disabled,
    }
  );
};

export const useWellSearchResultQuery = (): UseQueryResult<Well[]> => {
  const wellFilter = useCommonWellFilter();
  const { data: wellConfig } = useWellConfig();
  const enabledWellSdkV3 = useEnabledWellSdkV3();

  return useQuery(
    [WELL_QUERY_KEY.SEARCH, wellFilter],
    () => {
      const timer = wellSearchMetric.start(LOG_WELL_SEARCH_NAMESPACE, {
        stage: TimeLogStages.Network,
      });

      return getByFilters(wellFilter)
        .then((wells) => {
          if (enabledWellSdkV3) return wells;
          return getWellsWithWellbores(wells);
        })
        .catch(handleWellSearchError)
        .finally(() => timer.stop());
    },
    {
      enabled: !wellConfig?.disabled,
    }
  );
};
