import React, { useEffect, useMemo, useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import {
  ResourceTypeTabs,
  getTitle,
  ResourceType,
} from '@cognite/data-exploration';

import { SearchConfigButton } from '@data-exploration/components';
import {
  AssetsTab,
  DocumentsTab,
  EventsTab,
  SearchConfig,
  SequenceTab,
  ThreeDTab,
  TimeseriesTab,
  ResourceTypeTabs as ResourceTypeTabsV2,
} from '@data-exploration/containers';

import {
  useAssetsMetadataKeys,
  useTimeseriesMetadataKeys,
  useDocumentsMetadataKeys,
  useEventsMetadataKeys,
  useSequencesMetadataKeys,
} from '@data-exploration-lib/domain-layer';

import { Flex, Tabs } from '@cognite/cogs.js';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { useResourceFilter } from '@data-exploration-app/context/ResourceSelectionContext';
import { useDebounce } from 'use-debounce';
import styled from 'styled-components/macro';
import {
  useQueryString,
  useCurrentResourceType,
} from '@data-exploration-app/hooks/hooks';
import { SEARCH_KEY } from '@data-exploration-app/utils/constants';
import { ExplorationSearchBar } from '@data-exploration-app/containers/Exploration/ExplorationSearchBar';
import { PageTitle } from '@cognite/cdf-utilities';
import { ExplorationFilterToggle } from '@data-exploration-app/containers/Exploration/ExplorationFilterToggle';
// import { SearchFilters } from '@data-exploration-app/containers/SearchResults/SearchFilters';
import {
  useAssetFilters,
  useEventsFilters,
  useFileFilters,
  useSequenceFilters,
  useTimeseriesFilters,
} from '@data-exploration-app/store/filter/selectors';
import { useDocumentFilters } from '@data-exploration-app/store/filter/selectors/documentSelectors';
import { useFlagAdvancedFilters } from '@data-exploration-app/hooks/flags/useFlagAdvancedFilters';
import {
  useFlagDocumentGPT,
  useFlagDocumentLabelsFilter,
} from '@data-exploration-app/hooks';
import { AllTab } from '@data-exploration-app/containers/All';
import { useFilterSidebarState } from '@data-exploration-app/store';
import { EXPLORATION } from '@data-exploration-app/constants/metrics';
import { AssetSearchResultView } from '@data-exploration-app/containers/Asset/AssetSearchResultView';
import { TimeseriesSearchResultView } from '@data-exploration-app/containers/Timeseries/TimeseriesSearchResultView';
import { FileSearchResultView } from '@data-exploration-app/containers/File/FileSearchResultView';
import { EventSearchResultView } from '@data-exploration-app/containers/Event/EventSearchResultView';
import { SequenceSearchResultView } from '@data-exploration-app/containers/Sequence/SequenceSearchResultView';
import { ThreeDSearchResultView } from '@data-exploration-app/containers/ThreeD/ThreeDSearchResultView';
import { routes } from '@data-exploration-app/containers/App';
import { GPTInfobar } from '@data-exploration-app/components/GPTInfobar';
import { ViewType } from '@data-exploration-lib/core';
import { SearchFiltersV2 } from '../SearchResults/SearchFiltersV2';

const getPageTitle = (query: string, resourceType?: ResourceType): string => {
  return `${query}${query ? ' in' : ''} ${
    resourceType ? getTitle(resourceType, true) : 'All'
  }`;
};

function SearchPage() {
  // start fetching metadata keys as early as possible
  useAssetsMetadataKeys();
  useTimeseriesMetadataKeys();
  useDocumentsMetadataKeys();
  useEventsMetadataKeys();
  useSequencesMetadataKeys();

  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const isDocumentsLabelsFilterEnabled = useFlagDocumentLabelsFilter();

  const [currentResourceType, setCurrentResourceType] =
    useCurrentResourceType();

  const [showFilter, setShowFilter] = useFilterSidebarState();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);
  const [showSearchConfig, setShowSearchConfig] = useState<boolean>(false);

  const [assetFilter] = useAssetFilters();
  const [fileFilter] = useFileFilters();
  const [documentFilter] = useDocumentFilters();
  const [eventFilter] = useEventsFilters();
  const [timeseriesFilter] = useTimeseriesFilters();
  const [sequenceFilter] = useSequenceFilters();

  const isDocumentGPTEnabled = useFlagDocumentGPT();
  const [showGPTInfo, setShowGPTInfo] = useState<boolean>(true);

  const filterMap = useMemo(
    () => ({
      asset: assetFilter,
      timeSeries: timeseriesFilter,
      event: eventFilter,
      file: fileFilter,
      sequence: sequenceFilter,
    }),
    [assetFilter, fileFilter, eventFilter, timeseriesFilter, sequenceFilter]
  );

  const handleFilterToggleClick = React.useCallback(() => {
    setShowFilter((prevState) => {
      trackUsage(EXPLORATION.CLICK.TOGGLE_FILTERS_VIEW, {
        tab: currentResourceType,
        showFilters: !prevState,
      });
      return !prevState;
    }); // eslint-disable-next-line
  }, [setShowFilter]);

  return (
    <RootHeightWrapper>
      <SearchFiltersWrapper>
        <SearchFiltersV2
          enableAdvancedFilters={isAdvancedFiltersEnabled}
          enableDocumentLabelsFilter={isDocumentsLabelsFilterEnabled}
          resourceType={currentResourceType}
          visible={currentResourceType !== 'threeD' && showFilter}
        />
      </SearchFiltersWrapper>

      <MainSearchContainer>
        {isDocumentGPTEnabled &&
          currentResourceType === 'file' &&
          showGPTInfo && <GPTInfobar onClose={() => setShowGPTInfo(false)} />}
        <SearchInputContainer>
          {currentResourceType !== 'threeD' && (
            <>
              <ExplorationFilterToggle
                filterState={showFilter}
                onClick={handleFilterToggleClick}
              />
              <VerticalDivider />
            </>
          )}
          <SearchConfigButton
            style={{ marginRight: '2px' }}
            onClick={() => {
              setShowSearchConfig(true);
            }}
          />

          <ExplorationSearchBar />
        </SearchInputContainer>

        {/* Modal */}
        <SearchConfig
          visible={showSearchConfig}
          onCancel={() => setShowSearchConfig(false)}
          onSave={() => {
            setShowSearchConfig(false);
          }}
        />

        <TabsContainer>
          {isAdvancedFiltersEnabled ? (
            <ResourceTypeTabsV2
              currentResourceType={currentResourceType || ViewType.All}
              setCurrentResourceType={(tab) => {
                setCurrentResourceType(
                  tab === ViewType.All ? undefined : (tab as ResourceType)
                );
              }}
            >
              <Tabs.Tab tabKey={ViewType.All} label="All resources" />
              <AssetsTab
                tabKey={ViewType.Asset}
                query={debouncedQuery}
                filter={assetFilter}
              />
              <TimeseriesTab
                tabKey={ViewType.TimeSeries}
                query={debouncedQuery}
                filter={timeseriesFilter}
              />

              <DocumentsTab
                tabKey={ViewType.File}
                query={debouncedQuery}
                filter={documentFilter}
              />
              <EventsTab
                tabKey={ViewType.Event}
                query={debouncedQuery}
                filter={eventFilter}
              />
              <SequenceTab
                tabKey={ViewType.Sequence}
                query={debouncedQuery}
                filter={sequenceFilter}
              />
              <ThreeDTab tabKey={ViewType.ThreeD} query={debouncedQuery} />
            </ResourceTypeTabsV2>
          ) : (
            <ResourceTypeTabs
              globalFilters={filterMap as any}
              query={query}
              currentResourceType={currentResourceType || ViewType.All}
              setCurrentResourceType={(tab) => {
                setCurrentResourceType(
                  tab === ViewType.All ? undefined : (tab as ResourceType)
                );
              }}
              additionalTabs={[
                <Tabs.Tab
                  key={ViewType.All}
                  label="All resources"
                  tabKey={ViewType.All}
                />,
              ]}
            />
          )}
        </TabsContainer>

        <MainContainer $isFilterFeatureEnabled>
          <Wrapper>
            <Routes>
              <Route path={routes.root.path} element={<AllTab />} />
              <Route
                path={routes.assetView.path}
                element={<AssetSearchResultView />}
              />
              <Route
                path={routes.timeseriesView.path}
                element={<TimeseriesSearchResultView />}
              />
              <Route
                path={routes.fileView.path}
                element={<FileSearchResultView />}
              />
              <Route
                path={routes.eventView.path}
                element={<EventSearchResultView />}
              />
              <Route
                path={routes.sequenceView.path}
                element={<SequenceSearchResultView />}
              />
              <Route
                path={routes.threeDView.path}
                element={<ThreeDSearchResultView />}
              />
            </Routes>
          </Wrapper>
        </MainContainer>
      </MainSearchContainer>
    </RootHeightWrapper>
  );
}

