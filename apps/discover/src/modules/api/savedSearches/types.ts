import { SavedSearchSortBy } from '@cognite/discover-api-types';
import { DocumentsFilter } from '@cognite/sdk-playground';
import { GeoJson } from '@cognite/seismic-sdk-js';

import { DocumentsFacets } from '../../documentSearch/types';
import { SharedWithData } from '../../favorite/types';
import { MapLayerGeoJsonFilter } from '../../sidebar/types';
import { BasicUserInfo } from '../../user/types';
import { WellFilterMap } from '../../wellSearch/types';

// rename to SavedSearch
export interface SavedSearchItem {
  value: SavedSearchContent;
  name: string;
  owner?: BasicUserInfo;
  id?: string;
}

export interface SavedSearchContent {
  name?: string;
  id?: string;
  query?: string;
  filters: SearchOptionFilters;
  sortBy?: SearchOptionSortBy;
  geoJson?: GeoJson[]; // this is the new field we should move to
  createdTime?: string;
  owner?: BasicUserInfo;
  sharedWith?: SharedWithData[];
}

export interface SearchOptionFilters {
  documents?: {
    facets: DocumentsFacets;
    extraDocumentFilters?: DocumentsFilter;
  };
  wells?: WellFilterMap;
  extraGeoJsonFilters?: MapLayerGeoJsonFilter[];
}

export type SearchOptionSortBy = SavedSearchSortBy;

// we should not be introducing new types, this stuff already exists
// let's work on removing this:
export interface SavedSearchQuery {
  phrase?: string;
  geoFilter?: GeoJson[];
  filters?: SearchOptionFilters;
  sortBy?: SearchOptionSortBy;
}
