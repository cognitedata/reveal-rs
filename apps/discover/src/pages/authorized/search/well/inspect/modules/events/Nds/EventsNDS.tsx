import React, { useState } from 'react';
import { ResizableBox } from 'react-resizable';

import isEmpty from 'lodash/isEmpty';

import { CogniteEvent } from '@cognite/sdk';

import EmptyState from 'components/emptyState';
import { Loading } from 'components/loading';
import { Table } from 'components/tablev3';
import {
  LOG_EVENTS_NDS,
  LOG_WELLS_EVENTS_NDS_NAMESPACE,
} from 'constants/logging';
import {
  useCreateMetricAndStartTimeLogger,
  useStopTimeLogger,
  TimeLogStages,
} from 'hooks/useTimeLog';
import { useNdsEventsForTable } from 'modules/wellSearch/selectors';

import { NdsFilterWrapper, ResizeHandle } from '../elements';

import { getDataLayer } from './dataLayer';
import FilterContainer from './FilterContainer';
import { useGetNdsTableColumns } from './hooks/useHelpers';

const tableOptions = {
  flex: false,
  hideBorders: false,
  height: '100%',
  pagination: {
    enabled: true,
    pageSize: 50,
  },
};

const FILTER_PANEL_DEFAULT_HEIGHT = 200;
const FILTER_PANEL_MIN_SIZE: [number, number] = [50, 50];

export const EventsNds: React.FC = () => {
  const renderTimer = useCreateMetricAndStartTimeLogger(
    TimeLogStages.Render,
    LOG_EVENTS_NDS,
    LOG_WELLS_EVENTS_NDS_NAMESPACE
  );
  const columns = useGetNdsTableColumns();

  const { events, isLoading } = useNdsEventsForTable();
  const ndsEvents = getDataLayer(events);

  const [filteredEvents, setFilteredEvents] = useState<CogniteEvent[]>([]);

  useStopTimeLogger(renderTimer);
  if (isLoading) return <Loading />;

  return (
    <>
      <NdsFilterWrapper>
        <ResizableBox
          className="nds-events-expander"
          width={0}
          height={FILTER_PANEL_DEFAULT_HEIGHT}
          axis="y"
          minConstraints={FILTER_PANEL_MIN_SIZE}
          handle={<ResizeHandle />}
        >
          <FilterContainer
            events={ndsEvents}
            filteredEvents={filteredEvents}
            onChangeFilteredEvents={(events) => setFilteredEvents(events)}
          />
        </ResizableBox>
      </NdsFilterWrapper>

      {isEmpty(filteredEvents) ? (
        <EmptyState />
      ) : (
        <Table<CogniteEvent>
          scrollTable
          id="events-nds-table"
          data={filteredEvents || []}
          columns={columns}
          options={tableOptions}
        />
      )}
    </>
  );
};

export default EventsNds;
