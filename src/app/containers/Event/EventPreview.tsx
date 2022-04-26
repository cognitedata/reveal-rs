import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import {
  EventDetails,
  ErrorFeedback,
  Loader,
  Tabs,
  Metadata,
} from '@cognite/data-exploration';
import { renderTitle } from 'app/utils/EventsUtils';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { CogniteEvent } from '@cognite/sdk';
import { createLink } from '@cognite/cdf-utilities';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';

export type EventPreviewTabType =
  | 'details'
  | 'assets'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events';

export const EventPreview = ({
  eventId,
  actions,
}: {
  eventId: number;
  actions?: React.ReactNode;
}) => {
  const { tabType } = useParams<{
    tabType: EventPreviewTabType;
  }>();
  const activeTab = tabType || 'details';

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    trackUsage('Exploration.Preview.Event', { eventId });
  }, [eventId]);
  const {
    data: event,
    error,
    isFetched,
  } = useCdfItem<CogniteEvent>('events', {
    id: eventId,
  });

  if (!eventId || !Number.isFinite(eventId)) {
    return <>Invalid event id: {eventId}</>;
  }

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!event) {
    return <>Event {eventId} not found!</>;
  }

  return (
    <>
      <ResourceTitleRow
        item={{ id: eventId, type: 'event' }}
        getTitle={renderTitle}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabs
        parentResource={{
          type: 'event',
          id: event.id,
          externalId: event.externalId,
        }}
        tab={activeTab}
        onTabChange={newTab => {
          navigate(
            createLink(
              `/${location.pathname
                .split('/')
                .slice(2, tabType ? -1 : undefined)
                .join('/')}/${newTab}`
            ),
            { replace: true }
          );
          trackUsage('Exploration.Details.TabChange', {
            type: 'event',
            tab: newTab,
          });
        }}
        additionalTabs={[
          <Tabs.Pane title={<TabTitle>Details</TabTitle>} key="details">
            <EventDetails event={event} />
            <Metadata metadata={event.metadata} />
          </Tabs.Pane>,
        ]}
      />
    </>
  );
};
