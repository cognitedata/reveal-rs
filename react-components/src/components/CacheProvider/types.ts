/*!
 * Copyright 2023 Cognite AS
 */
import {
  type AnnotationModel,
  type AnnotationsBoundingVolume,
  type Node3D,
  type AnnotationsCogniteAnnotationTypesImagesAssetLink,
  type AssetMapping3D
} from '@cognite/sdk';
import { type Source, type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import { type AssetAnnotationImage360Info, type DataSourceType } from '@cognite/reveal';
import { type Vector3 } from 'three';
import { type AssetInstance } from '../../utilities/instances';

export type NodeAssetMappingResult = { node?: Node3D; mappings: AssetMapping[] };

export type AssetMapping = AssetMapping3D;

export type FdmCadConnection = {
  instance: DmsUniqueIdentifier;
  modelId: number;
  revisionId: number;
  treeIndex: number;
};
export type FdmConnectionWithNode = {
  connection: FdmCadConnection;
  cadNode: Node3D;
  views?: Source[];
};

export type CadNodeWithFdmIds = { cadNode: Node3D; fdmIds: DmsUniqueIdentifier[] };
export type CadNodeWithConnections = { cadNode: Node3D; connections: FdmCadConnection[] };
export type FdmNodeDataPromises = {
  cadAndFdmNodesPromise: Promise<CadNodeWithFdmIds | undefined>;
  viewsPromise: Promise<Source[][] | undefined>;
};

export type ModelRevisionAssetNodesResult = {
  modelId: ModelId;
  revisionId: RevisionId;
  assetToNodeMap: Map<AssetId, Node3D[]>;
};

export type AncestorQueryResult = {
  connections: FdmCadConnection[];
  ancestorsWithSameMapping: Node3D[];
  firstMappedAncestorTreeIndex: number;
};

export type ModelId = number;
export type RevisionId = number;
export type NodeId = number;
export type TreeIndex = number;
export type AssetId = number;
export type FdmId = DmsUniqueIdentifier;

export type ModelRevisionId = { modelId: number; revisionId: number };

export type ModelRevisionKey = `${ModelId}/${RevisionId}`;
export type FdmKey = `${string}/${string}`;
export type ModelTreeIndexKey = `${ModelId}/${RevisionId}/${TreeIndex}`;
export type ModelAssetIdKey = `${ModelId}/${RevisionId}/${AssetId}`;

export type ModelDMSUniqueInstanceKey = `${ModelId}/${RevisionId}/${string}/${string}`;

export type ModelRevisionToConnectionMap = Map<ModelRevisionKey, FdmConnectionWithNode[]>;

export type PointCloudAnnotationModel = AnnotationModel & { data: AnnotationsBoundingVolume };

export type Image360AnnotationModel = AnnotationModel & {
  data: AnnotationsCogniteAnnotationTypesImagesAssetLink;
};

export type Image360AnnotationAssetInfo = {
  asset: AssetInstance;
  assetAnnotationImage360Info: AssetAnnotationImage360Info<DataSourceType>;
  position: Vector3;
};

export type AnnotationId = number;

export type ChunkInCacheTypes<ObjectType> = {
  chunkInCache: ObjectType[];
  chunkNotInCacheIdClassic?: number[];
  chunkNotInCacheIdDMS?: DmsUniqueIdentifier[];
};

type PointCloudVolume = {
  externalId: string;
  space: string;
  volumeReference: string;
  volumeType: string;
  volume: number[];
  object3D: DmsUniqueIdentifier;
};

export type PointCloudVolumeWithAsset = PointCloudVolume & {
  dmAsset?: {
    externalId: string;
    space: string;
    object3D: DmsUniqueIdentifier;
    name: string;
    description: string;
  };
};
