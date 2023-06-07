import { Button, Icon, toast, Tooltip } from '@cognite/cogs.js';
import {
  TopContainer,
  TopContainerAside,
  TopContainerTitle,
} from 'components/Common/SidebarElements';
import { useEffect } from 'react';
import { makeDefaultTranslations } from 'utils/translations';
import { useMonitoringFoldersWithJobs } from 'components/MonitoringSidebar/hooks';
import { saveToLocalStorage } from '@cognite/storage';
import { jobsToAlerts } from 'pages/ChartViewPage/NotificationIndicator';
import { MONITORING_SIDEBAR_ALERT_COUNT_KEY } from 'utils/constants';
import { useQueryClient } from '@tanstack/react-query';
import {
  JobAndAlertsFilter,
  FilterOption,
  ALERTING_FILTER_OPTIONS,
} from 'components/MonitoringSidebar/JobAndAlertsFilter';
import { useChartAtom } from 'models/chart/atom';
import { trackUsage } from 'services/metrics';
import { useSearchParam } from 'hooks/navigation';
import { JobsWithAlertsContainer, SidebarWithScroll } from './elements';
import { getTsIds } from '../../domain/chart/internal/transformers/getTsIds';
import { DisplayAlerts } from './DisplayAlerts';
import { ALERTING_FILTER } from '../../utils/constants';

const defaultTranslations = makeDefaultTranslations(
  'Alerts',
  'Hide',
  'Unable to load alerts'
);

type Props = {
  onViewMonitoringJobs: () => void;
  translations?: typeof defaultTranslations;
  onClose: () => void;
};

export const AlertingSidebar = ({
  onViewMonitoringJobs,
  translations,
  onClose,
}: Props) => {
  const t = {
    ...defaultTranslations,
    ...translations,
  };
  const [chart] = useChartAtom();
  const [filterOption = ALERTING_FILTER_OPTIONS[0].value, setFilterOption] =
    useSearchParam(ALERTING_FILTER);

  const handleFilterOptionChange = (updatedFilterOption: FilterOption) => {
    setFilterOption(updatedFilterOption.value);
    trackUsage('Sidebar.Alerting.FilterOptionChanged', {
      filter: updatedFilterOption.value,
    });
  };

  const {
    isError,
    isFetching,
    data: taskData,
  } = useMonitoringFoldersWithJobs('alerting-sidebar', {
    subscribed: filterOption === 'subscribed',
    timeseriesIds: filterOption === 'current' ? getTsIds(chart) : undefined,
    currentChart: filterOption === 'current',
  });

  const cache = useQueryClient();

  const allJobs = taskData
    ?.map((item) => item.tasks)
    .reduce((items, acc) => [...acc, ...items], [])
    .filter((job) => job.alertCount > 0);

  useEffect(() => {
    cache.invalidateQueries(['monitoring-folders-jobs-alerting-sidebar']);
  }, []);

  useEffect(() => {
    saveToLocalStorage(
      MONITORING_SIDEBAR_ALERT_COUNT_KEY,
      jobsToAlerts(taskData)
    );
  }, [taskData]);

  useEffect(() => {
    if (isError) {
      toast.error(t['Unable to load alerts']);
    }
  }, [isError]);

  return (
    <SidebarWithScroll visible>
      <TopContainer>
        <TopContainerTitle>
          <Icon size={21} type="Bell" />
          {t.Alerts}
        </TopContainerTitle>
        <TopContainerAside>
          <Tooltip content={t.Hide}>
            <Button
              icon="Close"
              type="ghost"
              onClick={onClose}
              aria-label="Close"
            />
          </Tooltip>
        </TopContainerAside>
      </TopContainer>
      <JobsWithAlertsContainer>
        <JobAndAlertsFilter
          mode="alerting"
          onChange={handleFilterOptionChange}
          value={
            ALERTING_FILTER_OPTIONS.find(
              (option) => option.value === filterOption
            )!
          }
        />
        <DisplayAlerts
          jobs={allJobs}
          isFetching={isFetching}
          isError={isError}
          onViewMonitoringJobs={onViewMonitoringJobs}
        />
      </JobsWithAlertsContainer>
    </SidebarWithScroll>
  );
};
