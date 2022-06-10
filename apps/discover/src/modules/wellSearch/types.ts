import { Well } from 'domain/wells/well/internal/types';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

import { Dictionary } from '@reduxjs/toolkit';
import { PlotData } from 'plotly.js';

import { ProjectConfigWellsTrajectoryColumns } from '@cognite/discover-api-types';
import { Sequence as DefaultSequence, Asset, CogniteEvent } from '@cognite/sdk';
// TODO(PP-2998): Remove well sdk v2 usage in NPT
import { NPT, WellFilter } from '@cognite/sdk-wells-v2';
import {
  AssetSource,
  WellFilter as WellFilterV3,
  DepthMeasurement,
  DepthMeasurementData,
  CasingAssembly,
  Distance,
  CasingSchematic,
} from '@cognite/sdk-wells-v3';

import { DataError } from 'modules/inspectTabs/types';
import { CasingType } from 'pages/authorized/search/well/inspect/modules/casing/CasingView/interfaces';

import { TableResults } from '../../components/Tablev3/resultTypes';
import { UserPreferredUnit } from '../../constants/units';
import { DocumentType } from '../documentSearch/types';

import { FilterIDs } from './constants';

export const TOGGLE_SELECTED_WELLS = 'WELL_TOGGLE_SELECTED_WELLS';
export const TOGGLE_SELECTED_WELLBORE_OF_WELL =
  'WELL_TOGGLE_SELECTED_WELLBORE_OF_WELL';
export const TOGGLE_EXPANDED_WELL_ID = 'WELL_TOGGLE_EXPANDED_WELL_ID';

export const SET_WELLBORE_ASSETS = 'WELL_SET_WELLBORE_ASSETS';
export const SET_WELLBORE_DIGITAL_ROCK_SAMPLES =
  'WELL_SET_WELLBORE_DIGITAL_ROCK_SAMPLES';
export const SET_GRAIN_ANALYSIS_DATA = 'WELL_SET_GRAIN_ANALYSIS_DATA';

export const WELL_ADD_SELECTED_COLUMN = 'WELL_ADD_SELECTED_COLUMN';
export const WELL_REMOVE_SELECTED_COLUMN = 'WELL_REMOVE_SELECTED_COLUMN';
export const WELL_SET_SELECTED_COLUMN = 'WELL_SET_SELECTED_COLUMN';

// well state:

export type EventsType = 'nds' | 'npt';
export type LogTypes = 'logs' | 'logsFrmTops';
export type AssetTypes = 'digitalRocks';
export type GrainAnalysisTypes = 'gpart';
export type DictionaryType<T> = Dictionary<T>;

export interface WellState {
  selectedWellIds: TableResults;
  selectedWellboreIds: TableResults;
  expandedWellIds: TableResults;
  wellboreData: WellboreData;
  selectedColumns: string[];
}

// other types:

export interface Sequence extends Omit<DefaultSequence, 'assetId'> {
  wellboreId?: WellboreId;
  assetId?: AssetSource['assetExternalId'];
}

export interface TrajectoryColumnR {
  name: string;
  externalId?: string;
  valueType: string;
}
export interface TrajectoryRow {
  rowNumber: number;
  values: number[];
}
export interface TrajectoryData {
  sequence: Sequence;
  rowData?: TrajectoryRows;
}

export interface TrajectoryRows {
  id: number;
  wellboreId: WellboreId;
  externalId: string;
  columns: ProjectConfigWellsTrajectoryColumns[];
  rows: TrajectoryRow[];
}

export interface WellboreDigitalRockSamples {
  wellboreId: string;
  digitalRockId: number;
  digitalRockSamples: Asset[];
}

interface ToggleExpandedWellId {
  type: typeof TOGGLE_EXPANDED_WELL_ID;
  id: string;
  reset?: boolean;
}

interface ToggleSelectedWells {
  clear?: boolean;
  type: typeof TOGGLE_SELECTED_WELLS;
  wells: Well[];
  isSelected: boolean;
}

interface ToggleSelectedWellboreOfWell {
  type: typeof TOGGLE_SELECTED_WELLBORE_OF_WELL;
  well: Well;
  wellboreId: WellboreId;
  isSelected: boolean;
}

interface SetGrainAnalysisData {
  type: typeof SET_GRAIN_ANALYSIS_DATA;
  digitalRockSample: Asset;
  grainAnalysisType: GrainAnalysisTypes;
  data: SequenceData[];
}

interface SetWellboreAssets {
  type: typeof SET_WELLBORE_ASSETS;
  data: { [key: string]: Asset[] };
  assetType: AssetTypes;
}

interface SetWellboreDigitalRockSamples {
  type: typeof SET_WELLBORE_DIGITAL_ROCK_SAMPLES;
  data: WellboreDigitalRockSamples[];
}

