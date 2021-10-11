import { getMockDocumentFilter } from '__test-utils/fixtures/sidebar';
import { DocumentsFacets } from 'modules/documentSearch/types';

import {
  getDocumentFacetsflatValues,
  isDocumentDateFacet,
  removeAppliedDocumentFilterFromCategory,
} from '../utils';

describe('filter provider helper test', () => {
  test('load document facet flat values', async () => {
    const documentFacets: DocumentsFacets = {
      filetype: ['filetype'],
      labels: [{ externalId: 'label 2' }],
      lastcreated: [],
      lastmodified: [],
      location: [],
    };

    const result = getDocumentFacetsflatValues(documentFacets);
    expect(result[0]).toEqual(`filetype`);
    expect(result[1]).toEqual({ externalId: 'label 2' });
  });

  test('if passedDocumentsFacets is date realed one or not', () => {
    expect(isDocumentDateFacet('lastcreated')).toBe(true);
    expect(isDocumentDateFacet('lastmodified')).toBe(true);
    expect(isDocumentDateFacet('filetype')).toBe(false);
    expect(isDocumentDateFacet('labels')).toBe(false);
    expect(isDocumentDateFacet('location')).toBe(false);
  });

  test('if removing document filter success', () => {
    const documentFilters = getMockDocumentFilter();
    expect(
      removeAppliedDocumentFilterFromCategory(
        'Image',
        'filetype',
        documentFilters
      )
    ).toEqual(['Compressed']);
  });
});
