import React, { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import {
  ErrorFeedback,
  Loader,
  Tabs,
  TimeseriesChart,
  Metadata,
  TimeseriesDetails,
} from '@cognite/data-exploration';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';
import { createLink } from '@cognite/cdf-utilities';

import { useDateRange } from 'app/context/DateRangeContext';

export type TimeseriesPreviewTabType =
  | 'details'
  | 'assets'
  | 'timeseries'
  | 'files'
  | 'sequences'
  | 'events';

export const TimeseriesPreview = ({
  timeseriesId,
  actions,
}: {
  timeseriesId: number;
  actions?: React.ReactNode;
}) => {
  const { tabType } = useParams<{
    tabType: TimeseriesPreviewTabType;
  }>();
  const activeTab = tabType || 'details';

  const location = useLocation();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useDateRange();

  useEffect(() => {
    trackUsage('Exploration.Preview.Timeseries', { timeseriesId });
  }, [timeseriesId]);

  const {
    data: timeseries,
    isFetched,
    error,
  } = useCdfItem<Timeseries>('timeseries', { id: timeseriesId });

  if (!timeseriesId || !Number.isFinite(timeseriesId)) {
    return <>Invalid time series id {timeseriesId}</>;
  }
  if (!isFetched) {
    return <Loader />;
  }

  if (error) {
    return <ErrorFeedback error={error} />;
  }

  if (!timeseries) {
    return <>Timeseries {timeseriesId} not found!</>;
  }

  return (
    <>
      <ResourceTitleRow
        item={{ id: timeseriesId, type: 'timeSeries' }}
        afterDefaultActions={actions}
      />
      {timeseries && (
        <>
          <div
            style={{
              height: '40%',
              width: 'calc(100% - 16px)',
              maxHeight: 400,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <TimeseriesChart
              timeseriesId={timeseries.id}
              showCustomRangePicker
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
          </div>
          <ResourceDetailsTabs
            parentResource={{
              type: 'timeSeries',
              id: timeseries.id,
              externalId: timeseries.externalId,
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
                type: 'timeseries',
                tab: newTab,
              });
            }}
            additionalTabs={[
              <Tabs.Pane title={<TabTitle>Details</TabTitle>} key="details">
                <TimeseriesDetails timeseries={timeseries} />
                <Metadata metadata={timeseries.metadata} />
              </Tabs.Pane>,
            ]}
          />
        </>
      )}
    </>
  );
};
