/*!
 * Copyright 2021 Cognite AS
 */
import { AnnotationModel, AnnotationsCogniteAnnotationTypesImagesAssetLink, IdEither } from '@cognite/sdk';
import * as THREE from 'three';
import { ClassicDataSourceType, DataSourceType, DMDataSourceType } from './DataSourceType';
import {
  AssetAnnotationImage360Info,
  DefaultImage360Collection,
  Image360AnnotationAssetQueryResult
} from '@reveal/360-images';
import { DMInstanceRef } from '@reveal/utilities';

export type Image360AnnotationFilterDelegate<T extends DataSourceType> = (
  annotation: T['image360AnnotationType']
) => boolean;

export interface JsonFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
}

export interface BinaryFileProvider {
  getBinaryFile(baseUrl: string, fileName: string, abortSignal?: AbortSignal): Promise<ArrayBuffer>;
}

/**
 * An ID identifiying a single Image360 entity within a collection
 */
export type Image360Id<T extends DataSourceType> = Image360RevisionId<T>;
/**
 * An ID identifiying a single Image360 revision within a collection
 */
export type Image360RevisionId<T extends DataSourceType> = T extends DMDataSourceType ? DMInstanceRef : string;

export type Image360AnnotationSpecifier<T extends DataSourceType> = {
  revisionId: Image360RevisionId<T>;
  fileDescriptors: Image360FileDescriptor[];
};

/**
 * Filter for finding linked annotations in either a classic 360 collection or a new one
 */
export type InstanceReference<T extends DataSourceType = DataSourceType> = T extends ClassicDataSourceType
  ? IdEither
  : DMInstanceRef;

export interface Image360AnnotationProvider<T extends DataSourceType> {
  getRelevant360ImageAnnotations(
    annotationSpecifier: Image360AnnotationSpecifier<T>
  ): Promise<T['image360AnnotationType'][]>;
  findImageAnnotationsForInstance(
    instanceFilter: InstanceReference<T>,
    collection: DefaultImage360Collection<T>
  ): Promise<Image360AnnotationAssetQueryResult<T>[]>;
  getAllImage360AnnotationInfos(
    collection: DefaultImage360Collection<T>,
    annotationFilter: Image360AnnotationFilterDelegate<T>
  ): Promise<AssetAnnotationImage360Info<T>[]>;
}

export interface Image360DescriptorProvider<T extends DataSourceType> {
  get360ImageDescriptors(
    metadataFilter: T['image360Identifier'],
    preMultipliedRotation: boolean
  ): Promise<Historical360ImageSet<T>[]>;
}

export interface Image360FileProvider {
  get360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]>;

  getLowResolution360ImageFiles(
    image360FaceDescriptors: Image360FileDescriptor[],
    abortSignal?: AbortSignal
  ): Promise<Image360Face[]>;
}

/**
 * A CDF AnnotationModel with a narrower type representing an image asset link
 */
export type ImageAssetLinkAnnotationInfo = Omit<AnnotationModel, 'data'> & {
  /**
   * The data associated with the image asset link
   */
  data: AnnotationsCogniteAnnotationTypesImagesAssetLink;
};

export type Historical360ImageSet<T extends DataSourceType> = Image360RevisionDescriptor<T> & {
  imageRevisions: Image360Descriptor<T>[];
};

export type Image360Descriptor<T extends DataSourceType> = {
  id: Image360RevisionId<T>;
  timestamp?: number | string;
  faceDescriptors: Image360FileDescriptor[];
};

export type Image360RevisionDescriptor<T extends DataSourceType> = {
  id: Image360RevisionId<T>;
  label: string | undefined;
  collectionId: string;
  collectionLabel: string | undefined;
  transform: THREE.Matrix4;
};

export type Image360Face = {
  face: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
  mimeType: 'image/jpeg' | 'image/png';
  data: ArrayBuffer;
};

export type Image360Texture = {
  face: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
  texture: THREE.Texture;
};

export type Image360FileDescriptor = {
  fileId: number;
  face: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
  mimeType: 'image/jpeg' | 'image/png';
};

export enum File3dFormat {
  EptPointCloud = 'ept-pointcloud',
  /**
   * Reveal v9 and above (GLTF based output)
   */
  GltfCadModel = 'gltf-directory',
  AnyFormat = 'all-outputs'
}

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}

type InstanceType = 'node' | 'edge';

export type Item = {
  instanceType: InstanceType;
} & DMInstanceRef;

export type Source = {
  type: 'view';
  version: string;
} & DMInstanceRef;

export type EdgeItem = {
  startNode: DMInstanceRef;
  endNode: DMInstanceRef;
};

export type Query = {
  with: Record<string, ResultSetExpression>;
  select: Record<string, QuerySelect>;
  parameters?: Record<string, string | number>;
  cursors?: Record<string, string>;
};

type QuerySelect = {
  sources: readonly SourceProperties[];
};

type SourceProperties = {
  source: TestSource;
  properties: readonly string[];
};

type TestSource = {
  type: 'view';
  space: string;
  externalId: string;
  version: string;
};

export type ResultSetExpression = (NodeResultSetExpression | EdgeResultSetExpression) & {
  limit?: number;
  sort?: any[];
};

export type NodeResultSetExpression = {
  nodes: {
    filter?: any;
    from?: any;
    through?: any;
    chainTo?: any;
  };
};

export type EdgeResultSetExpression = {
  edges: {
    filter?: any;
    from?: any;
    nodeFilter?: any;
    maxDistance?: number;
    direction?: 'outwards' | 'inwards';
    limitEach?: number;
  };
};

type SelectKey<T extends Query> = keyof T['select'];
type Sources<T extends Query, K extends SelectKey<T>> = T['select'][K]['sources'][0];
type MainSource<T extends Query, K extends SelectKey<T>> = Sources<T, K>['source'];
type MainSourceProperties<T extends Query, K extends SelectKey<T>> = Sources<T, K>['properties'];

type ResultExpressionProperties<T extends Query, K extends SelectKey<T>> = {
  [V in MainSource<T, K>['space']]: {
    [Q in `${MainSource<T, K>['externalId']}/${MainSource<T, K>['version']}`]: {
      [B in MainSourceProperties<T, K>[number]]: string | number | DMInstanceRef;
    };
  };
};

type ResultExpression<T extends Query, K extends SelectKey<T>> = {
  instanceType: 'node';
  version: number;
  space: string;
  externalId: string;
  createdTime: number;
  lastUpdatedTime: number;
  properties: ResultExpressionProperties<T, K>;
};

export type QueryNextCursors<T extends Query> = { [K in SelectKey<T>]?: string | undefined };

export type QueryResult<T extends Query> = {
  [K in SelectKey<T>]: ResultExpression<T, K>[];
} & { nextCursor?: QueryNextCursors<T> };