interface AddSelectedColumn {
  type: typeof WELL_ADD_SELECTED_COLUMN;
  column: string;
}

interface RemoveSelectedColumn {
  type: typeof WELL_REMOVE_SELECTED_COLUMN;
  column: string;
}

interface SetSelectedColumn {
  type: typeof WELL_SET_SELECTED_COLUMN;
  columns: string[];
}

export type WellSearchAction =
  | ToggleExpandedWellId
  | ToggleSelectedWells
  | ToggleSelectedWellboreOfWell
  | SetWellboreAssets
  | SetWellboreDigitalRockSamples
  | SetGrainAnalysisData
  | AddSelectedColumn
  | RemoveSelectedColumn
  | SetSelectedColumn;

export interface WellResult {
  wells: Well[];
  error?: Error;
}

export interface WellName {
  id: number;
  name: string;
}

export type WellId = string;
export type WellboreId = string;

export type WellFilterOptionValue = string | number;

export type WellFilterOption = {
  value: WellFilterOptionValue;
  count: number;
};

export type WellFilterMapValue = WellFilterOptionValue[] | string;

export interface WellFilterMap {
  [key: number]: WellFilterMapValue;
}

export interface WellMap {
  [key: number]: Well;
}

export type WellFormatFilter = { [key: string]: WellFilterOptionValue[] };

export interface SequenceData {
  sequence: Sequence;
  rows?: SequenceRow[];
}

export interface DigitalRockSampleData {
  asset: Asset;
  gpart?: SequenceData[];
}

export interface AssetData {
  asset: Asset;
  digitalRockSamples?: DigitalRockSampleData[];
}

export interface WellboreData {
  [key: string]: {
    fit?: SequenceData[];
    lot?: SequenceData[];
    documents?: DocumentType[];
    digitalRocks?: AssetData[];
  };
}

export type TrackType =
  | 'MD'
  | 'TVD'
  | 'GR'
  | 'RDEEP'
  | 'D&N'
  | 'FRM'
  | 'NDS'
  | 'PPFG';

// Well Filter:

export enum FilterTypes {
  CHECKBOXES,
  MULTISELECT,
  MULTISELECT_GROUP,
  NUMERIC_RANGE,
  DATE_RANGE,
}

/**
 * @deprecated
 * Certain filters are only available in Sdk v3, picking thoese filters to use with app well filter
 */
export type FiltersOnlySupportSdkV3 = Pick<
  WellFilterV3,
  'trajectories' | 'datum'
>;

/**
 * @deprecated
 * Type compiled sdk v2 and picked fitlers from sdk v3
 */
export type CommonWellFilter = WellFilter & FiltersOnlySupportSdkV3;

export type FilterConfig = {
  id: number;
  name: string;
  key: string;
  category: string;
  type: FilterTypes;
  fetcher?: () =>
    | Promise<any | string[] | number[] | (Date | undefined)[]>
    | undefined;
  filterParameters?: (
    filters: string[] | Date[] | number[],
    userPreferredUnit: UserPreferredUnit
  ) => CommonWellFilter;
  isTextCapitalized?: boolean;
};

export type FilterConfigMap = {
  [key: number]: FilterConfig;
};

export type WellboreSequencesMap = {
  [key: string]: Sequence[];
};

export type WellboreEventsMap = {
  [key: string]: CogniteEventV3ish[];
};

export type WellboreNPTEventsMap = {
  [key: string]: NPT[];
};

type SequenceItem = number | string | null;
interface SequenceColumnBasicInfo {
  name?: string;
  // externalId?: ExternalId;
  // valueType?: SequenceValueType;
}
export class SequenceRow extends Array<SequenceItem> {
  constructor(
    public rowNumber: number,
    values: SequenceItem[],
    public columns: SequenceColumnBasicInfo[]
  ) {
    super(...values);
  }
}

export type WellboreIdMap = {
  [key: WellboreId]: string;
};

export type WellboreAssetIdMap = {
  [key: WellboreId]: string;
};

export type WellboreExternalAssetIdMap = {
  [key: string]: string;
};

export type WellboreExternalIdMap = {
  [key: string]: string;
};

export type WellboreSourceExternalIdMap = {
  [key: WellboreId]: string;
};

export type IdWellboreMap = Record<string, Wellbore>;

export interface NPTEvent extends NPT {
  wellboreId: string;
  wellName?: string;
  wellboreName?: string;
  nptCodeColor: string;
}

export interface NDSEvent extends CogniteEventV3ish {
  wellboreId: string;
  wellName?: string;
  wellboreName?: string;
  riskType: string;
}

export type CogniteEventV3ish = Omit<CogniteEvent, 'assetIds'> & {
  assetIds?: WellboreId[];
};

export interface FilterValues {
  id: number;
  value: WellFilterOptionValue;
  field?: string;
  category?: string;
  displayName?: string;
}

