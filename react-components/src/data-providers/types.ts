/*!
 * Copyright 2024 Cognite AS
 */
import {
  type Datapoints,
  type Timeseries,
  type ExternalId,
  type InternalId,
  type Metadata,
  type Relationship,
  type Asset
} from '@cognite/sdk';

export type RelationshipsFilterInternal = {
  labels?: string[];
};

export type ExtendedRelationship = {
  relation: 'Source' | 'Target';
} & Relationship;

export type ExtendedRelationshipWithSourceAndTarget = {
  relation: 'Source' | 'Target';
} & Relationship &
  Partial<RelationshipSourceAndTargetTimeseries>;

export type RelationshipSourceAndTargetTimeseries = {
  source: Timeseries;
  target: Timeseries;
};

export type RelationshipSourceAndTarget = {
  source: RelationshipSourceAndTargetData;
  target: RelationshipSourceAndTargetData;
};

export type RelationshipSourceAndTargetData = {
  externalId?: string;
  id?: number;
  metadata?: Metadata;
};

export type RelationshipData = ExtendedRelationship & RelationshipSourceAndTarget;

export type AssetIdsAndTimeseries = {
  assetIds?: Partial<ExternalId & InternalId>;
  timeseries?: Timeseries | undefined;
};

export type AssetAndTimeseries = {
  asset: Asset;
  timeseries?: Timeseries[] | undefined;
};

export type AssetAndTimeseriesIds = {
  assetIds: Partial<ExternalId & InternalId>;
  timeseriesIds: Partial<ExternalId & InternalId>;
};

export type AssetIdsAndTimeseriesData = {
  assetIdsWithTimeseries: AssetIdsAndTimeseries[];
  timeseriesDatapoints: Datapoints[];
};
