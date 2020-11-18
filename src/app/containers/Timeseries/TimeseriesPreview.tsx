import React, { useEffect } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { trackUsage } from 'app/utils/Metrics';
import ResourceTitleRow from 'app/components/ResourceTitleRow';
import { Row, Col } from 'antd';
import { useCdfItem } from '@cognite/sdk-react-query-hooks';
import { Timeseries } from '@cognite/sdk';
import { ErrorFeedback, Loader, Tabs } from 'lib/components';
import { TimeseriesChart } from 'lib/containers/Timeseries';
import { ResourceDetailsTabs, TabTitle } from 'app/containers/ResourceDetails';
import { createLink } from '@cognite/cdf-utilities';
import Details from 'lib/components/Timeseries/Details';
import { TitleRowActionsProps } from 'app/components/TitleRowActions';

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
  actions?: TitleRowActionsProps['actions'];
}) => {
  const history = useHistory();

  useEffect(() => {
    trackUsage('Exploration.Timeseries', { timeseriesId });
  }, [timeseriesId]);

  const { data: timeseries, isFetched, error } = useCdfItem<Timeseries>(
    'timeseries',
    { id: timeseriesId }
  );

  const match = useRouteMatch();
  const activeTab = history.location.pathname
    .replace(match.url, '')
    .slice(1) as TimeseriesPreviewTabType;

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
    <div style={{ overflow: 'hidden' }}>
      <ResourceTitleRow
        item={{ id: timeseriesId, type: 'timeSeries' }}
        icon="Timeseries"
        actions={actions}
      />
      {timeseries && (
        <>
          <Row>
            <Col span={24}>
              <TimeseriesChart
                timeseriesId={timeseries.id}
                height={500}
                defaultOption="2Y"
              />
            </Col>
          </Row>
          <Row style={{ height: 'calc(100% - 635px)', overflow: 'auto' }}>
            <Col span={24}>
              <ResourceDetailsTabs
                parentResource={{
                  type: 'timeSeries',
                  id: timeseries.id,
                  externalId: timeseries.externalId,
                }}
                tab={activeTab}
                onTabChange={newTab =>
                  history.push(
                    createLink(
                      `${match.url.substr(match.url.indexOf('/', 1))}/${newTab}`
                    )
                  )
                }
                additionalTabs={[
                  <Tabs.Pane title={<TabTitle>Details</TabTitle>} key="details">
                    <Details id={timeseriesId} />
                  </Tabs.Pane>,
                ]}
              />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};
