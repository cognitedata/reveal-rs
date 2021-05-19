import React from 'react';
import { AutoComplete } from '@cognite/cogs.js';
import { Chart, StorableNode } from 'reducers/charts/types';
import { ConfigPanelComponentProps } from '../types';

type FunctionData = {
  type: string;
  sourceId: string;
  context: {
    chart: Chart;
  };
};

export const effect = async (funcData: FunctionData) => {
  if (!funcData.sourceId) {
    throw new Error('No id given in config');
  }

  return {
    result: {
      type: funcData.type,
      sourceId: funcData.type,
    },
  };
};

export const effectId = 'SOURCE_REFERENCE';

export const configPanel = ({
  node,
  onUpdateNode,
  context,
}: ConfigPanelComponentProps) => {
  const { functionData } = node;

  const workspaceTimeSeries =
    (context.chart as Chart).timeSeriesCollection || [];

  const workspaceWorkflows = (context.chart as Chart).workflowCollection || [];

  const sourceList = [
    ...workspaceTimeSeries.map((ts) => ({
      type: 'timeseries',
      id: ts.tsExternalId,
      name: ts.name,
    })),
    ...workspaceWorkflows.map((wf) => ({
      type: 'workflow',
      id: wf.id,
      name: wf.name,
    })),
  ];

  const selectedWorkspaceTimeSeriesLabel =
    sourceList.find(({ id }) => id === functionData.sourceId)?.name || '';

  const loadOptions = (
    _: string,
    callback: (options: { value?: string; label?: string }[]) => void
  ) => {
    callback(
      sourceList.map((source) => ({
        value: source.id,
        label: source.name,
      }))
    );
  };

  return (
    <div>
      <h4>Source Reference</h4>
      <AutoComplete
        mode="async"
        theme="dark"
        loadOptions={loadOptions}
        onChange={(nextValue: { value: string; label: string }) => {
          onUpdateNode({
            title: nextValue.label,
            functionData: {
              type: sourceList.find(({ id }) => id === nextValue.value)?.type,
              sourceId: nextValue.value || '',
            },
          });
        }}
        value={{
          value: functionData.sourceId,
          label: selectedWorkspaceTimeSeriesLabel,
        }}
      />
    </div>
  );
};

export const node = {
  title: 'Source Reference',
  subtitle: 'Source',
  color: '#FC2574',
  icon: 'Function',
  inputPins: [],
  outputPins: [
    {
      id: 'result',
      title: 'Time Series',
      type: 'TIMESERIES',
    },
  ],
  functionEffectReference: effectId,
  functionData: {
    type: '',
    sourceId: '',
  },
} as StorableNode;
