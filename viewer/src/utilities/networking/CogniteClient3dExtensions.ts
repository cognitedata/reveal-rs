/*!
 * Copyright 2020 Cognite AS
 */

import { CogniteClient, IdEither, ItemsResponse } from '@cognite/sdk';
import { HttpHeaders } from '@cognite/sdk/dist/src/utils/http/basicHttpClient';
import { File3dFormat } from '../File3dFormat';
import { CadSceneProvider } from '@/dataModels/cad/internal/CadSceneProvider';
import { ModelUrlProvider } from './ModelUrlProvider';
import { BlobOutputMetadata } from './BlobOutputMetadata';
import { ModelOutputList } from './ModelOutputList';
import { CadSectorProvider } from '@/dataModels/cad/internal/sector/CadSectorProvider';

interface OutputsRequest {
  models: IdEither[];
  formats?: (string | File3dFormat)[];
}

/**
 * Provides 3D V2 specific extensions for the standard CogniteClient used by Reveal.
 */
export class CogniteClient3dExtensions implements ModelUrlProvider, CadSceneProvider, CadSectorProvider {
  private readonly client: CogniteClient;

  constructor(client: CogniteClient) {
    this.client = client;
  }

  public async getCadSectorFile(blobUrl: string, fileName: string): Promise<ArrayBuffer> {
    const url = `${blobUrl}/${fileName}`;
    const headers: HttpHeaders = {
      ...this.client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };
    const response = await fetch(url, { headers, method: 'GET' });
    return response.arrayBuffer();
  }

  public async getCadScene(blobUrl: string): Promise<any> {
    const json = await this.client.get(`${blobUrl}/scene.json`);
    return json;
  }
  public async getModelUrl(modelRevisionId: IdEither, format: File3dFormat): Promise<string> {
    const outputs = await this.getOutputs(modelRevisionId, [format]);
    const blobId = outputs.findMostRecentOutput(format)!.blobId;
    return `${this.client.getBaseUrl()}/${this.buildBlobRequestPath(blobId)}`;
  }

  public async getOutputs(modelRevisionId: IdEither, formats?: (File3dFormat | string)[]): Promise<ModelOutputList> {
    const url = `/api/playground/projects/${this.client.project}/3d/v2/outputs`;
    const request: OutputsRequest = {
      models: [modelRevisionId],
      formats
    };
    const response = await this.client.post<ItemsResponse<{ model: IdEither; outputs: BlobOutputMetadata[] }>>(url, {
      data: request
    });
    if (response.status === 200) {
      const item = response.data.items[0];
      return new ModelOutputList(item.model, item.outputs);
    }
    throw new Error(`Unexpected response ${response.status} (payload: '${response.data})`);
  }
  private buildBlobRequestPath(blobId: number): string {
    const url = `/api/playground/projects/${this.client.project}/3d/v2/blobs/${blobId}`;
    return url;
  }
}
