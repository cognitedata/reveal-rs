import React, { MutableRefObject } from 'react';

import { PerfMetrics } from '@cognite/metrics';

import {
  PerformanceMetricsObserver,
  PerformanceObserved,
  documentResultTableLoadQuery,
} from 'components/Performance';

import { DocumentResultTable } from './DocumentResultTable';

const performanceOnRender = (ref: MutableRefObject<HTMLElement | null>) => {
  PerfMetrics.trackPerfEvent(
    'SEARCH_CHECKBOX_CLICKED',
    'click',
    ref,
    'input[type=checkbox]',
    1
  );
  return () => {
    PerfMetrics.untrackPerfEvent('SEARCH_CHECKBOX_CLICKED');
  };
};

const handlePerformanceObserved = ({ mutations }: PerformanceObserved) => {
  if (mutations) {
    PerfMetrics.trackPerfEnd('SEARCH_ACTION_DATA_UPDATED');
    PerfMetrics.findInMutation({
      ...documentResultTableLoadQuery,
      mutations,
      callback: (output: any) => {
        if (output.addedNodes) {
          PerfMetrics.trackPerfEnd('SEARCH_TABLE_EXPAND_ROW');
        }
        if (output.removedNodes) {
          PerfMetrics.trackPerfEnd('SEARCH_TABLE_EXPAND_ROW');
        }
      },
    });
  }
};

const onHandleRowClick = () => {
  PerfMetrics.trackPerfStart('SEARCH_TABLE_EXPAND_ROW');
};

export const DocumentResultTableWithPerformanceTracking: React.FC = () => {
  return (
    <PerformanceMetricsObserver
      onChange={handlePerformanceObserved}
      onRender={performanceOnRender}
    >
      <DocumentResultTable onHandleRowClick={onHandleRowClick} />
    </PerformanceMetricsObserver>
  );
};
