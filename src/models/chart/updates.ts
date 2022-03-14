import { Timeseries } from '@cognite/sdk';
import { AxisUpdate } from 'components/PlotlyChart';
import { v4 as uuidv4 } from 'uuid';
import {
  Chart,
  ChartSettings,
  ChartTimeSeries,
  ChartWorkflow,
  SourceCollectionData,
  StorableNode,
  UserInfo,
} from 'models/chart/types';
import { getEntryColor } from 'utils/colors';
import dayjs from 'dayjs';
import {
  NodeDataDehydratedVariants,
  NodeTypes,
} from 'components/NodeEditor/V2/types';
import { FunctionNodeDataDehydrated } from 'components/NodeEditor/V2/Nodes/FunctionNode/FunctionNode';
import {
  Edge,
  Elements,
  FlowElement,
  FlowExportObject,
  Node,
} from 'react-flow-renderer';
import { ConstantNodeDataDehydrated } from 'components/NodeEditor/V2/Nodes/ConstantNode';
import { SourceNodeDataDehydrated } from 'components/NodeEditor/V2/Nodes/SourceNode';
import { omit } from 'lodash';
import { Operation } from '@cognite/calculation-backend';
import { initializeParameterValues } from 'components/NodeEditor/V2/utils';
import compareVersions from 'compare-versions';

export function duplicate(chart: Chart, login: UserInfo): Chart {
  const id = uuidv4();
  return {
    ...chart,
    id,
    updatedAt: Date.now(),
    createdAt: Date.now(),
    name: `${chart.name} Copy`,
    public: false,
    user: login.id,
    userInfo: login,
  };
}

function updateCollItem<T extends ChartTimeSeries | ChartWorkflow>(
  chart: Chart,
  collectionType: 'timeSeriesCollection' | 'workflowCollection',
  collId: string,
  diff: Partial<T>
): Chart {
  return {
    ...chart,
    // @ts-ignore
    [collectionType]: chart[collectionType]?.map((t) =>
      t.id === collId
        ? {
            ...t,
            ...diff,
          }
        : t
    ),
  };
}

function removeItem(
  chart: Chart,
  collectionType: 'timeSeriesCollection' | 'workflowCollection',
  collId: string
): Chart {
  return {
    ...chart,
    // @ts-ignore
    [collectionType]: chart[collectionType]?.filter((t) => t.id !== collId),
    sourceCollection: chart.sourceCollection?.filter((t) => t.id !== collId),
  };
}

function addItem<T extends ChartWorkflow | ChartTimeSeries>(
  chart: Chart,
  collectionType: 'timeSeriesCollection' | 'workflowCollection',
  item: T
): Chart {
  const type =
    collectionType === 'timeSeriesCollection' ? 'timeseries' : 'workflow';
  return {
    ...chart,
    [collectionType]: [...(chart[collectionType] || []), { ...item, type }],
    sourceCollection: [
      { id: item.id, type },
      ...(chart.sourceCollection || []),
    ],
  };
}

export function updateTimeseries(
  chart: Chart,
  tsId: string,
  update: Partial<ChartTimeSeries>
): Chart {
  return updateCollItem<ChartTimeSeries>(
    chart,
    'timeSeriesCollection',
    tsId,
    update
  );
}

export function removeTimeseries(chart: Chart, tsId: string): Chart {
  return removeItem(chart, 'timeSeriesCollection', tsId);
}

export function addTimeseries(chart: Chart, ts: ChartTimeSeries): Chart {
  return addItem(chart, 'timeSeriesCollection', ts);
}

export function updateWorkflow(
  chart: Chart,
  tsId: string,
  update: Partial<ChartWorkflow>
): Chart {
  return updateCollItem<ChartWorkflow>(
    chart,
    'workflowCollection',
    tsId,
    update
  );
}

export function removeWorkflow(chart: Chart, wfId: string): Chart {
  return removeItem(chart, 'workflowCollection', wfId);
}

export function duplicateWorkflow(chart: Chart, wfId: string): Chart {
  const wf = chart.workflowCollection?.find((w) => w.id === wfId);
  if (wf) {
    const newWf = {
      ...wf,
      id: uuidv4(),
      name: `${wf.name} Copy`,
      color: getEntryColor(chart.id, wf.id),
    };
    return addWorkflow(chart, newWf);
  }
  return chart;
}

export function addWorkflow(chart: Chart, wf: ChartWorkflow): Chart {
  return addItem(chart, 'workflowCollection', wf);
}

