import { screen, fireEvent, waitFor, within } from '@testing-library/react';

import { getMockDocument } from '__test-utils/fixtures/document';
import { getMockFavoriteSummary } from '__test-utils/fixtures/favorite';
import { getMockWellOld } from '__test-utils/fixtures/well';
import { testRendererModal } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { defaultTestUser } from '__test-utils/testdata.utils';
import navigation from 'constants/navigation';
import { useDocumentsByIdForFavoritesQuery } from 'modules/documentSearch/hooks/useDocumentsByIdsForFavorites';
import {
  useMutateFavoriteWellPatchWellbores,
  useMutateFavoriteWellUpdate,
} from 'modules/wellSearch/hooks/useWellsFavoritesQuery';
import { useFavoriteWellResults } from 'modules/wellSearch/selectors';
import {
  FAVORITE_SET_NO_DOCUMENTS,
  FAVORITE_SET_NO_WELLS,
} from 'pages/authorized/favorites/constants';
import {
  FavoriteDetailsContent,
  Props,
} from 'pages/authorized/favorites/tabs/favorites/detailsPage/FavoriteDetailsContent';

jest.mock(
  'modules/documentSearch/hooks/useDocumentsByIdsForFavorites.ts',
  () => ({
    useDocumentsByIdForFavoritesQuery: jest.fn(),
  })
);

jest.mock('modules/wellSearch/hooks/useWellsFavoritesQuery.ts', () => ({
  useWellsByIdForFavoritesQuery: jest.fn(),
  useMutateFavoriteWellPatchWellbores: jest.fn(),
  useMutateFavoriteWellUpdate: jest.fn(),
}));

jest.mock('modules/wellSearch/selectors/asset/well.ts', () => ({
  useFavoriteWellResults: jest.fn(),
}));

const mockFavoriteUpdate = jest.fn();
jest.mock('modules/api/favorites/useFavoritesQuery.ts', () => ({
  useFavoriteUpdateContent: () => ({
    mutateAsync: mockFavoriteUpdate,
  }),
}));

const mockFetch = jest.fn();

describe('Favorite Details Content', () => {
  const mockFavorite = getMockFavoriteSummary();
  const store = getMockedStore();
  const mockDoc = getMockDocument();
  const mockWell = getMockWellOld();

  const page = (props?: Partial<Props>) =>
    testRendererModal(FavoriteDetailsContent, store, {
      content: mockFavorite.content,
      favoriteId: mockFavorite.id,
      ownerId: defaultTestUser,
      ...props,
    });

  // set location url correctly so child elements get rendered
  beforeEach(() =>
    window.history.pushState(
      {},
      'Test page',
      navigation.FAVORITE_TAB_DOCUMENTS(mockFavorite.id)
    )
  );

  beforeEach(() => {
    (useMutateFavoriteWellPatchWellbores as jest.Mock).mockImplementation(
      () => ({
        mutate: jest.fn(),
      })
    );
  });
  beforeEach(() => {
    (useMutateFavoriteWellUpdate as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
    }));
  });

  it('should render loading state', async () => {
    (useDocumentsByIdForFavoritesQuery as jest.Mock).mockReturnValue({
      data: { pages: [] },
      isLoading: true,
      isIdle: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    });

    (useFavoriteWellResults as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      isIdle: false,
    });

    page();

    const wellTab = screen.getByRole('tab', { name: /Wells/ });

    // loading state
    expect(screen.getByText('Loading results')).toBeVisible();
    fireEvent.click(wellTab);
    // @todo(PP-2044)
    // eslint-disable-next-line testing-library/await-async-utils
    waitFor(() => expect(screen.getByText('Loading results')).toBeVisible());
  });

  it('should render empty state correctly', async () => {
    (useDocumentsByIdForFavoritesQuery as jest.Mock).mockReturnValue({
      data: { pages: [[]] },
      isLoading: false,
      isIdle: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    });

    (useFavoriteWellResults as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      isIdle: false,
    });
    page();

    const documentsTab = screen.getByRole('tab', { name: /Documents/ });
    const wellTab = screen.getByRole('tab', { name: /Wells/ });

    expect(within(documentsTab).getByText('0')).toBeInTheDocument();
    expect(within(wellTab).getByText('0')).toBeInTheDocument();

    expect(screen.getByText('Loading results')).not.toBeVisible();
    expect(screen.getByText(FAVORITE_SET_NO_DOCUMENTS)).toBeVisible();
    wellTab.click();
    expect(screen.getByText(FAVORITE_SET_NO_WELLS)).toBeVisible();
  });

  it('should render component correctly with data', async () => {
    (useDocumentsByIdForFavoritesQuery as jest.Mock).mockReturnValue({
      data: { pages: [[mockDoc]] },
      isLoading: false,
      isIdle: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    });

    (useFavoriteWellResults as jest.Mock).mockReturnValue({
      data: [mockWell],
      isLoading: false,
      isIdle: false,
    });

    page();

    await waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: mockDoc.filename })
      ).toBeInTheDocument();
    });

    const wellTab = screen.getByRole('tab', { name: /Wells/ });
    wellTab.click();

    await screen.findByRole('table');
    expect(
      screen.getByRole('cell', { name: mockWell.name })
    ).toBeInTheDocument();

    // check if delete modal dialog and action are called

    fireEvent.mouseOver(screen.getByTestId('table-row'));
    expect(screen.getByTestId('menu-button')).toBeInTheDocument();
    fireEvent.mouseOver(screen.getByTestId('menu-button'));
    expect(screen.getByTestId('remove-from-set')).toBeInTheDocument();

    // Modal is not initializing properly. Maybe need to think about moving to higherlevel
    // https://github.com/reactjs/react-modal/issues/133

    // getByTestId('remove-from-set').click();
    // getByText('Remove').click();
    // expect(mockFavoriteUpdate).toHaveBeenCalled();
  });

  it('should render "Load More" button', async () => {
    (useDocumentsByIdForFavoritesQuery as jest.Mock).mockReturnValue({
      data: { pages: [[mockDoc]] },
      isLoading: false,
      isIdle: false,
      isFetchingNextPage: false,
      fetchNextPage: mockFetch,
    });

    (useFavoriteWellResults as jest.Mock).mockReturnValue({
      data: [mockWell],
      isLoading: true,
      isIdle: false,
    });

    page({
      content: { ...mockFavorite.content, documentIds: [1, 2] },
    });

    // @todo(PP-2044)
    // eslint-disable-next-line testing-library/await-async-utils
    waitFor(() => {
      expect(screen.getByRole('table')).toBeInTheDocument();
      const loadMoreButton = screen.getByRole('button', { name: 'Load more' });
      expect(loadMoreButton).toBeInTheDocument();
      fireEvent.click(loadMoreButton);
      expect(mockFetch).toHaveBeenCalled();
    });
  });
});
