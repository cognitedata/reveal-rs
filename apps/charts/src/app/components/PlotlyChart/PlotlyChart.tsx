import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { PlotParams } from 'react-plotly.js';

import { WorkflowState } from '@charts-app/models/calculation-results/types';
import {
  ChartEventResults,
  EventsCollection,
} from '@charts-app/models/event-results/types';
import { InteractionData } from '@charts-app/models/interactions/types';
import { ScheduledCalculationsDataMap } from '@charts-app/models/scheduled-calculation-results/types';
import { TimeseriesEntry } from '@charts-app/models/timeseries-results/types';
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';

import {
  ChartThreshold,
  ChartTimeSeries,
  ChartWorkflow,
  ScheduledCalculation,
} from '@cognite/charts-lib';

import { PlotWrapper } from './elements';
import { createNavigationSafePlotComponent } from './navigation-safe-plot-component';
import {
  calculateSeriesData,
  formatPlotlyData,
  generateLayout,
  getXaxisUpdateFromEventData,
  getYaxisUpdatesFromEventData,
  PlotlyEventData,
  SeriesData,
  AxisUpdate,
} from './utils';

const PlotlyComponent = createPlotlyComponent(Plotly);
const SafePlotlyComponent = createNavigationSafePlotComponent(PlotlyComponent);

const DEFAULT_Y_AXIS_WIDTH = 60;
const DEFAULT_Y_AXIS_MARGIN = 40;

const defaultChartStyles = {
  height: 'calc(100% - 30px)',
  width: '100%',
};

export type PlotNavigationUpdate = {
  x: string[];
  y: AxisUpdate[];
  dragmode: 'zoom' | 'pan';
  eventdata: PlotlyEventData;
};

type Props = {
  dateFrom?: string;
  dateTo?: string;
  timeseries?: ChartTimeSeries[];
  timeseriesData?: TimeseriesEntry[];
  calculations?: ChartWorkflow[];
  calculationsData?: WorkflowState[];
  scheduledCalculations?: ScheduledCalculation[];
  scheduledCalculationsData?: ScheduledCalculationsDataMap;
  thresholds?: ChartThreshold[];
  eventData?: ChartEventResults[];
  storedSelectedEvents?: EventsCollection;
  isYAxisShown?: boolean;
  isMinMaxShown?: boolean;
  isGridlinesShown?: boolean;
  isPreview?: boolean;
  stackedMode?: boolean;
  mergeUnits?: boolean;
  yAxisWidth?: number;
  yAxisMargin?: number;
  dragmode?: 'zoom' | 'pan';
  onPlotNavigation?: (update: PlotNavigationUpdate) => void;
  plotlyProps?: ((prev: PlotParams) => PlotParams) | PlotParams;
  interactionData?: InteractionData;
};

const PlotlyChart = ({
  dateFrom = new Date().toISOString(),
  dateTo = new Date(new Date().getTime() + 3600000).toISOString(),
  timeseries = [],
  timeseriesData = [],
  calculations = [],
  calculationsData = [],
  scheduledCalculations = [],
  scheduledCalculationsData = {},
  thresholds = [],
  eventData = [],
  storedSelectedEvents = [],
  isPreview = false,
  isMinMaxShown = false,
  isGridlinesShown = false,
  isYAxisShown = true,
  mergeUnits = false,
  stackedMode = false,
  yAxisWidth = DEFAULT_Y_AXIS_WIDTH,
  yAxisMargin = DEFAULT_Y_AXIS_MARGIN,
  dragmode = 'pan',
  onPlotNavigation = () => {},
  plotlyProps = (prev) => prev,
  interactionData,
}: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [yAxisValues, setYAxisValues] = useState<{
    width: number;
    margin: number;
  }>({ width: 0.05, margin: 0.01 });

  useEffect(() => {
    if (containerRef && containerRef.current) {
      const containerWidth = containerRef?.current?.clientWidth;
      setYAxisValues({
        width: yAxisWidth / containerWidth,
        margin: yAxisMargin / containerWidth,
      });
    }
  }, [containerRef, yAxisWidth, yAxisMargin]);

  const [yAxisLocked, setYAxisLocked] = useState<boolean>(true);

  /**
   * Handle toggling of scroll behavior for y axis based on mouse position
   */
  const handleToggleYAxisLocked = useCallback(
    (isLocked: boolean) => {
      if (isLocked !== yAxisLocked) {
        setYAxisLocked(isLocked);
      }
    },
    [yAxisLocked]
  );

  const handleMouseMoveOnChart = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const classes = Array.from((e.target as HTMLElement)?.classList);
      const isMainArea = classes.includes('nsewdrag');
      handleToggleYAxisLocked(isMainArea);
    },
    [handleToggleYAxisLocked]
  );

  const seriesData: SeriesData[] = useMemo(() => {
    const result = calculateSeriesData({
      timeseries,
      timeseriesData,
      calculations,
      calculationsData,
      scheduledCalculations,
      scheduledCalculationsData,
      thresholds,
      mergeUnits,
    });
    return result;
  }, [
    timeseries,
    calculations,
    timeseriesData,
    calculationsData,
    scheduledCalculations,
    scheduledCalculationsData,
    thresholds,
    mergeUnits,
  ]);

  const data: Plotly.Data[] = useMemo(
    () =>
      formatPlotlyData(
        seriesData,
        !isMinMaxShown,
        interactionData?.highlightedTimeseriesId
      ),
    [seriesData, isMinMaxShown, interactionData?.highlightedTimeseriesId]
  );

  const layout = useMemo(() => {
    return generateLayout({
      isPreview,
      isGridlinesShown,
      yAxisLocked,
      showYAxis: isYAxisShown,
      stackedMode,
      seriesData,
      eventData,
      storedSelectedEvents,
      yAxisValues,
      dateFrom,
      dateTo,
      dragmode,
      highlightedTimeseriesId: interactionData?.highlightedTimeseriesId,
    });
  }, [
    isPreview,
    isGridlinesShown,
    yAxisLocked,
    isYAxisShown,
    stackedMode,
    seriesData,
    eventData,
    storedSelectedEvents,
    yAxisValues,
    dateFrom,
    dateTo,
    dragmode,
    interactionData?.highlightedTimeseriesId,
  ]);

  const config = useMemo(() => {
    return {
      staticPlot: isPreview,
      autosize: true,
      responsive: true,
      scrollZoom: true,
      displaylogo: false,
      displayModeBar: false,
    };
  }, [isPreview]);

  const onRelayout = useCallback(
    (eventdata: PlotlyEventData) => {
      const x = getXaxisUpdateFromEventData(eventdata);
      const y = getYaxisUpdatesFromEventData(seriesData, eventdata);

      onPlotNavigation({
        x,
        y,
        dragmode: eventdata.dragmode || dragmode,
        eventdata,
      });
    },
    [seriesData, dragmode, onPlotNavigation]
  );

  const computedPlotProps: PlotParams = {
    data,
    layout,
    config,
    onRelayout,
    divId: 'plotly-chart',
    style: defaultChartStyles,
    useResizeHandler: true,
  };

  const plotProps =
    typeof plotlyProps === 'function'
      ? plotlyProps(computedPlotProps)
      : { ...computedPlotProps, ...plotlyProps };

  return (
    <PlotWrapper ref={containerRef} onMouseMove={handleMouseMoveOnChart}>
      <SafePlotlyComponent {...plotProps} />
    </PlotWrapper>
  );
};

export default PlotlyChart;
