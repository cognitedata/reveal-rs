import {
  getMockAppliedFiltersType,
  getMockDocumentFilter,
  getMockWellFilter,
} from '__test-utils/fixtures/sidebar';

import {
  TOGGLE_FILTER_BAR,
  SET_CATEGORY_PAGE,
  SET_CATEGORY_FILTERS,
  UPDATE_CATEGORY_APPLIED_FILTER,
  UPDATE_CATEGORY_APPLIED_FILTERS,
  SET_SEARCH_PHRASE,
} from '../constants';
import { sidebar as reducer, initialState } from '../reducer';

describe('search.reducer', () => {
  test('returns initial state', () => {
    expect(
      reducer(initialState, {
        type: SET_CATEGORY_PAGE,
        payload: 'wells',
      })
    ).toBeDefined();
  });

  test('Toggle initial isOpen', () => {
    const beforeToggle = initialState.isOpen;
    const state = reducer(initialState, { type: TOGGLE_FILTER_BAR });
    expect(state.isOpen).toBe(!beforeToggle);
  });

  test('Set category page to wells', () => {
    const state = reducer(initialState, {
      type: SET_CATEGORY_PAGE,
      payload: 'wells',
    });
    expect(state.category).toBe('wells');
  });

  test('Set document facet', () => {
    const state = reducer(initialState, {
      type: UPDATE_CATEGORY_APPLIED_FILTER,
      payload: {
        category: 'documents',
        facet: 'filetype',
        value: ['option1', 'option2'],
      },
    });
    expect(state.appliedFilters.documents.filetype).toStrictEqual([
      'option1',
      'option2',
    ]);
  });

  test('Set wells/seismic facet', () => {
    const state = reducer(initialState, {
      type: UPDATE_CATEGORY_APPLIED_FILTER,
      payload: {
        category: 'wells',
        facet: 0,
        value: ['check2'],
      },
    });
    expect(state.appliedFilters.wells[0]).toStrictEqual(['check2']);
  });

  test('Set document applied filters', () => {
    const documentFilters = getMockDocumentFilter();
    const state = reducer(initialState, {
      type: UPDATE_CATEGORY_APPLIED_FILTERS,
      payload: {
        category: 'documents',
        value: documentFilters,
      },
    });
    expect(state.appliedFilters.documents.filetype).toStrictEqual([
      'Compressed',
      'Image',
    ]);
    expect(state.appliedFilters.documents.labels).toStrictEqual([
      { externalId: '1' },
    ]);
    expect(state.appliedFilters.documents.location).toStrictEqual(['Bp-Blob']);
  });

  test('Set wells applied filters', () => {
    const wellAppliedFilters = getMockWellFilter();
    const state = reducer(initialState, {
      type: UPDATE_CATEGORY_APPLIED_FILTERS,
      payload: {
        category: 'wells',
        value: wellAppliedFilters,
      },
    });
    expect(state.appliedFilters.wells[0]).toStrictEqual(wellAppliedFilters[0]);
    expect(state.appliedFilters.wells[1]).toStrictEqual(wellAppliedFilters[1]);
  });

  test('Set category filters', () => {
    const appliedFilter = getMockAppliedFiltersType();
    const state = reducer(initialState, {
      type: SET_CATEGORY_FILTERS,
      payload: appliedFilter,
    });

    expect(state.appliedFilters.wells[0]).toStrictEqual(appliedFilter.wells[0]);
    expect(state.appliedFilters.wells[1]).toStrictEqual(appliedFilter.wells[1]);
    expect(state.appliedFilters.documents.filetype).toStrictEqual([
      'Compressed',
      'Image',
    ]);
    expect(state.appliedFilters.documents.labels).toStrictEqual([
      { externalId: '1' },
    ]);
    expect(state.appliedFilters.documents.location).toStrictEqual(['Bp-Blob']);
  });

  test('Set search phrase', () => {
    const phrase = 'Well A';
    const state = reducer(initialState, {
      type: SET_SEARCH_PHRASE,
      payload: phrase,
    });
    expect(state.searchPhrase).toBe(phrase);
  });
});
