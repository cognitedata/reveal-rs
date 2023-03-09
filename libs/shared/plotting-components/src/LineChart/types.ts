import { CSSProperties } from 'react';

import { Datum } from 'plotly.js';

export interface LineChartProps {
  data: Data | Data[];
  xAxis?: Axis;
  yAxis?: Axis;
  title?: string;
  subtitle?: string;
  backgroundColor?: string;
  variant?: Variant;
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  style?: CSSProperties;
  disableTooltip?: boolean;
  renderTooltipContent?: (props: TooltipRendererProps) => JSX.Element;
  renderFilters?: () => [JSX.Element, ...JSX.Element[]];
  renderActions?: () => [JSX.Element, ...JSX.Element[]];
  formatHoverLineInfo?: (props: HoverLineData) => string;
}

export interface Data {
  x: ValueType[];
  y: ValueType[];
  name?: string;
  color?: string;
  customData?: CustomDataType;
}

export interface Layout {
  legendPlacement: HorizontalPlacement;
  showTitle: boolean;
  showSubtitle: boolean;
  showLegend: boolean;
  showAxisNames: boolean;
  showTicks: boolean;
  showTickLabels: boolean;
  showFilters: boolean;
  showActions: boolean;
  showMarkers: boolean;
  showHoverMarker: boolean;
  showHoverLine: boolean;
  showHoverLineInfo: boolean;
}

export interface Config {
  responsive: boolean;
  scrollZoom: AxisDirectionConfig;
  selectionZoom: AxisDirectionConfig;
  buttonZoom: AxisDirectionConfig;
  pan: AxisDirectionConfig;
}

export interface Axis {
  name?: string;
  tickCount?: number;
  tickDistance?: number;
}

export interface TooltipRendererProps {
  x: ValueType;
  y: ValueType;
  name: string;
  color: string;
  customData?: CustomDataType;
}

export interface HoverLineData {
  x: ValueType;
  y: ValueType;
  name: string;
  customData?: CustomDataType;
}

export type ValueType = Datum;

export type CustomDataType = Record<string, unknown>;

export type Variant = 'small' | 'medium' | 'large';

export type HorizontalPlacement = 'left' | 'center' | 'right';

export type AxisRange = [number, number];

export type AxisDirection = 'x' | 'y' | 'x+y';

export type AxisIdentifier = 'x' | 'y';

export interface KeyTriggeredAxisDirection {
  trigger: 'default' | 'Shift';
  direction: AxisDirection;
}

export type AxisDirectionConfig =
  | false
  | AxisDirection
  | [KeyTriggeredAxisDirection, ...KeyTriggeredAxisDirection[]];

export interface PlotRange {
  x?: AxisRange;
  y?: AxisRange;
}

export interface Coordinate {
  x?: number;
  y?: number;
}
