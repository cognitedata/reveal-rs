import { useGeoFilter } from 'modules/map/selectors';
import {
  useAppliedDocumentFilters,
  useAppliedDocumentMapLayerFilters,
  useAppliedMapGeoJsonFilters,
  useSearchPhrase,
} from 'modules/sidebar/selectors';

import { useExtractParentFolderPath } from '../selectors';
import { SearchQueryFull } from '../types';

import { useDocumentConfig } from './useDocumentConfig';

export const useDocumentSearchQueryFull = (): SearchQueryFull => {
  const searchPhrase = useSearchPhrase();
  const documentFilters = useAppliedDocumentFilters();
  const geoFilter = useGeoFilter();
  const extraGeoJsonFilters = useAppliedMapGeoJsonFilters();
  const extraDocumentFilters = useAppliedDocumentMapLayerFilters();

  const { data: documentConfig } = useDocumentConfig();
  const extractParentFolderPath = useExtractParentFolderPath();

  let phrase = extractParentFolderPath || searchPhrase;

  if (extractParentFolderPath && documentConfig?.extractByFilepath) {
    phrase = `path:"${extractParentFolderPath}"`;
  }

  return {
    phrase,
    facets: documentFilters,
    geoFilter,
    extraGeoJsonFilters,
    extraDocumentFilters,
  };
};
