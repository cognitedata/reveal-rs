import React, { useEffect, useContext } from 'react';
import {
  ResourceItem,
  AssetSearchResults,
  FileSearchResults,
  SequenceSearchResults,
  TimeseriesSearchResults,
  EventSearchResults,
  DocumentSearchResults,
  ResourceTypeTabs,
  ResourceTypeTabsV2,
  getTitle,
  ResourceType,
  SearchFilters as OldSearchFilters,
  AssetViewMode,
  AssetsTab,
  EventsTab,
  DocumentsTab,
  TimeseriesTab,
  SequenceTab,
  ThreeDTab,
} from '@cognite/data-exploration';

import { Colors, Flex, Tabs } from '@cognite/cogs.js';
import { trackUsage } from 'app/utils/Metrics';
import ResourceSelectionContext, {
  useResourceFilter,
  useResourceEditable,
} from 'app/context/ResourceSelectionContext';
import { useDebounce } from 'use-debounce';
import styled from 'styled-components/macro';
import ResourcePreview from 'app/containers/Exploration/ResourcePreview';
import {
  useQueryString,
  useQueryStringArray,
  useCurrentResourceType,
  useCurrentResourceId,
} from 'app/hooks/hooks';
import { SEARCH_KEY, CART_KEY } from 'app/utils/constants';
import SelectedResults from 'app/components/SelectionResults/SelectionResults';
import { ExplorationSearchBar } from 'app/containers/Exploration/ExplorationSearchBar';
import { useDateRange } from 'app/context/DateRangeContext';
import { createLink, PageTitle } from '@cognite/cdf-utilities';
import { ThreeDSearchResults } from 'app/containers/ThreeD/ThreeDSearchResults';
import FilterToggleButton from './FilterToggleButton';
import { ExplorationFilterToggle } from 'app/containers/Exploration/ExplorationFilterToggle';
import { useFlagFilter, useFlagDocumentSearch } from 'app/hooks/flags';
import { SearchFilters } from 'app/containers/SearchResults/SearchFilters';
import {
  useAssetFilters,
  useEventsFilters,
  useFileFilters,
  useSequenceFilters,
  useTimeseriesFilters,
} from 'app/store/filter/selectors';
import { StyledSplitter } from 'app/containers/elements';
import { useDocumentFilters } from 'app/store/filter/selectors/documentSelectors';
import { useNavigate } from 'react-router-dom';
import { useFlagAdvancedFilters } from 'app/hooks/flags/useFlagAdvancedFilters';
import { AllTab } from 'app/containers/All';
import { useAssetViewState, useFilterSidebarState } from 'app/store';
import { EXPLORATION } from 'app/constants/metrics';

const getPageTitle = (query: string, resourceType?: ResourceType): string => {
  return `${query}${query ? ' in' : ''} ${
    resourceType ? getTitle(resourceType, true) : 'All'
  }`;
};

