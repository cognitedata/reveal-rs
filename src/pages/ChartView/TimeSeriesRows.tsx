import React from 'react';
import { Chart } from 'reducers/charts/types';
import { Modes } from 'pages/types';
import TimeSeriesRow from './TimeSeriesRow';
import { TypeLabel } from './elements';

type Props = {
  chart: Chart;
  updateChart: (c: Chart) => void;
  mode: Modes;
  selectedSourceId?: string;
  onRowClick?: (id?: string) => void;
  onInfoClick?: (id?: string) => void;
};
export default function TimeSeriesRows({
  chart,
  updateChart,
  mode,
  onRowClick = () => {},
  onInfoClick = () => {},
  selectedSourceId,
}: Props) {
  const isWorkspaceMode = mode === 'workspace';
  const isEditorMode = mode === 'editor';
  const isFileViewerMode = mode === 'file';

  return (
    <>
      {(chart?.timeSeriesCollection?.length || 0) > 0 && (
        <tr>
          <TypeLabel colSpan={10}>Time series</TypeLabel>
        </tr>
      )}
      {chart?.timeSeriesCollection?.map((t) => (
        <TimeSeriesRow
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
        />
      ))}
    </>
  );
}
