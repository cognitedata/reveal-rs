/*!
 * Copyright 2020 Cognite AS
 */
;
import { CadNode } from './CadNode';
import { CadModelMetadata } from '../public/CadModelMetadata';
import { MaterialManager } from './MaterialManager';
import { ModelNodeAppearance } from './ModelNodeAppearance';

export class CadModelFactory {
  private readonly _materialManager: MaterialManager;
  constructor(materialManager: MaterialManager) {
    this._materialManager = materialManager;
  }

  createModel(modelMetadata: CadModelMetadata, modelAppearance?: ModelNodeAppearance): CadNode {
    const { blobUrl, scene } = modelMetadata;
    const cadModel = new CadNode(modelMetadata, this._materialManager);
    this._materialManager.addModelMaterials(blobUrl, scene.maxTreeIndex, modelAppearance);
    return cadModel;
  }
}
