import { renderHook } from '@testing-library/react-hooks';

import { useMutatePatchSavedSearch } from 'modules/api/savedSearches/useQuery';

import { useSavedSearch } from '../useSavedSearch';

jest.mock('modules/api/savedSearches/useQuery', () => ({
  useMutatePatchSavedSearch: jest.fn(),
}));

describe('useSavedSearch hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSavedSearch());
    waitForNextUpdate();
    return result.current;
  };

  it('should call useSavedSearch with search filters', async () => {
    const mutate = jest.fn();
    (useMutatePatchSavedSearch as jest.Mock).mockImplementation(() => ({
      mutate,
    }));
    const savedSearch = await getHookResult();

    const content = {
      name: 'Test Name',
      id: '1',
      query: 'Test Query',
      filters: {},
    };

    savedSearch(content);
    expect(mutate).toHaveBeenCalledWith(content);
  });
});
