import { Routes, Route } from 'react-router-dom';

import { TimeseriesSearchResults } from '@data-exploration/containers';
import { useDebounce } from 'use-debounce';

import { ResourceItem, ResourceTypes } from '@cognite/data-exploration';
import { Asset } from '@cognite/sdk/dist/src/types';

import { routes } from '@data-exploration-app/containers/App';
import { AssetPreview } from '@data-exploration-app/containers/Asset/AssetPreview';
import {
  StyledSplitter,
  SearchResultWrapper,
} from '@data-exploration-app/containers/elements';
import { TimeseriesPreview } from '@data-exploration-app/containers/Timeseries/TimeseriesPreview';
import {
  useDateRange,
  useFlagOverlayNavigation,
} from '@data-exploration-app/hooks';
import {
  useCurrentResourceId,
  useQueryString,
  useSelectedResourceId,
} from '@data-exploration-app/hooks/hooks';
import { useTimeseriesFilters } from '@data-exploration-app/store';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { getSelectedResourceId } from '@data-exploration-lib/core';

import {
  useGetJourney,
  useJourneyLength,
  usePushJourney,
  useBreakJourneyPromptState,
} from '../../hooks';

export const TimeseriesSearchResultView = () => {
  const [, openPreview] = useCurrentResourceId();
  const [timeseriesFilter, setTimeseriesFilter] = useTimeseriesFilters();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const isDetailsOverlayEnabled = useFlagOverlayNavigation();
  const [pushJourney] = usePushJourney();
  const [firstJourney] = useGetJourney();
  const [journeyLength] = useJourneyLength();
  const [, setPromptOpen] = useBreakJourneyPromptState();

  // Here we need to parse params to find selected timeseries' id.
  const selectedTimeseriesId = getSelectedResourceId(
    'timeSeries',
    firstJourney
  );
  const selectedRootAssetId = useSelectedResourceId(true);

  const selectedRow = selectedTimeseriesId
    ? { [selectedTimeseriesId]: true }
    : {};

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    if (isDetailsOverlayEnabled) {
      if (journeyLength > 1) {
        // If there is a journey going on (i.e. journey length is more than 1), then show the prompt modal.
        setPromptOpen(true, { id: item.id, type: 'timeSeries' });
      } else {
        pushJourney({ ...item, type: 'timeSeries' }, true);
      }
    } else {
      openPreview(item.id);
    }
  };

  const handleRootAssetClick = (rootAsset: Asset, resourceId?: number) => {
    if (isDetailsOverlayEnabled) {
      pushJourney({ id: rootAsset.id, type: 'asset' });
    } else {
      openPreview(resourceId, false, ResourceTypes.Asset, rootAsset.id);
    }
  };

  const [dateRange, setDateRange] = useDateRange();

  return (
    <StyledSplitter
      primaryMinSize={420}
      secondaryInitialSize={700}
      primaryIndex={0}
    >
      <SearchResultWrapper>
        <TimeseriesSearchResults
          showCount
          selectedRow={selectedRow}
          onClick={handleRowClick}
          onRootAssetClick={handleRootAssetClick}
          onFilterChange={(newValue: Record<string, unknown>) =>
            setTimeseriesFilter(newValue)
          }
          filter={timeseriesFilter}
          showDatePicker={true}
          query={debouncedQuery}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
      </SearchResultWrapper>

      {!isDetailsOverlayEnabled && Boolean(selectedTimeseriesId) && (
        <SearchResultWrapper>
          <Routes>
            <Route
              path={routes.viewDetail.path}
              element={
                <TimeseriesPreview timeseriesId={selectedTimeseriesId!} />
              }
            />
            <Route
              path={routes.viewDetailTab.path}
              element={
                <TimeseriesPreview timeseriesId={selectedTimeseriesId!} />
              }
            />
            <Route
              path={routes.viewAssetDetail.path}
              element={<AssetPreview assetId={selectedRootAssetId!} />}
            />
            <Route
              path={routes.viewAssetDetailTab.path}
              element={<AssetPreview assetId={selectedRootAssetId!} />}
            />
          </Routes>
        </SearchResultWrapper>
      )}
    </StyledSplitter>
  );
};
