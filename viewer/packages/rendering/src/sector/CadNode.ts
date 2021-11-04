/**
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { CadMaterialManager } from '../CadMaterialManager';
import { SectorQuads } from '../rendering/types';
import { NodeTransformProvider } from '../transform/NodeTransformProvider';
import { suggestCameraConfig } from '../cameraconfig';
import { InstancedMeshManager } from '../InstancedMeshManager';
import { RenderMode } from '../rendering/RenderMode';

import { NodeAppearanceProvider, NodeAppearance } from '@reveal/cad-styling';
import {
  SectorScene,
  CadModelMetadata,
  SectorGeometry,
  InstancedMeshFile,
  RootSectorNode,
  WantedSector,
  ConsumedSector
} from '@reveal/cad-parsers';
import { SectorRepository } from '@reveal/sector-loader';

export type ParseCallbackDelegate = (parsed: { lod: string; data: SectorGeometry | SectorQuads }) => void;

export interface SuggestedCameraConfig {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
}

export class CadNode extends THREE.Object3D {
  private readonly _rootSector: RootSectorNode;
  private readonly _cadModelMetadata: CadModelMetadata;
  private readonly _materialManager: CadMaterialManager;
  private readonly _sectorScene: SectorScene;
  private readonly _previousCameraMatrix = new THREE.Matrix4();
  private readonly _instancedMeshManager: InstancedMeshManager;
  private readonly _sectorRepository: SectorRepository;

  constructor(model: CadModelMetadata, materialManager: CadMaterialManager, sectorRepository: SectorRepository) {
    super();
    this.type = 'CadNode';
    this.name = 'Sector model';
    this._materialManager = materialManager;
    this._sectorRepository = sectorRepository;

    const instancedMeshGroup = new THREE.Group();
    instancedMeshGroup.name = 'InstancedMeshes';

    this._instancedMeshManager = new InstancedMeshManager(instancedMeshGroup, materialManager);

    const rootSector = new RootSectorNode(model);

    rootSector.add(instancedMeshGroup);

    this._cadModelMetadata = model;
    const { scene } = model;

    this._sectorScene = scene;
    // Ensure camera matrix is unequal on first frame
    this._previousCameraMatrix.elements[0] = Infinity;

    // Prepare renderables
    this._rootSector = rootSector;
    this.add(rootSector);

    this.matrixAutoUpdate = false;
    this.updateMatrixWorld();
    this.setModelTransformation(model.modelMatrix);
  }

  get nodeTransformProvider(): NodeTransformProvider {
    return this._materialManager.getModelNodeTransformProvider(this._cadModelMetadata.modelIdentifier);
  }

  get nodeAppearanceProvider(): NodeAppearanceProvider {
    return this._materialManager.getModelNodeAppearanceProvider(this._cadModelMetadata.modelIdentifier);
  }

  get defaultNodeAppearance(): NodeAppearance {
    return this._materialManager.getModelDefaultNodeAppearance(this._cadModelMetadata.modelIdentifier);
  }

  set defaultNodeAppearance(appearance: NodeAppearance) {
    this._materialManager.setModelDefaultNodeAppearance(this._cadModelMetadata.modelIdentifier, appearance);
  }

  get clippingPlanes(): THREE.Plane[] {
    return this._materialManager.clippingPlanes;
  }

  set clippingPlanes(planes: THREE.Plane[]) {
    this._materialManager.clippingPlanes = planes;
  }

  get cadModelMetadata() {
    return this._cadModelMetadata;
  }

  get sectorScene(): SectorScene {
    return this._sectorScene;
  }

  get rootSector() {
    return this._rootSector;
  }

  get materialManager() {
    return this._materialManager;
  }

  set renderMode(mode: RenderMode) {
    this._materialManager.setRenderMode(mode);
  }

  get renderMode() {
    return this._materialManager.getRenderMode();
  }

  public loadSector(sector: WantedSector): Promise<ConsumedSector> {
    return this._sectorRepository.loadSector(sector);
  }

  /**
   * Sets transformation matrix of the model. This overrides the current transformation.
   * @param matrix Transformation matrix.
   */
  setModelTransformation(matrix: THREE.Matrix4): void {
    this._rootSector.setModelTransformation(matrix);
    this._cadModelMetadata.modelMatrix.copy(matrix);
  }

  /**
   * Gets transformation matrix of the model
   * @param out Preallocated `THREE.Matrix4` (optional).
   */
  getModelTransformation(out?: THREE.Matrix4): THREE.Matrix4 {
    return this._rootSector.getModelTransformation(out);
  }

  public suggestCameraConfig(): SuggestedCameraConfig {
    const { position, target, near, far } = suggestCameraConfig(this._sectorScene.root);

    const modelMatrix = this.getModelTransformation();
    const threePos = position.clone();
    const threeTarget = target.clone();
    threePos.applyMatrix4(modelMatrix);
    threeTarget.applyMatrix4(modelMatrix);

    return {
      position: threePos,
      target: threeTarget,
      near,
      far
    };
  }

  public updateInstancedMeshes(instanceMeshFiles: InstancedMeshFile[], modelIdentifier: string, sectorId: number) {
    for (const instanceMeshFile of instanceMeshFiles) {
      this._instancedMeshManager.addInstanceMeshes(instanceMeshFile, modelIdentifier, sectorId);
    }
  }

  public discardInstancedMeshes(sectorId: number) {
    this._instancedMeshManager.removeSectorInstancedMeshes(sectorId);
  }

  public clearCache(): void {
    this._sectorRepository.clear();
  }
}