export function convertTSToChartTS(
  ts: Timeseries,
  chartId: string,
  range: number[] = []
): ChartTimeSeries {
  return {
    id: uuidv4(),
    name: ts.name || ts.externalId || ts.id.toString(),
    tsId: ts.id,
    tsExternalId: ts.externalId,
    unit: ts.unit || '',
    type: 'timeseries',
    originalUnit: ts.unit || '',
    preferredUnit: ts.unit || '',
    color: getEntryColor(chartId, ts.id.toString()),
    lineWeight: 1,
    lineStyle: 'solid',
    interpolation: ts.isStep ? 'hv' : 'linear',
    displayMode: 'lines',
    enabled: true,
    description: ts.description || '-',
    range,
    createdAt: Date.now(),
  };
}

export function initializeSourceCollection(chart: Chart): Chart {
  return {
    ...chart,
    sourceCollection: [
      ...(chart?.timeSeriesCollection || []).map((ts) => ({
        type: ts.type ?? 'timeseries',
        id: ts.id,
      })),
      ...(chart?.workflowCollection || []).map((flow) => ({
        id: flow.id,
        type: flow.type ?? 'workflow',
      })),
    ] as SourceCollectionData[],
  };
}

export function updateSourceAxisForChart(
  chart: Chart,
  { x, y }: { x: string[]; y: AxisUpdate[] }
): Chart {
  const updatedChart = {
    ...chart,
    ...(x.length === 2
      ? {
          dateFrom: `${x[0]}`,
          dateTo: `${x[1]}`,
        }
      : {}),
    ...(y.length > 0
      ? {
          timeSeriesCollection: chart.timeSeriesCollection?.map((ts) => {
            const correspondingUpdate = y.find((update) => update.id === ts.id);
            return correspondingUpdate
              ? { ...ts, range: correspondingUpdate.range }
              : ts;
          }),
          workflowCollection: chart.workflowCollection?.map((wf) => {
            const correspondingUpdate = y.find((update) => update.id === wf.id);
            return correspondingUpdate
              ? { ...wf, range: correspondingUpdate.range }
              : wf;
          }),
        }
      : {}),
  };

  return updatedChart;
}

export const updateChartSettings = (
  chart: Chart,
  diff: Partial<ChartSettings>
): Chart => {
  return {
    ...chart,
    settings: { ...chart.settings, ...diff },
  };
};

/**
 * function updateVisibilityForAllSources
 * @param chart Charts object
 * @param enabled Boolean value to maintain charts rows visibility
 * @returns Updated charts object with all rows of both collection [Timeseries/Workflow] enable status to be uniform.
 */
export const updateVisibilityForAllSources = (
  chart: Chart,
  enabled: boolean
) => {
  return {
    ...chart,
    timeSeriesCollection: chart.timeSeriesCollection?.map((ts) => ({
      ...ts,
      enabled,
    })),
    workflowCollection: chart.workflowCollection?.map((ts) => ({
      ...ts,
      enabled,
    })),
  };
};

export const updateChartDateRange = (
  chart: Chart,
  dateFrom: Date | string | undefined,
  dateTo: Date | string | undefined
) => {
  const requestedDateFrom = dayjs(dateFrom || chart.dateFrom!);
  const requestedDateTo = dayjs(dateTo || chart.dateTo!);
  const isFromAfterTo = requestedDateFrom.isAfter(requestedDateTo);
  const newDateFrom = isFromAfterTo ? requestedDateTo : requestedDateFrom;
  const newDateTo = isFromAfterTo ? requestedDateFrom : requestedDateTo;

  return {
    ...chart,
    dateFrom: newDateFrom.toJSON(),
    dateTo: newDateTo.toJSON(),
  };
};

export const updateSourceCollectionOrder = (
  chart: Chart,
  fromIndex: number,
  toIndex: number
) => {
  const sourceCollection = chart.sourceCollection || [];
  const sourceCollectionCopy = sourceCollection.slice();
  const [removed] = sourceCollectionCopy.splice(fromIndex, 1);
  sourceCollectionCopy.splice(toIndex, 0, removed);

  return {
    ...chart,
    sourceCollection: sourceCollectionCopy,
  };
};

/**
 * Migration to introduce versions for operations in calculations
 */
export const updateWorkflowsToSupportVersions = (chart: Chart): Chart => {
  return {
    ...chart,
    workflowCollection: (chart.workflowCollection || []).map((workflow) => {
      if (workflow.version === 'v2') {
        return {
          ...workflow,
          flow: {
            ...workflow.flow!,
            elements: (workflow.flow?.elements || []).map((el) => {
              switch (el.type) {
                case NodeTypes.FUNCTION: {
                  const elData = el.data as FunctionNodeDataDehydrated;

                  return {
                    ...(el as FlowElement<FunctionNodeDataDehydrated>),
                    data: {
                      ...elData,
                      selectedOperation: elData.selectedOperation
                        ? {
                            ...elData.selectedOperation,
                            version:
                              elData.selectedOperation.version === '0.0'
                                ? '1.0'
                                : elData.selectedOperation.version || '1.0',
                          }
                        : {
                            op: (elData as StorableNode).toolFunction.op,
                            version: '1.0',
                          },
                      parameterValues: elData.parameterValues
                        ? elData.parameterValues
                        : (elData as StorableNode).functionData,
                    } as FunctionNodeDataDehydrated,
                  };
                }
                default:
                  return el;
              }
            }),
          },
        };
      }
      return workflow;
    }),
  };
};

