import { useClearPolygon } from 'domain/savedSearches/internal/hooks/useClearPolygon';
import { useClearQuery } from 'domain/savedSearches/internal/hooks/useClearQuery';
import { useClearWellsFilters } from 'domain/savedSearches/internal/hooks/useClearWellsFilters';
import { useSetWellsFilters } from 'domain/savedSearches/internal/hooks/useSetWellsFilters';

import * as React from 'react';

import isUndefined from 'lodash/isUndefined';
import styled from 'styled-components/macro';

import { FilterClearAllButton } from 'components/Buttons/FilterClearAllButton';
import { SelectedFilterLabel } from 'components/Labels/SelectedFilterLabel';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useGetTypeFromGeometry, useMap } from 'modules/map/selectors';
import {
  useAppliedWellFilters,
  useSearchPhrase,
} from 'modules/sidebar/selectors';
import { useGetAppliedFilterEntries } from 'modules/wellSearch/hooks/useAppliedFilters';
import { FilterValues } from 'modules/wellSearch/types';
import { removeAppliedFilterValue } from 'modules/wellSearch/utils/filters';
import { sizes } from 'styles/layout';

import { TagWrapper } from '../../document/header/elements';

const Container = styled.div`
  margin-top: ${sizes.normal};
  display: flex;
  flex-wrap: wrap;
`;

interface Props {
  showGeoFilters?: boolean;
  showClearTag?: boolean;
  showSearchPhraseTag?: boolean;
}

export const WellAppliedFilters: React.FC<Props> = React.memo(
  ({
    showGeoFilters = false,
    showClearTag = false,
    showSearchPhraseTag = false,
  }) => {
    const metrics = useGlobalMetrics('wells');
    const appliedFilters = useAppliedWellFilters();
    const { filterApplied: geoFiltersApplied } = useMap();
    const setWellsFilters = useSetWellsFilters();
    const clearAllWellFilters = useClearWellsFilters();

    const clearPolygon = useClearPolygon();
    const selectedFeature = useGetTypeFromGeometry();
    const clearQuery = useClearQuery();
    const searchPhrase = useSearchPhrase();
    const filterValues = useGetAppliedFilterEntries();

    const hasFiltersApplied =
      !isUndefined(
        Object.values(appliedFilters).find((values) => values.length)
      ) ||
      (showGeoFilters && geoFiltersApplied) ||
      (showSearchPhraseTag && searchPhrase);

    const handleFilterCloseClick = (entry: FilterValues) => {
      metrics.track('click-wells-close-filter-tag');
      setWellsFilters(
        removeAppliedFilterValue(appliedFilters, entry.id, entry.value)
      );
    };

    const handleClearAllClick = async () => {
      metrics.track('click-wells-clear-all-tag');
      await clearQuery();
      clearAllWellFilters();
    };

    const canShowGeoFilters =
      showGeoFilters && selectedFeature && geoFiltersApplied;

    const canShowSearchPhrase =
      showSearchPhraseTag && searchPhrase && hasFiltersApplied;

    const canShowClearFilterElement = showClearTag && hasFiltersApplied;

    const createFilterTagElement = (
      key: string,
      tag: string,
      onClick: () => void
    ) => (
      <TagWrapper key={key}>
        <SelectedFilterLabel onClick={onClick} tag={tag} />
      </TagWrapper>
    );

    const createClearTagElement = (onClick: () => void) => (
      <FilterClearAllButton onClick={onClick} />
    );

    return (
      <Container data-testid="well-filter-container">
        {(filterValues || []).map((filterValue) =>
          createFilterTagElement(
            `${filterValue.id}-${filterValue.value}-well-tags`,
            `${filterValue.field || filterValue.category}: ${
              filterValue.value || filterValue.displayName
            }`,
            () => {
              handleFilterCloseClick(filterValue);
            }
          )
        )}
        {canShowGeoFilters &&
          createFilterTagElement(
            `${selectedFeature}-well-tags`,
            `Custom ${selectedFeature}`,
            () => clearPolygon()
          )}
        {canShowSearchPhrase &&
          createFilterTagElement(
            `${searchPhrase}-query-tags`,
            searchPhrase,
            clearQuery
          )}
        {canShowClearFilterElement &&
          createClearTagElement(() => {
            handleClearAllClick();
          })}
      </Container>
    );
  }
);
