/**
 * Event Results Sidebar
 */

import { useState, useCallback, memo, ComponentProps } from 'react';

import {
  ContentContainer,
  OverlayContentOverflowWrapper,
  SidebarChip,
  SidebarHeaderActions,
  SmallSelect,
} from '@charts-app/components/Common/SidebarElements';
import {
  activeEventIdAtom,
  selectedEventsAtom,
} from '@charts-app/models/event-results/atom';
import { activeEventFilterResultsSelector } from '@charts-app/models/event-results/selectors';
import {
  EventsCollection,
  EventsEntry,
} from '@charts-app/models/event-results/types';
import { Col, Row } from 'antd';
import { orderBy } from 'lodash';
import { useRecoilState, useRecoilValue } from 'recoil';

import { Body, Button } from '@cognite/cogs.js';
import { CogniteEvent } from '@cognite/sdk';

import EventInfoBox from './EventInfoBox';
import { isEventSelected } from './helpers';

type Props = {
  onCloseEventResults: (id: string) => void;
  onShowEventDetail: () => void;
  translations?: ComponentProps<typeof EventInfoBox>['translations'];
};

const sortOptions = [
  { value: 'desc' as const, label: 'Newest' },
  { value: 'asc' as const, label: 'Oldest' },
];

const EventResultsSidebar = memo(
  ({ onCloseEventResults, onShowEventDetail, translations }: Props) => {
    // Get results
    const activeEventFilterResults = useRecoilValue(
      activeEventFilterResultsSelector
    );

    const [sortOption, setSortOption] = useState<(typeof sortOptions)[number]>(
      sortOptions[1]
    );

    const [selectedEvents, setSelectedEvents] =
      useRecoilState(selectedEventsAtom);

    const [activeEvent, setActiveEvent] = useRecoilState(activeEventIdAtom);

    const selectedEventResults = orderBy(
      activeEventFilterResults?.results?.filter((event) =>
        isEventSelected(selectedEvents, event)
      ),
      ['startTime'],
      [sortOption.value]
    );

    const remainingEventResults = orderBy(
      activeEventFilterResults?.results?.filter(
        (event) => !isEventSelected(selectedEvents, event)
      ),
      ['startTime'],
      [sortOption.value]
    );

    const handleSortList = (option: typeof sortOption) => {
      setSortOption(option);
    };

    const handleSetSelectedEventItems = useCallback(
      (id: number | undefined) => {
        if (!id) return;
        setSelectedEvents((prevVals: EventsCollection) => {
          const isSelected = prevVals.find((evt: EventsEntry) => evt.id === id);
          if (isSelected) {
            return prevVals.filter((val: EventsEntry) => val.id !== id);
          }

          return [{ id }, ...prevVals];
        });
      },
      [selectedEvents, setSelectedEvents]
    );

    const handleViewEvent = useCallback(
      (id: number | undefined) => {
        if (!id) return;
        setActiveEvent(id);
        onShowEventDetail();
      },
      [activeEvent, setActiveEvent, onShowEventDetail]
    );

    const handleClearAllSelection = useCallback(() => {
      setSelectedEvents([]);
    }, [selectedEvents, setSelectedEvents]);

    return (
      <OverlayContentOverflowWrapper>
        <ContentContainer>
          <SidebarHeaderActions>
            <Button
              onClick={() => onCloseEventResults('')}
              icon="ArrowLeft"
              size="small"
              aria-label="Back"
            >
              {translations?.Back || 'Back'}
            </Button>
            <SmallSelect
              title="Sort:"
              value={sortOption}
              onChange={handleSortList}
              options={sortOptions}
              width={140}
              disableTyping
            />
          </SidebarHeaderActions>
          {activeEventFilterResults && selectedEventResults?.length ? (
            <>
              <Row
                justify="space-between"
                align="middle"
                style={{ marginBottom: '8px' }}
              >
                <Col span={16}>
                  <Body size="small">
                    Selected results:{' '}
                    <SidebarChip
                      icon="Events"
                      size="small"
                      label={`${selectedEventResults?.length}`}
                    />
                  </Body>
                </Col>
                <Col>
                  <Button
                    size="small"
                    type="ghost-destructive"
                    onClick={handleClearAllSelection}
                  >
                    Clear all
                  </Button>
                </Col>
              </Row>
              {selectedEventResults.map((event: CogniteEvent) => {
                return (
                  <EventInfoBox
                    loading={activeEventFilterResults.isLoading}
                    key={event.id}
                    event={event}
                    onToggleEvent={handleSetSelectedEventItems}
                    onViewEvent={handleViewEvent}
                    translations={translations}
                    selected
                  />
                );
              })}
            </>
          ) : (
            ''
          )}

          {activeEventFilterResults && remainingEventResults?.length ? (
            <>
              <Row align="middle" style={{ marginBottom: '8px' }}>
                <Body size="small">
                  Other results:{' '}
                  <SidebarChip
                    icon="Events"
                    size="small"
                    label={`${remainingEventResults?.length}`}
                  />
                </Body>
              </Row>
              {remainingEventResults?.map((event: CogniteEvent) => {
                return (
                  <EventInfoBox
                    loading={activeEventFilterResults.isLoading}
                    key={event.id}
                    event={event}
                    onToggleEvent={handleSetSelectedEventItems}
                    onViewEvent={handleViewEvent}
                    translations={translations}
                  />
                );
              })}
            </>
          ) : (
            ''
          )}
        </ContentContainer>
      </OverlayContentOverflowWrapper>
    );
  }
);

export default EventResultsSidebar;
