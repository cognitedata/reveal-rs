import React from 'react';

import { GeoJsonGeometryTypes } from '@cognite/seismic-sdk-js';

import { FilterTagProps } from 'components/tag/BlueFilterTag';
import { ClearTagProps } from 'components/tag/ClearTag';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useDocumentAppliedFilterEntries } from 'modules/api/documents/hooks/useDocumentAppliedFilters';
import { useDocumentFormatFilter } from 'modules/api/documents/hooks/useDocumentFormatFilter';
import { useClearAllDocumentFilters } from 'modules/api/savedSearches/hooks/useClearAllDocumentFilters';
import { useSetDocumentFilters } from 'modules/api/savedSearches/hooks/useClearDocumentFilters';
import { useClearPolygon } from 'modules/api/savedSearches/hooks/useClearPolygon';
import { useClearQuery } from 'modules/api/savedSearches/hooks/useClearQuery';
import { DocumentsFacets } from 'modules/documentSearch/types';
import { useGetTypeFromGeometry, useMap } from 'modules/map/selectors';
import {
  useAppliedDocumentFilters,
  useSearchPhrase,
} from 'modules/sidebar/selectors';
import {
  getDocumentFacetsflatValues,
  isDocumentDateFacet,
} from 'modules/sidebar/utils';

import { TagRow, TagWrapper } from './elements';

export enum ClearAllScenarios {
  ALL,
  FILTERS,
  SEARCH_PHRASE,
}

interface Props {
  filterTagComponent: React.FC<FilterTagProps>;
  clearTagComponent: React.FC<ClearTagProps>;
  showGeoFilters?: boolean;
  showSearchPhraseTag?: boolean;
  showClearTag?: boolean;
  showClearTagForScenarios?: ClearAllScenarios;
}

export const DocumentAppliedFilters: React.FC<Props> = (props) => {
  const documentFacets = useAppliedDocumentFilters();
  const searchPhrase = useSearchPhrase();
  const { filterApplied: geoFiltersApplied } = useMap();
  const selectedFeature = useGetTypeFromGeometry();

  const setDocumentFilters = useSetDocumentFilters();
  const clearAllDocumentFilters = useClearAllDocumentFilters();
  const clearQuery = useClearQuery();
  const clearPolygon = useClearPolygon();

  const actions = {
    setDocumentFilters,
    clearAllDocumentFilters,
    clearQuery,
    clearPolygon,
  };
  const data = {
    documentFacets,
    searchPhrase,
    geoFiltersApplied,
    selectedFeature,
  };
  return (
    <DocumentAppliedFiltersCore {...props} data={data} actions={actions} />
  );
};

interface CoreProps {
  filterTagComponent: React.FC<FilterTagProps>;
  clearTagComponent: React.FC<ClearTagProps>;
  showGeoFilters?: boolean;
  showSearchPhraseTag?: boolean;
  showClearTag?: boolean;
  showClearTagForScenarios?: ClearAllScenarios;
  data: {
    documentFacets: DocumentsFacets;
    searchPhrase: string;
    selectedFeature?: GeoJsonGeometryTypes | null;
    geoFiltersApplied?: boolean;
  };
  actions: {
    clearAllDocumentFilters: () => void;
    clearQuery: () => void;
    clearPolygon?: () => void;
    setDocumentFilters: (facets: DocumentsFacets) => void;
  };
}

export const DocumentAppliedFiltersCore: React.FC<CoreProps> = React.memo(
  ({
    filterTagComponent,
    clearTagComponent,
    showGeoFilters = false,
    showClearTag = false,
    showSearchPhraseTag = false,
    showClearTagForScenarios = ClearAllScenarios.ALL,
    actions,
    data,
  }) => {
    const metrics = useGlobalMetrics('documents');

    const {
      documentFacets,
      searchPhrase,
      selectedFeature,
      geoFiltersApplied = false,
    } = data;

    const {
      setDocumentFilters,
      clearAllDocumentFilters,
      clearPolygon,
      clearQuery,
    } = actions;

    const formatTag = useDocumentFormatFilter();
    const entries = useDocumentAppliedFilterEntries(documentFacets);

    const hasFiltersApplied =
      (getDocumentFacetsflatValues(documentFacets) || []).length > 0 ||
      geoFiltersApplied;

    const handleClearFilterClicked = ({
      facet,
      original,
    }: {
      facet: keyof DocumentsFacets;
      original: any;
    }) => {
      metrics.track('click-documents-close-filter-tag');

      let filtered: unknown[];

      if (isDocumentDateFacet(facet)) {
        filtered = [];
      } else if (facet === 'labels') {
        filtered = (documentFacets[facet] as { externalId: string }[]).filter(
          (item) => {
            return item.externalId !== original.externalId;
          }
        );
      } else {
        filtered = (documentFacets[facet] as string[]).filter((item: any) => {
          return item !== original;
        });
      }

      setDocumentFilters({
        ...documentFacets,
        [facet]: filtered,
      });
    };

    const handleClearAllClick = () => {
      metrics.track('click-documents-clear-all-tag');
      clearAllDocumentFilters();
    };

    const showClearFilterTagByScenario = () => {
      switch (showClearTagForScenarios) {
        case ClearAllScenarios.ALL:
          return hasFiltersApplied || searchPhrase;
        case ClearAllScenarios.FILTERS:
          return hasFiltersApplied;
        case ClearAllScenarios.SEARCH_PHRASE:
          return searchPhrase;
        default:
          return false;
      }
    };

    const canShowGeoFilters =
      showGeoFilters && selectedFeature && geoFiltersApplied;

    const canShowSearchPhrase = showSearchPhraseTag && searchPhrase;

    const canShowClearFilterElement =
      showClearTag && showClearFilterTagByScenario();

    const createFilterTagElement = (
      key: string,
      tag: string,
      onClick: () => void
    ) => (
      <TagWrapper key={key}>
        {React.createElement(filterTagComponent, {
          tag,
          onClick,
        })}
      </TagWrapper>
    );

    const createClearAllTagElement = (onClick: () => void) => (
      <TagWrapper>
        {React.createElement(clearTagComponent, {
          onClick,
        })}
      </TagWrapper>
    );

    return (
      <TagRow
        data-testid="document-filter-container"
        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          event.stopPropagation();
        }}
      >
        {(entries || []).map(([facet, activeFacetItems]) => {
          // "Batch" the dates into one tag
          if (isDocumentDateFacet(facet) && activeFacetItems.length > 0) {
            const tag = formatTag(facet, activeFacetItems);
            return createFilterTagElement(`${facet}-document-tags`, tag, () =>
              handleClearFilterClicked({ facet, original: activeFacetItems })
            );
          }

          // For the rest, map and show the tag
          return (activeFacetItems as (string | { externalId: string })[]).map(
            (item) => {
              const tag = formatTag(facet, item);
              return createFilterTagElement(
                `${facet}-${item}-document-tags`,
                tag,
                () =>
                  handleClearFilterClicked({
                    facet,
                    original: item,
                  })
              );
            }
          );
        })}
        {canShowGeoFilters &&
          clearPolygon &&
          createFilterTagElement(
            `${selectedFeature}-document-tags`,
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
          createClearAllTagElement(() => {
            handleClearAllClick();
          })}
      </TagRow>
    );
  }
);
