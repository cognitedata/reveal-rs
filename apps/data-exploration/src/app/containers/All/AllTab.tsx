import { useLocation, useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import {
  SequenceSummary,
  AssetSummary,
  TimeseriesSummary,
  DocumentSummary,
  FileSummary,
  EventSummary,
  ResourceType,
  ResourceTypes,
} from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk';

import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { SearchResultWrapper } from '@data-exploration-app/containers/elements';
import {
  useCurrentResourceId,
  useCurrentResourceType,
  useQueryString,
} from '@data-exploration-app/hooks/hooks';
import { useCommonFilters } from '@data-exploration-app/store';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { getSearchParams } from '@data-exploration-app/utils/URLUtils';

import {
  useBreakJourneyPromptToggle,
  useJourneyLength,
  usePushJourney,
} from '../../hooks/detailsNavigation';
import {
  useFlagOverlayNavigation,
  useFlagAdvancedFilters,
  useFlagDocumentsApiEnabled,
} from '../../hooks/flags';

export const AllTab = () => {
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const isDetailsOverlayEnabled = useFlagOverlayNavigation();
  const isDocumentsApiEnabled = useFlagDocumentsApiEnabled();
  const [commonFilters] = useCommonFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [_, setCurrentResourceType] = useCurrentResourceType();
  const [, openPreview] = useCurrentResourceId();
  const location = useLocation();
  const navigate = useNavigate();
  const search = getSearchParams(location.search);
  const [pushJourney] = usePushJourney();
  const [journeyLength] = useJourneyLength();
  const [, setPromptOpen] = useBreakJourneyPromptToggle();

  const handleAllResultsClick = (type: ResourceType) => {
    trackUsage(EXPLORATION.CLICK.ALL_RESULTS, { resourceType: type });
    setCurrentResourceType(type);
  };

  // We use the same function for both root asset and direct asset click.
  // TODO: for journey?
  const handleParentAssetClick = (
    rootAsset: Asset,
    resourceId?: number,
    type?: ResourceType
  ) => {
    openPreview(resourceId, false, ResourceTypes.Asset, rootAsset.id, type);
  };

  const handleSummaryRowClick = (rowType: ResourceType, id: number) => {
    if (isDetailsOverlayEnabled) {
      if (journeyLength > 1) {
        // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
        // console.log('TODO: here show modal and ask to terminate journey');
        setPromptOpen(true, { id, type: rowType });
      } else {
        pushJourney({ id, type: rowType }, true);
      }
    } else {
      navigate(createLink(`/explore/${rowType}/${id}`, search), {
        state: {
          history: location.state?.history,
        },
      });
    }
  };

  return (
    <SearchResultWrapper>
      <AllTabContainer>
        <AssetSummary
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
          filter={commonFilters}
          query={query}
          onRowClick={(row) =>
            handleSummaryRowClick(ResourceTypes.Asset, row.id)
          }
          onAllResultsClick={() => handleAllResultsClick(ResourceTypes.Asset)}
        />
        <TimeseriesSummary
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
          filter={commonFilters}
          query={query}
          onRowClick={(row) =>
            handleSummaryRowClick(ResourceTypes.TimeSeries, row.id)
          }
          onAllResultsClick={() =>
            handleAllResultsClick(ResourceTypes.TimeSeries)
          }
          onRootAssetClick={(rootAsset, resourceId) =>
            handleParentAssetClick(
              rootAsset,
              resourceId,
              ResourceTypes.TimeSeries
            )
          }
        />
        {isDocumentsApiEnabled ? (
          <DocumentSummary
            filter={commonFilters}
            query={query}
            onRowClick={(row) =>
              handleSummaryRowClick(ResourceTypes.File, row.id)
            }
            onAllResultsClick={() => handleAllResultsClick(ResourceTypes.File)}
            onRootAssetClick={(rootAsset, resourceId) =>
              handleParentAssetClick(rootAsset, resourceId, ResourceTypes.File)
            }
          />
        ) : (
          <FileSummary
            filter={commonFilters}
            query={query}
            onRowClick={(row) =>
              handleSummaryRowClick(ResourceTypes.File, row.id)
            }
            onAllResultsClick={() => handleAllResultsClick(ResourceTypes.File)}
            onDirectAssetClick={(directAsset, resourceId) =>
              handleParentAssetClick(
                directAsset,
                resourceId,
                ResourceTypes.File
              )
            }
          />
        )}
        <EventSummary
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
          filter={commonFilters}
          query={query}
          onRowClick={(row) =>
            handleSummaryRowClick(ResourceTypes.Event, row.id)
          }
          onAllResultsClick={() => handleAllResultsClick(ResourceTypes.Event)}
          onDirectAssetClick={(directAsset, resourceId) =>
            handleParentAssetClick(directAsset, resourceId, ResourceTypes.Event)
          }
        />
        <SequenceSummary
          filter={commonFilters}
          query={query}
          isAdvancedFiltersEnabled={isAdvancedFiltersEnabled}
          onRowClick={(row) =>
            handleSummaryRowClick(ResourceTypes.Sequence, row.id)
          }
          onAllResultsClick={() =>
            handleAllResultsClick(ResourceTypes.Sequence)
          }
          onRootAssetClick={(rootAsset, resourceId) =>
            handleParentAssetClick(
              rootAsset,
              resourceId,
              ResourceTypes.Sequence
            )
          }
        />
      </AllTabContainer>
    </SearchResultWrapper>
  );
};

const AllTabContainer = styled.div`
  padding: 16px;
  display: grid;
  grid-gap: 16px;
  height: 100%;
  overflow-y: auto;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: max-content;

  & > * {
    min-height: 365px;
    height: 100%;
    min-width: 380px;
    width: 100%;
  }
  & > *:last-child {
    grid-column: 1 / -1;
  }
`;
