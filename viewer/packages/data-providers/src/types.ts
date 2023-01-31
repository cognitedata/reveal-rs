/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';

export interface JsonFileProvider {
  getJsonFile(baseUrl: string, fileName: string): Promise<any>;
}

export interface BinaryFileProvider {
  getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer>;
}

export interface Image360DescriptorProvider<T> {
  get360ImageDescriptors(metadataFilter: T): Promise<Image360Descriptor[]>;
}

export interface Image360FileProvider {
  get360ImageFiles(image360FaceDescriptors: Image360FileDescriptor[]): Promise<Image360Face[]>;
}

export type Image360Descriptor = Image360EventDescriptor & {
  faceDescriptors: Image360FileDescriptor[];
};

export type Image360EventDescriptor = {
  id: string;
  label: string;
  collectionId: string;
  collectionLabel: string;
  transformations: {
    translation: THREE.Matrix4;
    rotation: THREE.Matrix4;
  };
};

export type Image360Face = {
  face: 'front' | 'back' | 'left' | 'right' | 'top' | 'bottom';
  data: ArrayBuffer;
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
