import { documentFacetsStructure } from 'domain/documents/internal/types';
import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import { renderHook } from '@testing-library/react-hooks';

import { useClearDocumentFilters } from '../useClearDocumentFilters';
import { useSetDocumentFilters } from '../useSetDocumentFilters';

jest.mock(
  'domain/savedSearches/internal/actions/usePatchSavedSearchMutate',
  () => ({
    usePatchSavedSearchMutate: jest.fn(),
  })
);

describe('useClearDocumentFilters hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useClearDocumentFilters()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should call useClearDocumentFilters with empty filter options', async () => {
    const mutateAsync = jest.fn();
    (usePatchSavedSearchMutate as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const clearDocumentFilters = await getHookResult();

    clearDocumentFilters();
    expect(mutateAsync).toHaveBeenCalledWith({
      filters: {
        documents: {
          facets: {
            authors: [],
            fileCategory: [],
            labels: [],
            lastcreated: [],
            lastmodified: [],
            location: [],
            pageCount: [],
          },
        },
      },
    });
  });
});

describe('useSetDocumentFilters hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() =>
      useSetDocumentFilters()
    );
    waitForNextUpdate();
    return result.current;
  };

  it('should call useSetDocumentFilters with filter option', async () => {
    const mutateAsync = jest.fn();
    (usePatchSavedSearchMutate as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const setDocumentFilters = await getHookResult();

    const filters = documentFacetsStructure;

    setDocumentFilters(filters);
    expect(mutateAsync).toHaveBeenCalledWith({
      filters: { documents: { facets: filters } },
    });
  });
});
