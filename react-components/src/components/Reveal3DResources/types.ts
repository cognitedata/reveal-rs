/*!
 * Copyright 2023 Cognite AS
 */

import {
  type NodeAppearance,
  type AddModelOptions,
  type Image360AnnotationAppearance,
  type DataSourceType,
  type ClassicDataSourceType,
  type CogniteCadModel,
  type CognitePointCloudModel,
  type Image360Collection
} from '@cognite/reveal';

import { type Matrix4 } from 'three';
import { type DmsUniqueIdentifier, type Source } from '../../data-providers/FdmSDK';
import { type CogniteInternalId, type Node3D } from '@cognite/sdk';
import { type TreeIndexStylingGroup } from '../CadModelContainer/types';
import {
  type PointCloudAnnotationModel,
  type PointCloudVolumeWithAsset
} from '../CacheProvider/types';
import { type PointCloudVolumeStylingGroup } from '../PointCloudContainer';

export type AddImage360CollectionOptions =
  | AddImage360CollectionEventsOptions
  | AddImage360CollectionDatamodelsOptions
  | AddImage360CollectionCdmOptions;

export type CommonImage360CollectionAddOptions = {
  transform?: Matrix4;
  iconCullingOptions?: { radius?: number; iconCountLimit?: number };
};

export type AddImage360CollectionEventsOptions = {
  source: 'events';
  siteId: string;
} & CommonImage360CollectionAddOptions;

export type AddImage360CollectionDatamodelsOptions = {
  source: 'cdm' | 'dm';
  externalId: string;
  space: string;
} & CommonImage360CollectionAddOptions;

export type AddImage360CollectionCdmOptions = {
  source: 'cdm';
  externalId: string;
  space: string;
} & CommonImage360CollectionAddOptions;
export type FdmPropertyType<NodeType> = Record<string, Record<string, NodeType>>;

export type TaggedAddImage360CollectionOptions = {
  type: 'image360';
  addOptions: AddImage360CollectionOptions;
};
export type TaggedAddCadResourceOptions = {
  type: 'cad';
  addOptions: AddCadResourceOptions;
};

export type TaggedAddPointCloudResourceOptions = {
  type: 'pointcloud';
  addOptions: AddPointCloudResourceOptions;
};

export type TaggedAddResourceOptions =
  | TaggedAddCadResourceOptions
  | TaggedAddPointCloudResourceOptions
  | TaggedAddImage360CollectionOptions;

export type AddResourceOptions =
  | AddCadResourceOptions
  | AddPointCloudResourceOptions
  | AddImage360CollectionOptions;

export type AddPointCloudResourceOptions<T extends DataSourceType = DataSourceType> =
  AddModelOptions<T> & {
    transform?: Matrix4;
    styling?: { default?: NodeAppearance; mapped?: NodeAppearance };
  };

export type AddCadResourceOptions = AddModelOptions<ClassicDataSourceType> & {
  transform?: Matrix4;
  styling?: {
    default?: NodeAppearance;
    mapped?: NodeAppearance;
    nodeGroups?: TreeIndexStylingGroup[];
  };
};

export type ClassicAdd3DModelOptions =
  | AddCadResourceOptions
  | AddPointCloudResourceOptions<ClassicDataSourceType>;

export type TypedReveal3DModel = CadModelOptions | PointCloudModelOptions;

export type CadModelOptions = { type: 'cad' } & AddCadResourceOptions;

export type PointCloudModelOptions = { type: 'pointcloud' } & AddPointCloudResourceOptions;

export type NodeDataResult = {
  fdmNode: DmsUniqueIdentifier;
  view: Source;
  cadNode: Node3D;
};

export type FdmAssetStylingGroup = {
  fdmAssetExternalIds: DmsUniqueIdentifier[];
  style: {
    cad?: NodeAppearance;
    pointcloud?: NodeAppearance;
  };
};

export type AssetStylingGroup = {
  assetIds: CogniteInternalId[];
  style: {
    cad?: NodeAppearance;
    pointcloud?: NodeAppearance;
  };
};

export type Image360AssetStylingGroup = {
  assetIds: CogniteInternalId[];
  style: { image360?: Image360AnnotationAppearance };
};

export type Image360DMAssetStylingGroup = {
  assetRefs: DmsUniqueIdentifier[];
  style: { image360?: Image360AnnotationAppearance };
};

export type InstanceStylingGroup =
  | FdmAssetStylingGroup
  | AssetStylingGroup
  | Image360AssetStylingGroup
  | Image360DMAssetStylingGroup;

export type DefaultResourceStyling = {
  cad?: { default?: NodeAppearance; mapped?: NodeAppearance };
  pointcloud?: { default: NodeAppearance; mapped?: NodeAppearance };
  image360?: { default: Image360AnnotationAppearance; mapped: Image360AnnotationAppearance };
};

export type Reveal3DResourcesProps = {
  resources: AddResourceOptions[];
} & CommonResourceContainerProps;

export type CommonImage360Settings = {
  iconCullingOptions: { radius?: number; iconCountLimit?: number };
};

export type CommonResourceContainerProps = {
  defaultResourceStyling?: DefaultResourceStyling;
  instanceStyling?: InstanceStylingGroup[];
  image360Settings?: CommonImage360Settings;
  onResourcesAdded?: () => void;
  onResourceLoadError?: (failedResource: AddResourceOptions, error: any) => void;
  onResourceIsLoaded?: (
    model:
      | CogniteCadModel
      | CognitePointCloudModel<DataSourceType>
      | Image360Collection<DataSourceType>
  ) => void;
};

export type StyledPointCloudModel = {
  model: PointCloudModelOptions;
  styleGroups: PointCloudVolumeStylingGroup[];
};

export type AnnotationModelDataResult = {
  model: PointCloudModelOptions;
  annotationModel: PointCloudAnnotationModel[];
};

export type DMVolumeModelDataResult = {
  model: PointCloudModelOptions;
  pointCloudDMVolumeWithAsset: PointCloudVolumeWithAsset[];
};