function SearchPage() {
  const navigate = useNavigate();
  const isFilterFeatureEnabled = useFlagFilter();
  const isAdvancedFiltersEnabled = useFlagAdvancedFilters();
  const isDocumentEnabled = useFlagDocumentSearch(); // Adding the flag to manually enable 'Documents' tab to appear.

  const [currentResourceType, setCurrentResourceType] =
    useCurrentResourceType();

  const [activeId, openPreview] = useCurrentResourceId();
  const [showFilter, setShowFilter] = useFilterSidebarState();
  const [assetView, setAssetView] = useAssetViewState();
  const [query] = useQueryString(SEARCH_KEY);
  const [debouncedQuery] = useDebounce(query, 100);

  const editable = useResourceEditable();

  const [rawCart, setCart] = useQueryStringArray(CART_KEY, false);
  const cart = rawCart
    .map(s => parseInt(s, 10))
    .filter(n => Number.isFinite(n));

  const [assetFilter, setAssetFilter] = useAssetFilters();
  const [fileFilter, setFileFilter] = useFileFilters();
  const [documentFilter, setDocumentFilter] = useDocumentFilters();
  const [eventFilter, setEventFilter] = useEventsFilters();
  const [timeseriesFilter, setTimeseriesFilter] = useTimeseriesFilters();
  const [sequenceFilter, setSequenceFilter] = useSequenceFilters();

  const { mode } = useContext(ResourceSelectionContext);

  const onSelect = (item: ResourceItem) => {
    const newCart = cart.includes(item.id)
      ? cart.filter(id => id !== item.id)
      : cart.concat([item.id]);
    setCart(newCart);
  };

  const active = !!activeId || cart.length > 0;

  const isSelected = (item: ResourceItem) => cart.includes(item.id);

  const [dateRange, setDateRange] = useDateRange();

  const commonProps = {
    query: debouncedQuery,
    onSelect,
    selectionMode: mode,
    isSelected,
    activeIds: activeId ? [activeId] : [],
    disableScroll: !!activeId,
    dateRange,
    onDateRangeChange: setDateRange,
  };

  const handleFilterToggleClick = React.useCallback(() => {
    setShowFilter(prevState => {
      trackUsage(EXPLORATION.CLICK.TOGGLE_FILTERS_VIEW, {
        tab: currentResourceType,
        showFilters: !prevState,
      });
      return !prevState;
    }); // eslint-disable-next-line
  }, [setShowFilter]);

  const handleRowClick = <T extends Omit<ResourceItem, 'type'>>(item: T) => {
    openPreview(item.id !== activeId ? item.id : undefined);
  };

  const handleViewChange = (nextView: AssetViewMode) => {
    setAssetView(nextView);
    trackUsage(EXPLORATION.CLICK.TOGGLE_ASSET_TABLE_VIEW, { view: nextView });
  };

  if (isFilterFeatureEnabled) {
    return (
      <RootHeightWrapperNew>
        <SearchFiltersWrapper>
          <SearchFilters
            resourceType={currentResourceType}
            visible={currentResourceType !== 'threeD' && showFilter}
          />
        </SearchFiltersWrapper>

        <MainSearchContainer>
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

            <ExplorationSearchBar />
          </SearchInputContainer>

          <TabsContainer>
            {isAdvancedFiltersEnabled && isDocumentEnabled ? (
              <ResourceTypeTabsV2
                currentResourceType={currentResourceType || 'all'}
                setCurrentResourceType={tab => {
                  setCurrentResourceType(
                    tab === 'all' ? undefined : (tab as ResourceType)
                  );
                }}
              >
                <Tabs.TabPane key="all" tab="All" />
                <Tabs.TabPane
                  key="asset"
                  tab={
                    <AssetsTab
                      showCount
                      query={debouncedQuery}
                      filter={assetFilter}
                    />
                  }
                />
                <Tabs.TabPane
                  key="timeSeries"
                  tab={
                    <TimeseriesTab
                      showCount
                      query={debouncedQuery}
                      filter={timeseriesFilter}
                    />
                  }
                />
                <Tabs.TabPane
                  key="document"
                  tab={
                    <DocumentsTab
                      query={debouncedQuery}
                      filter={documentFilter}
                      showCount
                    />
                  }
                />
                <Tabs.TabPane
                  key="event"
                  tab={
                    <EventsTab
                      showCount
                      query={debouncedQuery}
                      filter={eventFilter}
                    />
                  }
                />
                <Tabs.TabPane
                  key="sequence"
                  tab={
                    <SequenceTab
                      showCount
                      query={debouncedQuery}
                      filter={sequenceFilter}
                    />
                  }
                />
                <Tabs.TabPane
                  key="threeD"
                  tab={<ThreeDTab showCount query={debouncedQuery} />}
                />
              </ResourceTypeTabsV2>
            ) : (
              <ResourceTypeTabs
                showCount
                query={query}
                currentResourceType={currentResourceType || 'all'}
                setCurrentResourceType={tab => {
                  setCurrentResourceType(
                    tab === 'all' ? undefined : (tab as ResourceType)
                  );
                }}
                isDocumentEnabled={isDocumentEnabled}
                additionalTabs={[<Tabs.TabPane tab="All" key="all" />]}
              />
            )}
          </TabsContainer>

          <MainContainer $isFilterFeatureEnabled={isFilterFeatureEnabled}>
            <Wrapper>
              <StyledSplitter
                primaryMinSize={420}
                secondaryInitialSize={700}
                primaryIndex={0}
              >
                <Flex
                  direction="column"
                  style={{
                    borderRight: active
                      ? `1px solid ${Colors['greyscale-grey3'].hex()}`
                      : 'unset',
                  }}
                >
                  <SearchResultWrapper>
                    {currentResourceType === 'asset' && (
                      <AssetSearchResults
                        isTreeEnabled
                        showCount
                        view={assetView}
                        onViewChange={handleViewChange}
                        filter={assetFilter}
                        enableAdvancedFilters={isAdvancedFiltersEnabled}
                        onClick={handleRowClick}
                        onFilterChange={(newValue: Record<string, unknown>) =>
                          setAssetFilter(newValue)
                        }
                        {...commonProps}
                      />
                    )}
                    {currentResourceType === undefined && <AllTab />}
                    {currentResourceType === 'file' && (
                      <FileSearchResults
                        showCount
                        filter={fileFilter}
                        allowEdit={editable}
                        onClick={handleRowClick}
                        onFilterChange={(newValue: Record<string, unknown>) =>
                          setFileFilter(newValue)
                        }
                        {...commonProps}
                      />
                    )}
                    {currentResourceType === 'document' && (
                      <DocumentSearchResults
                        query={query}
                        filter={documentFilter}
                        onClick={handleRowClick}
                        onFilterChange={(newValue: Record<string, unknown>) =>
                          setDocumentFilter(newValue)
                        }
                      />
                    )}
                    {currentResourceType === 'sequence' && (
                      <SequenceSearchResults
                        showCount
                        onClick={handleRowClick}
                        enableAdvancedFilters={isAdvancedFiltersEnabled}
                        onFilterChange={(newValue: Record<string, unknown>) =>
                          setSequenceFilter(newValue)
                        }
                        filter={sequenceFilter}
                        {...commonProps}
                      />
                    )}
                    {currentResourceType === 'timeSeries' && (
                      <TimeseriesSearchResults
                        showCount
                        enableAdvancedFilters={isAdvancedFiltersEnabled}
                        onClick={handleRowClick}
                        onFilterChange={(newValue: Record<string, unknown>) =>
                          setTimeseriesFilter(newValue)
                        }
                        filter={timeseriesFilter}
                        showDatePicker={!activeId}
                        {...commonProps}
                      />
                    )}
                    {currentResourceType === 'event' && (
                      <EventSearchResults
                        showCount
                        enableAdvancedFilters={isAdvancedFiltersEnabled}
                        onClick={handleRowClick}
                        onFilterChange={(newValue: Record<string, unknown>) =>
                          setEventFilter(newValue)
                        }
                        filter={eventFilter}
                        {...commonProps}
                      />
                    )}
                    {currentResourceType === 'threeD' && (
                      <ThreeDSearchResults
                        onClick={(item: ResourceItem) => {
                          navigate(createLink(`/explore/threeD/${item.id}`));
                        }}
                        query={query}
                      />
                    )}
                  </SearchResultWrapper>
                </Flex>

                {active && activeId && currentResourceType && (
                  <SearchResultWrapper>
                    <ResourcePreview
                      item={{ id: activeId, type: currentResourceType }}
                    />
                  </SearchResultWrapper>
                )}
                {!activeId && currentResourceType && cart.length > 0 && (
                  <SelectedResults
                    ids={cart.map(id => ({ id }))}
                    resourceType={currentResourceType}
                  />
                )}
              </StyledSplitter>
            </Wrapper>
          </MainContainer>
        </MainSearchContainer>
      </RootHeightWrapperNew>
    );
  }

  return (
    <RootHeightWrapper>
      <SearchInputContainer alignItems="center">
        {isFilterFeatureEnabled && (
          <>
            <ExplorationFilterToggle
              filterState={showFilter}
              onClick={handleFilterToggleClick}
            />
            <VerticalDivider />
          </>
        )}
        <ExplorationSearchBar />
      </SearchInputContainer>
      <TabsContainer>
        <ResourceTypeTabs
          showCount
          query={query}
          currentResourceType={currentResourceType}
          setCurrentResourceType={tab =>
            setCurrentResourceType(tab as ResourceType)
          }
          isDocumentEnabled={isDocumentEnabled}
        />
      </TabsContainer>
      <MainContainer $isFilterFeatureEnabled={isFilterFeatureEnabled}>
        {currentResourceType !== 'threeD' && !showFilter && (
          <FilterWrapper>
            <FilterToggleButton toggleOpen={handleFilterToggleClick} />
          </FilterWrapper>
        )}

        <SearchFiltersWrapper>
          {isFilterFeatureEnabled ? (
            <SearchFilters
              resourceType={currentResourceType}
              visible={currentResourceType !== 'threeD' && showFilter}
            />
          ) : (
            <OldSearchFilters
              assetFilter={assetFilter}
              setAssetFilter={setAssetFilter}
              timeseriesFilter={timeseriesFilter}
              setTimeseriesFilter={setTimeseriesFilter}
              sequenceFilter={sequenceFilter}
              setSequenceFilter={setSequenceFilter}
              eventFilter={eventFilter}
              setEventFilter={setEventFilter}
              fileFilter={fileFilter}
              setFileFilter={setFileFilter}
              resourceType={currentResourceType}
              closeFilters={handleFilterToggleClick}
              visible={currentResourceType !== 'threeD' && showFilter}
            />
          )}
        </SearchFiltersWrapper>

        <Wrapper>
          <StyledSplitter secondaryMinSize={415} primaryIndex={1}>
            <Flex
              direction="column"
              style={{
                borderRight: active
                  ? `1px solid ${Colors['greyscale-grey3'].hex()}`
                  : 'unset',
              }}
            >
              <SearchResultWrapper>
                {currentResourceType === 'asset' && (
                  <AssetSearchResults
                    showCount
                    enableAdvancedFilters={isAdvancedFiltersEnabled}
                    onClick={(item: ResourceItem) =>
                      openPreview(item.id !== activeId ? item.id : undefined)
                    }
                    view={assetView}
                    onViewChange={handleViewChange}
                    filter={assetFilter}
                    {...commonProps}
                    isTreeEnabled
                  />
                )}
                {currentResourceType === 'file' && (
                  <FileSearchResults
                    showCount
                    filter={fileFilter}
                    allowEdit={editable}
                    onClick={handleRowClick}
                    {...commonProps}
                  />
                )}
                {currentResourceType === 'document' && (
                  <DocumentSearchResults
                    query={query}
                    filter={fileFilter}
                    onClick={(item: ResourceItem) => {
                      openPreview(item.id !== activeId ? item.id : undefined);
                    }}
                  />
                )}
                {currentResourceType === 'sequence' && (
                  <SequenceSearchResults
                    showCount
                    enableAdvancedFilters={isAdvancedFiltersEnabled}
                    onClick={handleRowClick}
                    filter={sequenceFilter}
                    {...commonProps}
                  />
                )}
                {currentResourceType === 'timeSeries' && (
                  <TimeseriesSearchResults
                    showCount
                    enableAdvancedFilters={isAdvancedFiltersEnabled}
                    onClick={handleRowClick}
                    filter={timeseriesFilter}
                    showDatePicker={!activeId}
                    {...commonProps}
                  />
                )}
                {currentResourceType === 'event' && (
                  <EventSearchResults
                    showCount
                    enableAdvancedFilters={isAdvancedFiltersEnabled}
                    onClick={handleRowClick}
                    filter={eventFilter}
                    {...commonProps}
                  />
                )}
                {currentResourceType === 'threeD' && (
                  <ThreeDSearchResults
                    onClick={(item: ResourceItem) => {
                      navigate(createLink(`/explore/threeD/${item.id}`));
                    }}
                    query={query}
                  />
                )}
              </SearchResultWrapper>
            </Flex>

            {active && activeId && currentResourceType && (
              <SearchResultWrapper>
                <ResourcePreview
                  item={{ id: activeId, type: currentResourceType }}
                />
              </SearchResultWrapper>
            )}
            {!activeId && currentResourceType && cart.length > 0 && (
              <SelectedResults
                ids={cart.map(id => ({ id }))}
                resourceType={currentResourceType}
              />
            )}
          </StyledSplitter>
        </Wrapper>
      </MainContainer>
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

const SearchResultWrapper = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

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

const FilterWrapper = styled.div`
  padding-top: 1rem;
  border-right: 1px solid ${Colors['greyscale-grey3'].hex()};
  padding-right: 10px;
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
  flex-direction: column;
`;

const RootHeightWrapperNew = styled.div`
  height: 100%;
  display: flex;
  flex-direction: row;
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