/**
 * Migration to introduce versions for operations in calculations
 */
export const updateWorkflowsFromV1toV2 = (
  chart: Chart,
  operations: Operation[]
): Chart => {
  return {
    ...chart,
    workflowCollection: (chart.workflowCollection || []).map((workflow) => {
      if (workflow.version !== 'v2') {
        const existingNodes = workflow.nodes || [];
        const existingConnections = Object.values(workflow.connections || {});

        const convertedNodes: (
          | FlowElement<NodeDataDehydratedVariants>
          | undefined
        )[] = existingNodes
          .map((node) => {
            switch (node.functionEffectReference) {
              case 'CONSTANT': {
                return {
                  id: node.id,
                  type: NodeTypes.CONSTANT,
                  position: { x: node.x, y: node.y },
                  data: {
                    value: node.functionData.value,
                  } as ConstantNodeDataDehydrated,
                } as Node<ConstantNodeDataDehydrated>;
              }
              case 'TOOLBOX_FUNCTION': {
                const opName = node.functionData?.toolFunction?.op;
                const operation = operations.find(({ op }) => op === opName);
                const oldestVersion = (operation?.versions || [])
                  .slice()
                  .sort((a, b) => compareVersions(b.version, a.version))[0];

                if (!oldestVersion) {
                  return undefined;
                }

                const defaultParamValues = oldestVersion
                  ? initializeParameterValues(oldestVersion)
                  : {};

                return {
                  id: node.id,
                  type: NodeTypes.FUNCTION,
                  position: { x: node.x, y: node.y },
                  data: {
                    parameterValues: {
                      ...defaultParamValues,
                      ...(omit(node.functionData, 'toolFunction') || {}),
                    },
                    selectedOperation: {
                      op: node.functionData.toolFunction.op,
                      version: node.functionData.toolFunction.version,
                    },
                  } as FunctionNodeDataDehydrated,
                } as Node<FunctionNodeDataDehydrated>;
              }
              case 'SOURCE_REFERENCE': {
                let sourceId = node.functionData?.sourceId;

                if (node.functionData.type === 'timeseries') {
                  sourceId =
                    (chart.timeSeriesCollection || []).find(
                      (ts) => ts.tsExternalId === node.functionData.sourceId
                    )?.id || '';
                }

                return {
                  id: node.id,
                  type: NodeTypes.SOURCE,
                  position: { x: node.x, y: node.y },
                  data: {
                    selectedSourceId: sourceId,
                    type: node.functionData.type,
                  } as SourceNodeDataDehydrated,
                } as Node<SourceNodeDataDehydrated>;
              }
              case 'TIME_SERIES_REFERENCE': {
                const sourceId =
                  (chart.timeSeriesCollection || []).find(
                    (ts) =>
                      ts.tsExternalId ===
                      node.functionData?.timeseriesExternalId
                  )?.id || '';

                return {
                  id: node.id,
                  type: NodeTypes.SOURCE,
                  position: { x: node.x, y: node.y },
                  data: {
                    selectedSourceId: sourceId,
                    type: 'timeseries',
                  } as SourceNodeDataDehydrated,
                } as Node<SourceNodeDataDehydrated>;
              }
              case 'OUTPUT': {
                return {
                  id: node.id,
                  type: NodeTypes.OUTPUT,
                  position: { x: node.x, y: node.y },
                };
              }
              default:
                throw new Error(
                  `Unknown node type ${node.functionEffectReference}`
                );
            }
          })
          .filter((x) => x);

        const convertedEdges: Elements<Edge> = existingConnections.map(
          (connection) => {
            return {
              id: connection.id,
              source: connection.outputPin.nodeId,
              sourceHandle: connection.outputPin.pinId,
              target: connection.inputPin.nodeId,
              targetHandle: connection.inputPin.pinId,
            };
          }
        );

        return {
          ...workflow,
          version: 'v2',
          flow: {
            position: [0, 0],
            zoom: 1,
            elements: [...convertedEdges, ...convertedNodes],
          } as FlowExportObject<NodeDataDehydratedVariants>,
          settings: {
            autoAlign: true,
          },
        };
      }
      return workflow;
    }),
  };
};
