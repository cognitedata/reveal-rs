import { DocumentsFacets, FormattedFacet } from 'modules/documentSearch/types';
import { initialState as sideBarState } from 'modules/sidebar/reducer';
import {
  SidebarState,
  AppliedFiltersType,
  ActiveKeysType,
} from 'modules/sidebar/types';
import { FIELD_BLOCK_OPERATOR } from 'modules/wellSearch/constants';
import { FilterValues, WellFilterMap } from 'modules/wellSearch/types';

export const DEFAULT_SEARCH_PHRASE = 'Well A';
export const DEFAULT_OPEN_CATEGORY = 'wells';
export const DEFAULT_CATEGORIES = [
  'Field / Block / Operator',
  'Well Characteristics',
];

export const getMockState: (extras?: Partial<SidebarState>) => SidebarState = (
  extras = {}
) => ({
  ...sideBarState,
  ...extras,
});

export const getEmptyAppliedFilterType = (): AppliedFiltersType => {
  return {
    documents: {
      filetype: [],
      labels: [],
      lastmodified: [],
      lastcreated: [],
      location: [],
    },
    seismic: {},
    wells: {},
    landing: {},
  };
};

export const getMockAppliedFiltersType: (
  documentFiltersExtras?: Partial<DocumentsFacets>,
  wellFiltersExtras?: Partial<WellFilterMap>
) => AppliedFiltersType = (
  documentFiltersExtras = {},
  wellFiltersExtras = {}
) => {
  return {
    documents: getMockDocumentFilter(documentFiltersExtras),
    seismic: {},
    wells: getMockWellFilter(wellFiltersExtras),
    landing: {},
  };
};

export const getMockDocumentFilter: (
  extras?: Partial<DocumentsFacets>
) => DocumentsFacets = (extras = {}) => {
  return {
    filetype: ['Compressed', 'Image'],
    labels: [{ externalId: '1' }],
    lastmodified: [],
    lastcreated: [],
    location: ['Bp-Blob'],
    ...extras,
  };
};

export const getMockWellFilter: (
  extras?: Partial<WellFilterMap>
) => WellFilterMap = (extras = {}) => {
  return {
    2: ['BOEM', 'BP-Penquin'],
    4: ['Atlantis', 'Mad Dog'],
    ...extras,
  };
};

export const getMockActiveKeys: (
  extras?: Partial<ActiveKeysType>
) => ActiveKeysType = (extras = {}) => {
  return {
    documents: ['0', '1'],
    seismic: [],
    wells: [FIELD_BLOCK_OPERATOR, 'Well Characteristics'],
    landing: [],
    ...extras,
  };
};

export const getMockSidebarState: (
  extras?: Partial<SidebarState>
) => SidebarState = (extras = {}) => {
  return {
    isOpen: true,
    category: DEFAULT_OPEN_CATEGORY,
    activeKeys: getMockActiveKeys(extras.activeKeys),
    appliedFilters: {
      documents: getMockDocumentFilter(extras.appliedFilters?.documents),
      seismic: {},
      wells: getMockWellFilter(extras.appliedFilters?.wells),
      landing: {},
    },
    searchPhrase: DEFAULT_SEARCH_PHRASE,
    ...extras,
  };
};

export const getMockFormattedFacet: (
  extras?: Partial<FormattedFacet>
) => FormattedFacet = (extras = {}) => {
  return {
    facet: 'filetype',
    facetNameDisplayFormat: 'File Type',
    facetValueDisplayFormat: 'PDF',
    ...extras,
  };
};

export const getMockFilterValue: (
  extras?: Partial<FilterValues>
) => FilterValues = (extras = {}) => {
  return {
    id: 0,
    category: 'Category 1',
    field: 'Source',
    value: 'EDM',
    displayName: 'EDM',
    ...extras,
  };
};
