import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Loader, Metadata } from '@data-exploration/components';
import { EventInfo } from '@data-exploration/containers';

import { Tabs } from '@cognite/cogs.js';
import { ErrorFeedback } from '@cognite/data-exploration';
import { CogniteError, CogniteEvent } from '@cognite/sdk';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import { Breadcrumbs } from '@data-exploration-app/components/Breadcrumbs/Breadcrumbs';
import ResourceTitleRow from '@data-exploration-app/components/ResourceTitleRow';
import { DetailsTabWrapper } from '@data-exploration-app/containers/Common/element';
import { ResourceDetailsTabs } from '@data-exploration-app/containers/ResourceDetails';
import {
  useCurrentResourceId,
  useOnPreviewTabChange,
} from '@data-exploration-app/hooks/hooks';
import { renderTitle } from '@data-exploration-app/utils/EventsUtils';
import { trackUsage } from '@data-exploration-app/utils/Metrics';
import { useTranslation } from '@data-exploration-lib/core';

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
  const { t } = useTranslation();

  const { tabType } = useParams<{
    tabType: EventPreviewTabType;
  }>();
  const activeTab = tabType || 'details';

  const onTabChange = useOnPreviewTabChange(tabType, 'event');
  const [, openPreview] = useCurrentResourceId();

  const handlePreviewClose = () => {
    openPreview(undefined);
  };

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
    return (
      <>
        {t('INVALID_EVENT_ID', 'Invalid event id')}: {eventId}
      </>
    );
  }

  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    const { errorMessage: message, status, requestId } = error as CogniteError;
    return (
      <ErrorFeedback
        error={{ message, status, requestId }}
        onPreviewClose={handlePreviewClose}
      />
    );
  }

  if (!event) {
    return (
      <>
        {t('RESOURCE_NOT_FOUND', `Event ${eventId} not found!`, {
          resourceType: t('EVENT', 'Event'),
          id: eventId,
        })}
      </>
    );
  }

  return (
    <>
      <Breadcrumbs currentResource={{ title: renderTitle(event) }} />
      <ResourceTitleRow
        item={{ id: eventId, type: 'event' }}
        title={renderTitle(event)}
        afterDefaultActions={actions}
      />
      <ResourceDetailsTabs
        parentResource={{
          type: 'event',
          id: event.id,
          externalId: event.externalId,
          title: renderTitle(event),
        }}
        onTabChange={onTabChange}
        tab={activeTab}
        additionalTabs={[
          <Tabs.Tab
            key="details"
            label={t('DETAILS', 'Details')}
            tabKey="details"
          >
            <DetailsTabWrapper>
              <EventInfo event={event} />
              <Metadata metadata={event.metadata} />
            </DetailsTabWrapper>
          </Tabs.Tab>,
        ]}
      />
    </>
  );
};
