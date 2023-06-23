import { useCallback, useEffect, useMemo, useState } from 'react';

import styled from 'styled-components';

import {
  BulkActionBar,
  ExplorationFilterToggle,
} from '@data-exploration/components';
import { RowSelectionState, Updater } from '@tanstack/react-table';
import isEmpty from 'lodash/isEmpty';
import mapValues from 'lodash/mapValues';
import noop from 'lodash/noop';
import { useDebounce } from 'use-debounce';

import { Button, Divider, Flex, Input } from '@cognite/cogs.js';

import {
  EMPTY_OBJECT,
  ResourceItem,
  ResourceSelectorFilter,
  ResourceType,
  useDialog,
  ViewType,
} from '@data-exploration-lib/core';

import {
  AssetsTab,
  FilesTab,
  EventsTab,
  ResourceTypeTabs,
  SequenceTab,
  ThreeDTab,
  TimeseriesTab,
} from '../ResourceTabs';
import { SidebarFilters } from '../Search';

import { ResourceSelectorDetails } from './ResourceSelectorDetails';
import { ResourceSelectorTable } from './ResourceSelectorTable';
import { useFilterState } from './useFilterState';

const DEFAULT_VISIBLE_RESOURCE_TABS: ResourceType[] = [
  'asset',
  'file',
  'event',
  'timeSeries',
];

const initialSelectedRows = {
  asset: {},
  file: {},
  timeSeries: {},
  sequence: {},
  threeD: {},
  event: {},
};

type SelectionProps =
  | {
      selectionMode: 'single';
      onSelect?: (item: ResourceItem) => void;
    }
  | { selectionMode: 'multiple'; onSelect?: (items: ResourceItem[]) => void };

export type ResourceSelection = Record<
  ResourceType,
  Record<string, ResourceItem>
>;

export type ResourceSelectorProps = {
  visibleResourceTabs?: ResourceType[];
  initialFilter?: ResourceSelectorFilter;
  initialSelectedResource?: ResourceItem;
  addButtonText?: string;
  isDocumentsApiEnabled?: boolean;
  shouldShowPreviews?: boolean;
} & SelectionProps;

