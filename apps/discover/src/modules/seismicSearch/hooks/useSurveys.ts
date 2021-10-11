import { useQuery, QueryClient, useQueryClient } from 'react-query';

import { getTenantInfo } from '@cognite/react-container';

import { FetchHeaders } from '_helpers/fetch';
import { SURVEYS_QUERY_KEY } from 'constants/react-query';
import { SeismicError } from 'modules/api/seismic';
import { discoverAPI, getJsonHeaders } from 'modules/api/service';
import { SeismicGetData } from 'modules/api/types';

import { SeismicSurveyContainer } from '../types';

export const getSurveyKey = (surveyId: string) => ['survey', surveyId];

export const updateOneSurveyInList = (
  queryClient: QueryClient,
  surveyData: SeismicGetData,
  allSurveyData: SeismicSurveyContainer[]
) => {
  const newData = allSurveyData.map((survey) => {
    return {
      ...survey,
      geometry: surveyData.survey.geometry,
    };
  });

  queryClient.setQueryData(SURVEYS_QUERY_KEY, newData);
};

export const getSurveys = () => {
  return useQueryClient().getQueryData<SeismicSurveyContainer[]>(
    SURVEYS_QUERY_KEY
  );
};

export const useSurveys = () => {
  const [tenant] = getTenantInfo();
  const headers = getJsonHeaders();

  return useQuery<SeismicSurveyContainer[], SeismicError>(
    SURVEYS_QUERY_KEY,
    () => discoverAPI.seismic.search(headers, tenant),
    {
      // retry: false,
      enabled: true,

      // cacheTime: 1, // always retry because it is based on 'current'
      // staleTime: 1,

      // new trial, NEVER cache, wait till we remove the current cache:
      cacheTime: Infinity, // always retry because it is based on 'current'
      staleTime: Infinity,
    }
  );
};

export const prefetchSurveys = (
  headers: FetchHeaders,
  queryClient: QueryClient
) => {
  const [tenant] = getTenantInfo();

  // console.log('prefetchSurveys');
  return queryClient.prefetchQuery(SURVEYS_QUERY_KEY, () =>
    discoverAPI.seismic.search(headers, tenant)
  );
  // return seismic
  //   .search()
  //   .then((result) => queryCache.setQueryData(SURVEYS, result));
};

// expand on one in the results list, showing all the files for it etc.
export const useSurvey = (surveyId: string) => {
  const headers = getJsonHeaders();
  const [tenant] = getTenantInfo();

  return useQuery<SeismicGetData | SeismicError>(
    getSurveyKey(surveyId),
    () => discoverAPI.seismic.get(surveyId, headers, tenant),
    {
      retry: false,
      enabled: !!surveyId,
    }
  );
};

// NOTE: NOT SURE IF THIS WORKS!!
export const resetSurveyCache = async () => {
  // console.log('resetSurveyCache invalidateQueries');
  await useQueryClient().invalidateQueries(SURVEYS_QUERY_KEY);
};
