/*!
 * Copyright 2020 Cognite AS
 */

import { File3dFormat } from '../File3dFormat';

export interface BlobOutputMetadata {
  blobId: number;
  format: File3dFormat | string;
  version: number;
}

export interface ModelUrlProvider<TModelIdentifier> {
  getModelUrl(params: TModelIdentifier): Promise<string>;
}
