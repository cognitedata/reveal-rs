import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import flatMap from 'lodash/flatMap';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import head from 'lodash/head';
import map from 'lodash/map';

import useSelector from 'hooks/useSelector';
import { wellSearchActions } from 'modules/wellSearch/actions';
import {
  InspectWellboreContext,
  Wellbore,
  WellboreAssetIdMap,
} from 'modules/wellSearch/types';

import {
  useWellBoreResult,
  useWells,
  useSelectedWellIds,
  useFavoriteWellResults,
  useSelectedSecondaryWellAndWellboreIds,
} from './well';

// This returns wellbores for the given well
export const useWellbores = (wellIds: number[]) => {
  const [isLoading, setIsLoading] = useState<boolean>();
  const { wells } = useWells();
  const dispatch = useDispatch();
  return useMemo(() => {
    const prestineWellIds = map(
      wells.filter((well) => wellIds.includes(well.id) && !well.wellbores),
      'id'
    );

    if (isLoading && !prestineWellIds.length) {
      setIsLoading(false);
    }

    if (prestineWellIds.length && isLoading) {
      return { isLoading: true, wellbores: [] };
    }

    if (prestineWellIds.length && !isLoading) {
      setIsLoading((prev) => {
        if (!prev) {
          dispatch(wellSearchActions.getWellbores(prestineWellIds));
        }
        return true;
      });
      return { isLoading: true, wellbores: [] };
    }
    const wellbores = flatMap(
      wells.filter((well) => wellIds.includes(well.id) && well.wellbores),
      'wellbores'
    ) as Wellbore[];

    return { isLoading: false, wellbores };
  }, [wellIds, wells, isLoading]);
};

// This returns selected wellbores
export const useSelectedWellbores = (filterByIds?: number[]) => {
  return useSelector((state) => {
    return useMemo(() => {
      const wellbores = flatten(
        state.wellSearch.wells
          .filter((well) => state.wellSearch.selectedWellIds[well.id])
          .map((well) =>
            well.wellbores
              ? well.wellbores.filter(
                  (wellbore) =>
                    state.wellSearch.selectedWellboreIds[wellbore.id]
                )
              : []
          )
      );
      if (filterByIds) {
        return wellbores.filter((row) => filterByIds.includes(row.id));
      }
      return wellbores;
    }, [
      state.wellSearch.wells,
      state.wellSearch.selectedWellIds,
      state.wellSearch.selectedWellboreIds,
      filterByIds,
    ]);
  });
};

export const useSelectedOrHoveredWellbores = (filterByIds?: number[]) => {
  return useSelector((state) => {
    const wellCardId = state.wellSearch.wellCardSelectedWellId;
    const wellCardWellbores = useWellBoreResult(wellCardId);

    // favorite wells
    const favoriteHoveredIds =
      state.wellSearch.wellFavoriteHoveredOrCheckedWells;
    const { data: favoriteWellData } =
      useFavoriteWellResults(favoriteHoveredIds);

    return useMemo(() => {
      const inspectContext = state.wellSearch.inspectWellboreContext;
      // check wellbores coming from well card
      if (inspectContext === InspectWellboreContext.WELL_CARD_WELLBORES) {
        // if only wellbore is selected, then show filter others
        const resultedWellbores = wellCardWellbores.filter(
          (wellbore) => state.wellSearch.wellCardSelectedWellBoreId[wellbore.id]
        );

        if (filterByIds) {
          return resultedWellbores.filter((row) =>
            filterByIds.includes(row.id)
          );
        }
        return resultedWellbores;
      }

      if (inspectContext === InspectWellboreContext.FAVORITE_HOVERED_WELL) {
        const firstWell = head(favoriteWellData);

        const resultedWellbores = firstWell?.wellbores || [];
        if (filterByIds) {
          return resultedWellbores.filter((row) =>
            filterByIds.includes(row.id)
          );
        }
        return resultedWellbores;
      }

      if (inspectContext === InspectWellboreContext.FAVORITE_CHECKED_WELLS) {
        const resultedWellbores = flatten(
          favoriteWellData?.map((well) =>
            well.wellbores ? well.wellbores : []
          )
        );

        if (filterByIds) {
          return resultedWellbores.filter((row) =>
            filterByIds.includes(row.id)
          );
        }
        return resultedWellbores;
      }

      const wellbores = flatten(
        state.wellSearch.wells
          .filter((well) =>
            state.wellSearch.inspectWellboreContext ===
            InspectWellboreContext.CHECKED_WELLBORES
              ? state.wellSearch.selectedWellIds[well.id]
              : state.wellSearch.hoveredWellId === well.id
          )
          .map((well) =>
            well.wellbores
              ? well.wellbores.filter((wellbore) =>
                  state.wellSearch.inspectWellboreContext ===
                  InspectWellboreContext.CHECKED_WELLBORES
                    ? state.wellSearch.selectedWellboreIds[wellbore.id]
                    : state.wellSearch.hoveredWellboreIds[wellbore.id]
                )
              : []
          )
      );
      if (filterByIds) {
        return wellbores.filter((row) => filterByIds.includes(row.id));
      }
      return wellbores;
    }, [
      state.wellSearch.wells,
      state.wellSearch.selectedWellIds,
      state.wellSearch.selectedWellboreIds,
      state.wellSearch.hoveredWellId,
      state.wellSearch.hoveredWellboreIds,
      state.wellSearch.wellFavoriteHoveredOrCheckedWells,
      filterByIds,
    ]);
  });
};

