import { usePatchSavedSearchMutate } from 'domain/savedSearches/internal/actions/usePatchSavedSearchMutate';

import { renderHook } from '@testing-library/react-hooks';

import { GeoJson, Geometry } from '@cognite/seismic-sdk-js';

import { useClearPolygon, useSetPolygon } from '../useClearPolygon';

jest.mock(
  'domain/savedSearches/internal/actions/usePatchSavedSearchMutate',
  () => ({
    usePatchSavedSearchMutate: jest.fn(),
  })
);

describe('useClearPolygon hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() => useClearPolygon());
    waitForNextUpdate();
    return result.current;
  };

  it('should call useClearPolygon with empty query', async () => {
    const mutateAsync = jest.fn();
    (usePatchSavedSearchMutate as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const clearPolygon = await getHookResult();
    clearPolygon();
    expect(mutateAsync).toHaveBeenCalledWith({ geoJson: [] });
  });
});

describe('useSetPolygon hook', () => {
  const getHookResult = async () => {
    const { result, waitForNextUpdate } = renderHook(() => useSetPolygon());
    waitForNextUpdate();
    return result.current;
  };

  it('should call useSetPolygon with geo filter', async () => {
    const mutateAsync = jest.fn();
    (usePatchSavedSearchMutate as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const setPolygon = await getHookResult();
    const point: Geometry = {
      type: 'Point',
      coordinates: [1, 2],
    };
    setPolygon(point);
    expect(mutateAsync).toHaveBeenCalledWith({
      geoJson: [
        { geometry: point, id: 'Feature', properties: {}, type: 'Feature' },
      ],
      filters: {
        extraGeoJsonFilters: [],
      },
    });
  });

  it('should call useSetPolygon with geojson filters', async () => {
    const mutateAsync = jest.fn();
    (usePatchSavedSearchMutate as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const setPolygon = await getHookResult();
    const filter: GeoJson = {
      id: '1',
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [1, 2],
      },
    };
    setPolygon(filter);
    expect(mutateAsync).toHaveBeenCalledWith({
      geoJson: [filter],
      filters: {
        extraGeoJsonFilters: [],
      },
    });
  });

  it('should call useSetPolygon with array of geo filters', async () => {
    const mutateAsync = jest.fn();
    (usePatchSavedSearchMutate as jest.Mock).mockImplementation(() => ({
      mutateAsync,
    }));
    const setPolygon = await getHookResult();
    const point: GeoJson = {
      id: '1',
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [1, 2],
      },
    };
    setPolygon([point]);
    expect(mutateAsync).toHaveBeenCalledWith({
      geoJson: [point],
      filters: {
        extraGeoJsonFilters: [],
      },
    });
  });
});
