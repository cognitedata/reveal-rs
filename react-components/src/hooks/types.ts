/*!
 * Copyright 2023 Cognite AS
 */
import { type Node3D, type CogniteExternalId, type Asset } from '@cognite/sdk';
import { type AssetAnnotationImage360Info } from '@cognite/reveal';
import { type DmsUniqueIdentifier } from '../data-providers';
import { type FdmNode } from '../data-providers/FdmSDK';
import { type AssetProperties } from '../data-providers/core-dm-provider/utils/filters';

export type ThreeDModelFdmMappings = {
  modelId: number;
  revisionId: number;
  mappings: Map<CogniteExternalId, Node3D[]>;
};

export type Model3DEdgeProperties = {
  revisionId: number;
  revisionNodeId: number;
};

export type Image360LayersUrlStateParam = {
  siteId: string;
  applied: boolean;
};

export type CadLayersUrlStateParam = {
  revisionId: number;
  applied: boolean;
  index: number;
};

export type PointCloudLayersUrlStateParam = {
  revisionId: number;
  applied: boolean;
  index: number;
};

export type Reveal360AnnotationAssetData = {
  asset: Asset;
  assetAnnotationImage360Info: AssetAnnotationImage360Info;
};

export type PointCloudAnnotationMappedAssetData = {
  annotationId: number;
  asset: Asset;
};

export type Image360AnnotationMappedAssetData =
  | ClassicImage360AnnotationMappedData
  | DmImage360AnnotationMappedData;

export type ClassicImage360AnnotationMappedData = {
  asset: Asset;
  annotationIds: number[];
};

export type DmImage360AnnotationMappedData = {
  asset: FdmNode<AssetProperties>;
  annotationIds: DmsUniqueIdentifier[];
};
