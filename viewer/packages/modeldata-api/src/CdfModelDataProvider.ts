/*!
 * Copyright 2021 Cognite AS
 */
import { CogniteClient, HttpHeaders } from '@cognite/sdk';

import { ModelDataProvider } from './types';

/**
 * Provides 3D V2 specific extensions for the standard CogniteClient used by Reveal.
 */
export class CdfModelDataProvider implements ModelDataProvider {
  private readonly client: CogniteClient;
  private authenticationPromise: Promise<boolean>;

  constructor(client: CogniteClient) {
    this.client = client;
    this.authenticationPromise = client.authenticate();
  }

  get headers(): HttpHeaders {
    return this.client.getDefaultRequestHeaders();
  }

  public async getBinaryFile(baseUrl: string, fileName: string): Promise<ArrayBuffer> {
    const url = `${baseUrl}/${fileName}`;
    const headers = {
      ...this.client.getDefaultRequestHeaders(),
      Accept: '*/*'
    };

    const response = await this.fetchWithRetry(url, { headers, method: 'GET' });
    return response.arrayBuffer();
  }

  async getJsonFile(baseUrl: string, fileName: string): Promise<any> {
    const response = await this.client.get(`${baseUrl}/${fileName}`);
    return response.data;
  }

  private async fetchWithRetry(input: RequestInfo, options: RequestInit, retries: number = 3) {
    let error: Error | undefined;
    for (let i = 0; i < retries; i++) {
      try {
        await this.authenticationPromise;

        const response = await fetch(input, options);

        // Authentication error
        if (response.status === 401) {
          this.authenticationPromise = this.client.authenticate();
          continue;
        }

        return response;
      } catch (err) {
        // Keep first error only
        if (error !== undefined) {
          error = err as Error;
        }
      }
    }
    throw error;
  }
}
