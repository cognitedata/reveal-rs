import { DocumentsFacets } from 'modules/documentSearch/types';

import { getDocumentFacetsflatValues, isDocumentDateFacet } from '../utils';

describe('filter provider helper test', () => {
  test('load document facet flat values', async () => {
    const documentFacets: DocumentsFacets = {
      fileCategory: ['fileCategory'],
      labels: [{ externalId: 'label 2' }],
      lastcreated: [],
      lastmodified: [],
      location: [],
      pageCount: [],
    };

    const result = getDocumentFacetsflatValues(documentFacets);
    expect(result[0]).toEqual(`fileCategory`);
    expect(result[1]).toEqual({ externalId: 'label 2' });
  });

  test('if passedDocumentsFacets is date realed one or not', () => {
    expect(isDocumentDateFacet('lastcreated')).toBe(true);
    expect(isDocumentDateFacet('lastmodified')).toBe(true);
    expect(isDocumentDateFacet('fileCategory')).toBe(false);
    expect(isDocumentDateFacet('labels')).toBe(false);
    expect(isDocumentDateFacet('location')).toBe(false);
  });
});
