import React from 'react';
import { Chart } from 'reducers/charts/types';
import { Modes } from 'pages/types';
import { Draggable } from 'react-beautiful-dnd';
import TimeSeriesRow from './TimeSeriesRow';

type Props = {
  chart: Chart;
  updateChart: (c: Chart) => void;
  mode: Modes;
  selectedSourceId?: string;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
  dateFrom: string;
  dateTo: string;
  draggable?: boolean;
};
export default function TimeSeriesRows({
  chart,
  updateChart,
  mode,
  onRowClick = () => {},
  onInfoClick = () => {},
  selectedSourceId,
  dateFrom,
  dateTo,
  draggable = false,
}: Props) {
  const isWorkspaceMode = mode === 'workspace';
  const isEditorMode = mode === 'editor';
  const isFileViewerMode = mode === 'file';

  return (
    <>
      {chart?.timeSeriesCollection?.map((t, index) => (
        <Draggable key={t.id} draggableId={t.id} index={index}>
          {(draggableProvided, snapshot) => (
            <TimeSeriesRow
              draggable={draggable}
              provided={draggableProvided}
              key={t.id}
              mutate={updateChart}
              chart={chart}
              timeseries={t}
              isWorkspaceMode={isWorkspaceMode}
              onRowClick={onRowClick}
              onInfoClick={onInfoClick}
              isSelected={selectedSourceId === t.id}
              disabled={isEditorMode}
              isFileViewerMode={isFileViewerMode}
              dateFrom={dateFrom}
              dateTo={dateTo}
            />
          )}
        </Draggable>
      ))}
    </>
  );
}