export const SearchResultsPage = () => {
  const [resourceType] = useCurrentResourceType();

  const [query] = useQueryString(SEARCH_KEY);
  const filter = useResourceFilter(resourceType);

  useEffect(() => {
    trackUsage('Exploration.TabChange', { tab: resourceType });
  }, [resourceType]);

  useEffect(() => {
    trackUsage('Exploration.Filter', { tab: resourceType, filter });
  }, [resourceType, filter]);

  useEffect(() => {
    if (query) {
      trackUsage('Exploration.Search', { tab: resourceType, query });
    }
  }, [resourceType, query]);

  return (
    <>
      <PageTitle title={getPageTitle(query, resourceType)} />
      <SearchPage />
    </>
  );
};

const SearchInputContainer = styled(Flex)`
  padding: 16px;
  padding-bottom: 12px;
  align-items: center;
`;

const TabsContainer = styled.div`
  flex: 0 0 auto;
`;

const MainContainer = styled(Flex)<{ $isFilterFeatureEnabled?: boolean }>`
  padding-left: ${({ $isFilterFeatureEnabled }) =>
    $isFilterFeatureEnabled ? '0px' : '16px'};
  height: 100%;
  flex: 1;
  overflow: auto;
`;

const SearchFiltersWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
`;

const Wrapper = styled.div`
  display: flex;
  background: #fff;
  flex: 1 1 auto;
  min-width: 0;
`;

const RootHeightWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
  .cogs-tabs__list__tab {
    margin-right: 0 !important;
  }
`;

const VerticalDivider = styled.div`
  width: 1px;
  height: 16px;
  background-color: var(--cogs-border--muted);
  margin: 0px 8px;
`;

const MainSearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  /* width: calc(100% - 303px); */
  flex: 1;
  overflow: auto;
`;