export const ResourceSelector = ({
  visibleResourceTabs = DEFAULT_VISIBLE_RESOURCE_TABS,
  selectionMode = 'single',
  initialFilter = EMPTY_OBJECT,
  onSelect = noop,
  initialSelectedResource,
  isDocumentsApiEnabled = true,
  addButtonText,
  shouldShowPreviews = true,
}: ResourceSelectorProps) => {
  const { filterState, updateFilterType, resetFilterType } =
    useFilterState(initialFilter);
  const [query, setQuery] = useState<string>('');
  const { isOpen: showFilter, toggle: onToggleFilter } = useDialog();
  const [activeKey, setActiveKey] = useState(visibleResourceTabs[0]);
  const [previewItem, setPreviewItem] = useState<ResourceItem>();
  const [selectedRows, setSelectedRows] =
    useState<ResourceSelection>(initialSelectedRows);

  useEffect(() => {
    if (initialSelectedResource === undefined) {
      return;
    }

    setPreviewItem(initialSelectedResource);
    setActiveKey(initialSelectedResource.type);
  }, [initialSelectedResource]);

  const [debouncedQuery] = useDebounce(query, 100);
  const allSelectedRows = useMemo(
    () =>
      Object.entries(selectedRows)
        .filter(([_, value]) => !isEmpty(value))
        .reduce((acc, item) => {
          acc.push(
            ...Object.values(item[1]).map((value) => ({
              ...value,
              type: item[0] as ResourceType,
            }))
          );
          return acc;
        }, [] as ResourceItem[]),
    [selectedRows]
  );

  const actionBarOptions = useMemo(
    () =>
      allSelectedRows.map((value) => ({
        name: value.externalId || `${value.id}`,
        type: value.type,
      })),
    [allSelectedRows]
  );
  const onDetailRowSelection = useCallback(
    (
      updater?: Updater<RowSelectionState>,
      currentData?: ResourceItem[],
      resourceType?: ResourceType
    ) => {
      setSelectedRows((prev) => {
        if (updater && currentData && resourceType) {
          if (typeof updater === 'function') {
            return {
              ...prev,
              [resourceType]: mapValues(
                updater(
                  mapValues(prev[resourceType], function (resourceItem) {
                    return Boolean(resourceItem?.id);
                  })
                ),
                function (_, key) {
                  return currentData.find((item) => String(item?.id) === key);
                }
              ),
            };
          }
          return {
            ...prev,
            [resourceType]: mapValues(updater, function (_, key) {
              return currentData.find((item) => String(item?.id) === key);
            }),
          };
        }
        return {
          ...prev,
          [previewItem!.type]: {
            ...prev[previewItem!.type],
            [previewItem!.id]: previewItem,
          },
        };
      });
    },
    [previewItem]
  );

  return (
    <ResourceSelectorWrapper>
      <FilterWrapper visible={showFilter}>
        <SidebarFilters
          query={query}
          enableDocumentLabelsFilter
          isDocumentsApiEnabled={isDocumentsApiEnabled}
          filter={filterState}
          onFilterChange={(resourceType, currentFilter) => {
            updateFilterType(resourceType, currentFilter);
          }}
          resourceType={activeKey}
          onResetFilterClick={resetFilterType}
        />
      </FilterWrapper>

      <MainSearchContainer>
        <SearchInputContainer>
          <>
            <ExplorationFilterToggle
              filterState={showFilter}
              onClick={onToggleFilter}
            />
            <Divider direction="vertical" />
          </>
          <InputWrapper>
            <Input
              size="large"
              variant="noBorder"
              autoFocus
              fullWidth
              icon="Search"
              placeholder="Search..."
              onChange={(ev) => setQuery(ev.target.value)}
              value={query}
            />
          </InputWrapper>
        </SearchInputContainer>

        <ResourceTypeTabs
          currentResourceType={activeKey}
          setCurrentResourceType={(tab) => setActiveKey(tab as ResourceType)}
        >
          {visibleResourceTabs.map((tab) => {
            if (tab === 'asset')
              return (
                <AssetsTab
                  key={tab}
                  tabKey={ViewType.Asset}
                  label="Assets"
                  query={debouncedQuery}
                  filter={{ ...filterState.common, ...filterState.asset }}
                />
              );
            if (tab === 'event')
              return (
                <EventsTab
                  key={tab}
                  tabKey={ViewType.Event}
                  query={debouncedQuery}
                  filter={{ ...filterState.common, ...filterState.event }}
                  label="Events"
                />
              );
            if (tab === 'file')
              return (
                <FilesTab
                  key={tab}
                  tabKey={ViewType.File}
                  query={debouncedQuery}
                  filter={{
                    ...filterState.common,
                    ...(isDocumentsApiEnabled
                      ? filterState.document
                      : filterState.file),
                  }}
                  isDocumentsApiEnabled={isDocumentsApiEnabled}
                />
              );
            if (tab === 'timeSeries')
              return (
                <TimeseriesTab
                  key={tab}
                  tabKey={ViewType.TimeSeries}
                  query={debouncedQuery}
                  filter={{
                    ...filterState.common,
                    ...filterState.timeSeries,
                  }}
                  label="Time Series"
                />
              );
            if (tab === 'sequence')
              return (
                <SequenceTab
                  tabKey={ViewType.Sequence}
                  query={debouncedQuery}
                  filter={{
                    ...filterState.common,
                    ...filterState.sequence,
                  }}
                  label="Sequence"
                />
              );
            return (
              <ThreeDTab tabKey={ViewType.ThreeD} query={debouncedQuery} />
            );
          })}
        </ResourceTypeTabs>
        <MainContainer>
          <ResourceSelectorTable
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            filter={filterState}
            selectionMode={selectionMode}
            query={debouncedQuery}
            resourceType={activeKey}
            isDocumentsApiEnabled={isDocumentsApiEnabled}
            shouldShowPreviews={shouldShowPreviews}
            onFilterChange={(nextState) => {
              if (isDocumentsApiEnabled) {
                updateFilterType(
                  activeKey === 'file' ? 'document' : activeKey,
                  nextState
                );
              } else {
                updateFilterType(activeKey, nextState);
              }
            }}
            onClick={({ id, externalId }) => {
              setPreviewItem({ id, externalId, type: activeKey });
            }}
          />
        </MainContainer>
      </MainSearchContainer>
      {previewItem && (
        <ResourcePreviewSidebarWrapper>
          <ResourceSelectorDetails
            item={previewItem}
            closable={true}
            onClose={() => setPreviewItem(undefined)}
            selectionMode={selectionMode}
            selectedRows={selectedRows}
            onSelect={onDetailRowSelection}
            isSelected={Boolean(selectedRows[previewItem.type][previewItem.id])}
            visibleResources={visibleResourceTabs}
            isDocumentsApiEnabled={isDocumentsApiEnabled}
          />
        </ResourcePreviewSidebarWrapper>
      )}
      <BulkActionBar
        options={actionBarOptions}
        title="Selected"
        subtitle={`${actionBarOptions.length} items`}
        isVisible={actionBarOptions.length > 0}
      >
        <Button
          icon="Add"
          onClick={() => {
            if (selectionMode === 'multiple') onSelect(allSelectedRows as any);
            if (selectionMode === 'single') onSelect(allSelectedRows[0] as any);
            setSelectedRows(initialSelectedRows);
          }}
          inverted
          type="primary"
        >
          {addButtonText ?? 'Add'}
        </Button>
        <BulkActionBar.Separator />
        <Button
          icon="Close"
          onClick={() => setSelectedRows(initialSelectedRows)}
          inverted
        />
      </BulkActionBar>
    </ResourceSelectorWrapper>
  );
};

const ResourceSelectorWrapper = styled.div`
  display: flex;
  flex: 0 0 auto;
  position: relative;
  height: 100%;
`;
const MainSearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  flex: 1;
  overflow: auto;
`;
const FilterWrapper = styled.div<{ visible?: boolean }>`
  width: ${({ visible }) => (visible ? '260px' : '0px')};
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-left: 1px;
  border-right: 1px solid var(--cogs-border--muted);

  visibility: ${({ visible }) => (visible ? 'visible' : 'hidden')};
  transition: visibility 0s linear 200ms, width 200ms ease;
`;

const InputWrapper = styled.div`
  width: 93%;
`;

const SearchInputContainer = styled(Flex)`
  padding: 16px;
  padding-bottom: 12px;
  align-items: center;
  display: flex;
  gap: 8px;
`;

const MainContainer = styled(Flex)<{ isFilterFeatureEnabled?: boolean }>`
  height: 100%;
  flex: 1;
  overflow: auto;
`;

const ResourcePreviewSidebarWrapper = styled.div`
  width: 360px;
  margin: 12px;
  flex: 1;
  border-left: 1px solid var(--cogs-border--muted);
`;
