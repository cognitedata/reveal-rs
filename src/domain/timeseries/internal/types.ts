import { CogniteExternalId, CogniteInternalId, Metadata } from '@cognite/sdk';
import { InternalCommonFilters, Order } from '../../types';
export interface InternalTimeseriesData {
  id: number;
  lastUpdatedTime: Date;
  createdTime: Date;
  isString: boolean;
  isStep: boolean;
  description: string;
  name?: string;
  unit?: string;
  externalId?: CogniteExternalId;
  metadata?: Metadata;
  assetId?: number;
  dataSetId?: CogniteInternalId;
  securityCategories?: number[];
}

export interface InternalTimeseriesFilters extends InternalCommonFilters {
  isStep?: boolean;
  isString?: boolean;
  unit?: string;
  metadata?: { key: string; value: string }[];
}

export interface OldTimeseriesFilters
  extends Omit<InternalTimeseriesFilters, 'metadata'> {
  metadata?: Metadata;
}

// We need this type instead of `InternalSortBy` becuase property is a string array for Timeseries.
export type InternalTimeseriesSortBy = {
  property: string[];
  order: Order;
};