export interface FilterCategoricalData {
  title: string;
  filterConfigs: FilterConfig[];
  filterConfigIds: number[];
}

export enum MeasurementType {
  geomechanic,
  ppfg,
  fit,
  lot,
}

export enum MeasurementTypeV3 {
  GEOMECHANNICS = 'geomechanics',
  PPFG = 'ppfg',
  FIT = 'fit',
  LOT = 'lot',
}

export enum GeoPpfgFilterTypes {
  GEOMECHANNICS,
  PPFG,
  OTHER,
}

export enum WdlMeasurementType {
  GEOMECHANNICS = 'geomechanics',
  GEOMECHANNICS_PRE_DRILL = 'geomechanics pre drill',
  GEOMECHANNICS_POST_DRILL = 'geomechanics post drill',
  PRESSURE = 'pressure',
  PORE_PRESSURE = 'pore pressure',
  PORE_PRESSURE_PRE_DRILL = 'pore pressure pre drill',
  PORE_PRESSURE_PRE_DRILL_HIGH = 'pore pressure pre drill high',
  PORE_PRESSURE_PRE_DRILL_LOW = 'pore pressure pre drill low',
  PORE_PRESSURE_PRE_DRILL_MEAN = 'pore pressure pre drill mean',
  PORE_PRESSURE_POST_DRILL = 'pore pressure post drill',
  PORE_PRESSURE_POST_DRILL_MEAN = 'pore pressure post drill mean',
  FRACTURE_PRESSURE = 'fracture pressure',
  FRACTURE_PRESSURE_PRE_DRILL = 'fracture pressure pre drill',
  FRACTURE_PRESSURE_PRE_DRILL_HIGH = 'fracture pressure pre drill high',
  FRACTURE_PRESSURE_PRE_DRILL_LOW = 'fracture pressure pre drill low',
  FRACTURE_PRESSURE_PRE_DRILL_MEAN = 'fracture pressure pre drill mean',
  FRACTURE_PRESSURE_POST_DRILL = 'fracture pressure post drill',
  FRACTURE_PRESSURE_POST_DRILL_MEAN = 'fracture pressure post drill mean',
  LOT = 'fit equivalent mud weight',
  FIT = 'lot equivalent mud weight',
}

export interface Measurement extends Sequence {
  rows?: SequenceRow[];
}

/**
 * Combine Sequence and Row data for processing purpose
 */
export interface MeasurementV3 extends DepthMeasurement {
  data?: DepthMeasurementData;
  errors?: DataError[];
}

export type WellboreMeasurementsMap = {
  [key: string]: Measurement[];
};

export type WellboreMeasurementsMapV3 = {
  [key: string]: MeasurementV3[];
};

export type MeasurementCurveConfig = {
  [key in MeasurementType]: {
    [key: string]: Partial<PlotData>;
  };
};

export type MeasurementCurveConfigV3 = {
  [key: string]: {
    [key: string]: Partial<PlotData>;
  };
};

export type MeasurementChartData = Partial<PlotData> & {
  measurementType: MeasurementType;
};

export type MeasurementChartDataV3 = Partial<PlotData> & {
  measurementType: MeasurementTypeV3;
};

export type WellboreChartData = {
  wellbore: Wellbore;
  chartData: MeasurementChartDataV3[];
};

export type WellboreProcessedData = {
  wellbore: Wellbore;
  proccessedData: ProcessedData;
};

/**
 * Store charts and errors encountered after processing MeasurementV3
 */
export type ProcessedData = {
  chartData: MeasurementChartDataV3[];
  errors: Error[];
};

export type RegionFieldBlock =
  | FilterIDs.REGION
  | FilterIDs.FIELD
  | FilterIDs.BLOCK;

export type RegionFieldBlockHierarchy = {
  [key in RegionFieldBlock]: {
    parents: RegionFieldBlock[];
    children: RegionFieldBlock[];
    revalidate: { reference: RegionFieldBlock; filterId: RegionFieldBlock }[];
  };
};

export type RegionFieldBlockResult = { [key in RegionFieldBlock]: string[] };

export interface PreviewCasingType extends CasingType {
  startDepth: number;
  casingStartDepth: number;
  casingDepth: number;
  casingDescription: string;
  /**
   * If the assembly is a liner or casing.
   * True if it's a liner. False otherwise.
   */
  liner: boolean;
  maximumDescription: string;
  /** Invert the triangle (shoe) end */
  leftEnd?: boolean;
}
export interface CasingAssemblyWithTVD extends CasingAssembly {
  trueVerticalDepthTop?: Distance;
  trueVerticalDepthBase?: Distance;
}

export interface CasingSchematicWithTVDs extends CasingSchematic {
  casingAssemblies: Array<CasingAssemblyWithTVD>;
}
