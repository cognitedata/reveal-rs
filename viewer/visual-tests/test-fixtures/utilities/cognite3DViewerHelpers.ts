/*!
 * Copyright 2022 Cognite AS
 */

import { createApplicationSDK } from '../../../test-utilities/src/appUtils';
import { AddModelOptions, Cognite3DModel, Cognite3DViewer } from '../../../packages/api';
import { CogniteClient } from '@cognite/sdk';
import { CognitePointCloudModel } from '@reveal/pointclouds';
import { OnLoadingCallback } from 'dist';

export async function createCognite3DViewer(onLoading: OnLoadingCallback = () => {}): Promise<Cognite3DViewer> {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.has('modelId') && urlParams.has('revisionId')) {
    const client = await createApplicationSDK('reveal.example.simple', {
      project: '3d-test',
      cluster: 'greenfield',
      clientId: 'a03a8caf-7611-43ac-87f3-1d493c085579',
      tenantId: '20a88741-8181-4275-99d9-bd4451666d6e'
    });

    return new Cognite3DViewer({ sdk: client, logMetrics: false, onLoading });
  }

  const client = new CogniteClient({
    appId: 'reveal-visual-tests',
    project: 'dummy',
    getToken: async () => 'dummy'
  });

  return new Cognite3DViewer({ sdk: client, _localModels: true, logMetrics: false, onLoading });
}

export async function addModel(
  viewer: Cognite3DViewer,
  localModelUrl = 'primitives'
): Promise<Cognite3DModel | CognitePointCloudModel> {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  if (urlParams.has('modelId') && urlParams.has('revisionId')) {
    return viewer.addModel({
      modelId: parseInt(urlParams.get('modelId')!),
      revisionId: parseInt(urlParams.get('revisionId')!)
    });
  }

  const modelName = urlParams.get('modelUrl') ?? localModelUrl;
  const fullModelUrl = `${window.location.origin}/${modelName}`;

  const modelOptions: AddModelOptions = {
    modelId: -1,
    revisionId: -1,
    localPath: fullModelUrl
  };

  if (await isLocalUrlPointCloudModel(fullModelUrl)) {
    return viewer.addPointCloudModel(modelOptions);
  } else {
    return viewer.addCadModel(modelOptions);
  }

  async function isLocalUrlPointCloudModel(modelBaseUrl: string) {
    // The hacky check below is due to webpack-dev-server returning 200 for non-existing files. We therefore check if the
    // response is a valid json.
    const eptJsonRequest = await fetch(modelBaseUrl + '/ept.json');
    try {
      if (eptJsonRequest.ok) {
        await eptJsonRequest.json();
      } else {
        return false;
      }
    } catch (_e) {
      return false;
    }
    return true;
  }
}
