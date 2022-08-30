import { DepthMeasurementUnit } from 'constants/units';

import { ChartColumn } from '../types';

export const RKB_LEVEL_LABEL = 'RKB level';
export const WATER_DEPTH_LABEL = 'Water depth';

export const EMPTY_SCHEMA_TEXT = 'This wellbore has no schema data';
export const LOADING_TEXT = 'Loading';
export const EMPTY_SUMMARY_TEXT = 'No summary to display';

export const NO_OPTIONS_SELECTED_TEXT = 'No options selected';
export const NO_DATA_AMONG_SELECTED_OPTIONS_TEXT =
  'No data among selected options';

export const NO_COLUMNS_SELECTED_TEXT = 'No columns selected';

export const RKB_COLOR = 'var(--cogs-green-5)';
export const SEA_LEVEL_COLOR = 'var(--cogs-midblue-4)';
export const MUD_LINE_COLOR = '#000000';

export const DEPTH_SCALE_MIN_HEIGHT = 16;
export const DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT = 20;

export const DEPTH_SCALE_LABEL_WIDTH = 79;
export const DEPTH_SCALE_LABEL_HEIGHT = 16;

export const DEFAULT_DEPTH_MEASUREMENT_TYPE = DepthMeasurementUnit.TVD;

export const DEFAULT_COLUMN_ORDER = [
  ChartColumn.FORMATION,
  ChartColumn.CASINGS,
  ChartColumn.NPT,
  ChartColumn.NDS,
  // ChartColumn.SUMMARY,
  ChartColumn.DEPTH,
  ChartColumn.TRAJECTORY,
  ChartColumn.MEASUREMENTS,
];

export const DEFAULT_VISIBLE_COLUMNS = DEFAULT_COLUMN_ORDER.filter(
  (column) => column !== ChartColumn.DEPTH
);
