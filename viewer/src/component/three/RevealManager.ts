/*!
 * Copyright 2020 Cognite AS
 */

import { RevealManagerBase, RevealOptions } from './RevealManagerBase';
import { CogniteClient } from '@cognite/sdk';
import { CadSectorParser } from '../../data/parser/CadSectorParser';
import { SimpleAndDetailedToSector3D } from '../../data/transformer/three/SimpleAndDetailedToSector3D';
import { CachedRepository } from '../../repository/cad/CachedRepository';
import { MaterialManager } from '../../views/threejs/cad/MaterialManager';

// First iteration of a RevealManager. Currently tailored to examples but should be tailored to external usecase.
// Should move to example-helpers.ts as a function without extending
export class RevealManager extends RevealManagerBase {
  constructor(client: CogniteClient, onUpdatedCallback: () => void, options?: RevealOptions) {
    const modelDataParser: CadSectorParser = new CadSectorParser();
    const materialManager: MaterialManager = new MaterialManager();
    const modelDataTransformer = new SimpleAndDetailedToSector3D(materialManager);
    const sectorRepository = new CachedRepository(modelDataParser, modelDataTransformer);
    super(client, sectorRepository, materialManager, onUpdatedCallback, options);
  }

  public set clippingPlanes(clippingPlanes: THREE.Plane[]) {
    this._materialManager.clippingPlanes = clippingPlanes;
  }

  public get clippingPlanes() {
    return this._materialManager.clippingPlanes;
  }

  public set clipIntersection(intersection: boolean) {
    this._materialManager.clipIntersection = intersection;
  }

  public get clipIntersection() {
    return this._materialManager.clipIntersection;
  }
}
