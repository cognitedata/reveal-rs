/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadMetadataParser } from './CadMetadataParser';

import { SectorScene, WellKnownDistanceToMeterConversionFactors } from '../utilities/types';
import { CadModelMetadata } from './CadModelMetadata';
import { MetadataRepository } from './MetadataRepository';
import { transformCameraConfiguration } from '@reveal/utilities';

import {
  ModelDataProvider,
  ModelMetadataProvider,
  ModelIdentifier,
  File3dFormat,
  BlobOutputMetadata
} from '@reveal/modeldata-api';

export class CadModelMetadataRepository implements MetadataRepository<Promise<CadModelMetadata>> {
  private readonly _modelMetadataProvider: ModelMetadataProvider;
  private readonly _modelDataProvider: ModelDataProvider;
  private readonly _cadSceneParser: CadMetadataParser;
  private readonly _blobFileName: string;
  private _currentModelIdentifier = 0;

  constructor(
    modelMetadataProvider: ModelMetadataProvider,
    modelDataProvider: ModelDataProvider,
    blobFileName: string = 'scene.json'
  ) {
    this._cadSceneParser = new CadMetadataParser();
    this._modelMetadataProvider = modelMetadataProvider;
    this._modelDataProvider = modelDataProvider;
    this._blobFileName = blobFileName;
  }

  async loadData(modelIdentifier: ModelIdentifier): Promise<CadModelMetadata> {
    const cadOutput = await this.getSupportedOutput(modelIdentifier);
    const blobBaseUrlPromise = this._modelMetadataProvider.getModelUri(modelIdentifier, cadOutput);
    const modelMatrixPromise = this._modelMetadataProvider.getModelMatrix(modelIdentifier, cadOutput.format);
    const modelCameraPromise = this._modelMetadataProvider.getModelCamera(modelIdentifier);

    const blobBaseUrl = await blobBaseUrlPromise;
    const json = await this._modelDataProvider.getJsonFile(blobBaseUrl, this._blobFileName);
    const scene: SectorScene = this._cadSceneParser.parse(json);
    const modelMatrix = createScaleToMetersModelMatrix(scene.unit, await modelMatrixPromise);
    const inverseModelMatrix = new THREE.Matrix4().copy(modelMatrix).invert();
    const cameraConfiguration = await modelCameraPromise;

    return {
      modelIdentifier: `${this._currentModelIdentifier++}`, // TODO 2021-10-03 larsmoa: Change to ModelIdentifier
      modelBaseUrl: blobBaseUrl,
      // Clip box is not loaded, it must be set elsewhere
      geometryClipBox: null,
      format: cadOutput.format as File3dFormat,
      modelMatrix,
      inverseModelMatrix,
      cameraConfiguration: transformCameraConfiguration(cameraConfiguration, modelMatrix),
      scene
    };
  }

  private async getSupportedOutput(modelIdentifier: ModelIdentifier): Promise<BlobOutputMetadata> {
    const outputs = await this._modelMetadataProvider.getModelOutputs(modelIdentifier);

    const cadModelOutput =
      outputs.find(output => output.format === File3dFormat.GltfCadModel) ??
      outputs.find(output => output.format === File3dFormat.RevealCadModel);

    if (!cadModelOutput)
      throw new Error(
        `Model does not contain any supported cad model output [${File3dFormat.GltfCadModel}, ${File3dFormat.RevealCadModel}]`
      );

    return cadModelOutput;
  }
}

function createScaleToMetersModelMatrix(unit: string, modelMatrix: THREE.Matrix4): THREE.Matrix4 {
  const conversionFactor = WellKnownDistanceToMeterConversionFactors.get(unit) ?? 1;
  if (conversionFactor === undefined) {
    throw new Error(`Unknown model unit '${unit}'`);
  }

  const scaledModelMatrix = new THREE.Matrix4().makeScale(conversionFactor, conversionFactor, conversionFactor);
  return scaledModelMatrix.multiply(modelMatrix);
}
