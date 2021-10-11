/* eslint-disable jest/no-export */
import { SearchQueryFull } from '../types';
import { getEmptyFacets } from '../utils';

/**
 * DOCUMENT Search TEST utils
 */

export const getMockSearchQuery = (extras: Partial<SearchQueryFull> = {}) => {
  return {
    facets: getEmptyFacets(),
    geoFilter: [],
    phrase: 'test',
    ...extras,
  } as SearchQueryFull;
};

export const getMockSearchQueryWithFacets = (
  extras: Partial<SearchQueryFull> = {}
) => {
  return {
    facets: {
      filetype: ['Image', 'PDF'],
      labels: [
        {
          externalId: 'COMPLETION_REPORT',
        },
        {
          externalId: 'COMPLETION_SCHEMATIC',
        },
      ],
      lastmodified: ['1622485800000', '1623695400000'],
      lastcreated: ['1622485800000', '1623695400000'],
      location: ['bp-blob', 'bp-edm-attachment'],
    },
    geoFilter: [],
    phrase: 'test',
    ...extras,
  } as SearchQueryFull;
};

describe('Search test utils', () => {
  it('should be ok', () => {
    expect(getMockSearchQuery().phrase).toEqual('test');
    expect(getMockSearchQueryWithFacets().phrase).toEqual('test');
  });
});
