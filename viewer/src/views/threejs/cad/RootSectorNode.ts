/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { buildScene } from './buildScene';
import { SectorNode } from './SectorNode';
import { toThreeMatrix4 } from '../utilities';
import { CadModel } from '../../../models/cad/CadModel';
import { Shading } from './shading';
import { MemoryRequestCache } from '../../../cache/MemoryRequestCache';
import { ParsedSector } from '../../../data/model/ParsedSector';
import { LevelOfDetail } from '../../../data/model/LevelOfDetail';
import { consumeSectorSimple } from './consumeSectorSimple';
import { consumeSectorDetailed } from './consumeSectorDetailed';
import { SectorQuads, Sector } from '../../../models/cad/types';

function hashIdAndLevelOfDetail(id: number, levelOfDetail: LevelOfDetail) {
  return `${id},${levelOfDetail}`;
}

export class RootSectorNode extends SectorNode {
  public readonly sectorNodeMap: Map<number, SectorNode>;
  public readonly shading: Shading;

  private readonly consumeSectorCache: MemoryRequestCache<string, ParsedSector, THREE.Group>;

  constructor(model: CadModel, shading: Shading) {
    super(0, '/');
    const { scene, modelTransformation } = model;
    this.applyMatrix4(toThreeMatrix4(modelTransformation.modelMatrix));
    this.sectorNodeMap = new Map();
    this.shading = shading;

    this.consumeSectorCache = new MemoryRequestCache<string, ParsedSector, THREE.Group>(
      (_hash: string, sector: ParsedSector) => this.consumeImpl(sector.id, sector)
    );

    buildScene(scene.root, this, this.sectorNodeMap);
  }

  public async consumeSector(id: number, sector: ParsedSector) {
    const { levelOfDetail, metadata } = sector;
    const group = this.consumeSectorCache.request(hashIdAndLevelOfDetail(id, levelOfDetail), sector);

    return {
      id,
      levelOfDetail,
      metadata,
      group
    };
  }

  private consumeImpl(id: number, sector: ParsedSector) {
    const { levelOfDetail, metadata, data } = sector;
    const group = ((): THREE.Group => {
      switch (levelOfDetail) {
        case LevelOfDetail.Discarded: {
          return new THREE.Group();
        }
        case LevelOfDetail.Simple: {
          return consumeSectorSimple(id, data as SectorQuads, metadata, this.shading.materials);
        }
        case LevelOfDetail.Detailed: {
          return consumeSectorDetailed(id, data as Sector, metadata, this.shading.materials);
        }
        default:
          throw new Error(`Unsupported level of detail ${sector.levelOfDetail}`);
      }
    })();
    return group;
  }
}