export const useSecondarySelectedOrHoveredWellbores = () => {
  const selectedOrHoveredWellbores = useSelectedOrHoveredWellbores();
  const { selectedSecondaryWellboreIds } =
    useSelectedSecondaryWellAndWellboreIds();
  return useMemo(
    () =>
      selectedOrHoveredWellbores.filter(
        (wellbore) => selectedSecondaryWellboreIds[wellbore.id]
      ),
    [selectedOrHoveredWellbores, selectedSecondaryWellboreIds]
  );
};

// This returns selected wellbores ids as a list
export const useSelectedWellboreIds = () => {
  const selectedWellbores = useSelectedWellbores();
  return useMemo(
    () => selectedWellbores.map((wellbore) => wellbore.id),
    [selectedWellbores]
  );
};

export const useSelectedOrHoveredWellboreIds = () => {
  const selectedOrHoveredWellbores = useSecondarySelectedOrHoveredWellbores();
  return useMemo(
    () => selectedOrHoveredWellbores.map((wellbore) => wellbore.id),
    [selectedOrHoveredWellbores]
  );
};

// This returns wellbore data
export const useWellboreData = () => {
  return useSelector((state) =>
    useMemo(
      () => state.wellSearch.wellboreData,
      [state.wellSearch.wellboreData]
    )
  );
};

export const useWellboreAssetIdMap = () => {
  return useSelector((state) => {
    const wellCardId = state.wellSearch.wellCardSelectedWellId;
    const wellCardWellbores = useWellBoreResult(wellCardId);
    const inspectContext = state.wellSearch.inspectWellboreContext;

    // favorite wells
    const favoriteHoveredIds =
      state.wellSearch.wellFavoriteHoveredOrCheckedWells;
    const { data: favoriteWellData } =
      useFavoriteWellResults(favoriteHoveredIds);

    return useMemo(() => {
      if (InspectWellboreContext.WELL_CARD_WELLBORES === inspectContext) {
        return wellCardWellbores.reduce((idMap, wellbore) => {
          const wellboreAssetId = get(
            wellbore,
            'sourceWellbores[0].id',
            wellbore.id
          );
          return {
            ...idMap,
            [wellbore.id]: wellboreAssetId,
          };
        }, {} as WellboreAssetIdMap);
      }
      if (inspectContext === InspectWellboreContext.FAVORITE_HOVERED_WELL) {
        const firstWell = head(favoriteWellData);

        const resultedWellbores = firstWell?.wellbores || [];
        return resultedWellbores.reduce((idMap, wellbore) => {
          const wellboreAssetId = get(
            wellbore,
            'sourceWellbores[0].id',
            wellbore.id
          );
          return {
            ...idMap,
            [wellbore.id]: wellboreAssetId,
          };
        }, {} as WellboreAssetIdMap);
      }

      if (inspectContext === InspectWellboreContext.FAVORITE_CHECKED_WELLS) {
        const resultedWellbores = flatten(
          favoriteWellData?.map((well) =>
            well.wellbores ? well.wellbores : []
          )
        );
        return resultedWellbores.reduce((idMap, wellbore) => {
          const wellboreAssetId = get(
            wellbore,
            'sourceWellbores[0].id',
            wellbore.id
          );
          return {
            ...idMap,
            [wellbore.id]: wellboreAssetId,
          };
        }, {} as WellboreAssetIdMap);
      }

      return flatten(
        state.wellSearch.wells.map((well) =>
          well.wellbores ? well.wellbores : []
        )
      ).reduce((idMap, wellbore) => {
        const wellboreAssetId = get(
          wellbore,
          'sourceWellbores[0].id',
          wellbore.id
        );
        return {
          ...idMap,
          [wellbore.id]: wellboreAssetId,
        };
      }, {} as WellboreAssetIdMap);
    }, [state.wellSearch.wells]);
  });
};

export const useActiveWellboresExternalIdMap = () => {
  const selectedOrHoveredWellbores = useSecondarySelectedOrHoveredWellbores();
  return useMemo(
    () =>
      selectedOrHoveredWellbores.reduce(
        (idMap, wellbore) =>
          wellbore.externalId
            ? { ...idMap, [wellbore.externalId]: wellbore.id }
            : idMap,
        {}
      ),
    [selectedOrHoveredWellbores]
  );
};

export const useWellboresFetchedWellIds = () => {
  return useSelector((state) =>
    useMemo(
      () => state.wellSearch.wellboresFetchedWellIds,
      [state.wellSearch.wellboresFetchedWellIds]
    )
  );
};

export const useWellboresFetching = () => {
  const wellboresFetchedWellIds = useWellboresFetchedWellIds();
  const selectedWellIds = useSelectedWellIds();

  return useMemo(
    () =>
      selectedWellIds.some(
        (wellId) => !wellboresFetchedWellIds.includes(wellId)
      ),
    [wellboresFetchedWellIds, selectedWellIds]
  );
};
