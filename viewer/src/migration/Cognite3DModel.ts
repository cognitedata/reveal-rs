/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { Color } from './types';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { CadModel } from '../models/cad/CadModel';
import { toThreeJsBox3, CadNode } from '../views/threejs';
import { loadCadModelFromCdf } from '../datasources/cognitesdk';
import { CadRenderHints } from '../views/CadRenderHints';
import { NodeAppearance } from '../views/common/cad/NodeAppearance';
import { CadLoadingHints } from '../models/cad/CadLoadingHints';
import { ParsedSector } from '../data/model/ParsedSector';
import { NodeIdAndTreeIndexMaps } from './NodeIdAndTreeIndexMaps';
import { CogniteClient } from '@cognite/sdk';

export class Cognite3DModel extends THREE.Object3D {
  get renderHints(): CadRenderHints {
    return this.cadNode.renderHints;
  }

  set renderHints(hints: CadRenderHints) {
    this.cadNode.renderHints = hints;
  }

  get loadingHints(): CadLoadingHints {
    return this.cadNode.loadingHints;
  }

  set loadingHints(hints: CadLoadingHints) {
    this.cadNode.loadingHints = hints;
  }
  readonly modelId: number;
  readonly revisionId: number;
  readonly cadModel: CadModel;
  readonly cadNode: CadNode;
  readonly nodeColors: Map<number, [number, number, number, number]>;
  readonly client: CogniteClient;
  readonly nodeIdAndTreeIndexMaps: NodeIdAndTreeIndexMaps;

  constructor(modelId: number, revisionId: number, model: CadModel, client: CogniteClient) {
    super();
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.cadModel = model;
    this.client = client;
    this.nodeColors = new Map();
    this.nodeIdAndTreeIndexMaps = new NodeIdAndTreeIndexMaps(modelId, revisionId, client);
    const nodeAppearance: NodeAppearance = {
      color: (treeIndex: number) => {
        return this.nodeColors.get(treeIndex);
      }
    };
    this.cadNode = new CadNode(model, {
      nodeAppearance,
      internal: {
        parseCallback: (sector: ParsedSector) => {
          this.nodeIdAndTreeIndexMaps.updateMaps(sector);
        }
      }
    });

    this.children.push(this.cadNode);
  }

  dispose() {
    this.children = [];
  }

  getSubtreeNodeIds(_nodeId: number, _subtreeSize?: number): Promise<number[]> {
    throw new NotSupportedInMigrationWrapperError();
  }

  getBoundingBox(nodeId?: number, box?: THREE.Box3): THREE.Box3 {
    if (nodeId) {
      throw new NotSupportedInMigrationWrapperError();
    }

    const bounds = this.cadModel.scene.root.bounds;
    return toThreeJsBox3(box || new THREE.Box3(), bounds, this.cadModel.modelTransformation);
  }

  iterateNodes(_action: (nodeId: number, treeIndex?: number) => void): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  iterateSubtree(
    _nodeId: number,
    _action: (nodeId: number, treeIndex?: number) => void,
    _treeIndex?: number,
    _subtreeSize?: number
  ): Promise<boolean> {
    throw new NotSupportedInMigrationWrapperError();
  }

  async getNodeColor(nodeId: number): Promise<Color> {
    try {
      const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
      const color = this.nodeColors.get(treeIndex);
      if (!color) {
        // TODO: migration wrapper currently does not support looking up colors not set by the user
        throw new NotSupportedInMigrationWrapperError();
      }
      const [r, g, b] = color;
      return {
        r,
        g,
        b
      };
    } catch (error) {
      console.error(`Cannot get color of ${nodeId} because of error:`, error);
      return {
        r: 255,
        g: 255,
        b: 255
      };
    }
  }

  async setNodeColor(nodeId: number, r: number, g: number, b: number): Promise<void> {
    try {
      const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
      this.setNodeColorByTreeIndex(treeIndex, r, g, b);
    } catch (error) {
      console.error(`Cannot set color of ${nodeId} because of error:`, error);
    }
  }

  async resetNodeColor(nodeId: number): Promise<void> {
    try {
      const treeIndex = await this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
      this.nodeColors.delete(treeIndex);
    } catch (error) {
      console.error(`Cannot reset color of ${nodeId} because of error:`, error);
    }
  }

  selectNode(_nodeId: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  deselectNode(_nodeId: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  deselectAllNodes(): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  showNode(_nodeId: number): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  showAllNodes(): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  hideAllNodes(_makeGray?: boolean): void {
    throw new NotSupportedInMigrationWrapperError();
  }
  hideNode(_nodeId: number, _makeGray?: boolean): void {
    throw new NotSupportedInMigrationWrapperError();
  }

  tryGetNodeId(treeIndex: number): number | undefined {
    return this.nodeIdAndTreeIndexMaps.getNodeId(treeIndex);
  }

  private setNodeColorByTreeIndex(treeIndex: number, r: number, g: number, b: number) {
    this.nodeColors.set(treeIndex, [r, g, b, 255]);
    this.cadNode.requestNodeUpdate([treeIndex]);
  }
}

export async function createCognite3DModel(
  modelId: number,
  revisionId: number,
  client: CogniteClient
): Promise<Cognite3DModel> {
  const model = await loadCadModelFromCdf(client, revisionId);
  return new Cognite3DModel(modelId, revisionId, model, client);
}
