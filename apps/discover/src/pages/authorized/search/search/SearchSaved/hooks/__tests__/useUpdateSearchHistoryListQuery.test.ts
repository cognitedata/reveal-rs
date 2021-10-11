import { useQueryClient } from 'react-query';

import { renderHook } from '@testing-library/react-hooks';

import { getMockedSavedSearchWithFilters } from '__test-utils/fixtures/savedSearch';
import { SEARCH_HISTORY_KEY } from 'constants/react-query';
import { useCurrentSavedSearchState } from 'hooks/useCurrentSavedSearchState';
import { useSearchHistoryListQuery } from 'modules/api/searchHistory/useSearchHistoryQuery';

import { useUpdateSearchHistoryListQuery } from '../useUpdateSearchHistoryListQuery';

jest.mock('react-query', () => ({
  useQueryClient: jest.fn(),
}));

jest.mock('hooks/useCurrentSavedSearchState', () => ({
  useCurrentSavedSearchState: jest.fn(),
}));

jest.mock('modules/api/searchHistory/useSearchHistoryQuery', () => ({
  useSearchHistoryListQuery: jest.fn(),
}));

describe('useUpdateSearchHistoryListQuery hook', () => {
  const setQueryData = jest.fn();
  const currentSavedSearch = getMockedSavedSearchWithFilters(['documents']);

  it('should set query data as expected', () => {
    (useQueryClient as jest.Mock).mockImplementation(() => ({
      setQueryData,
    }));
    (useCurrentSavedSearchState as jest.Mock).mockImplementation(
      () => currentSavedSearch
    );
    (useSearchHistoryListQuery as jest.Mock).mockImplementation(() => ({
      data: [],
    }));

    const { result, waitForNextUpdate } = renderHook(() =>
      useUpdateSearchHistoryListQuery()
    );
    waitForNextUpdate();

    const updateSearchHistoryListQuery = result.current;

    updateSearchHistoryListQuery();

    expect(setQueryData).toBeCalledWith(SEARCH_HISTORY_KEY.LIST, [
      {
        name: 'default-saved-search',
        value: {
          filters: {
            documents: {
              facets: {
                filetype: ['Compressed', 'Image'],
                labels: [{ externalId: '1' }],
                lastcreated: [],
                lastmodified: [],
                location: ['Bp-Blob'],
              },
            },
          },
        },
      },
    ]);
  });
});
