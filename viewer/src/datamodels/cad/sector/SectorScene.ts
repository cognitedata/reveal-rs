/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { vec3 } from 'gl-matrix';
import { Box3 } from '../../../utilities/Box3';
import { traverseDepthFirst } from '../../../utilities/objectTraversal';
import { toThreeJsBox3 } from '../../../utilities/threeConverters';
import { SectorMetadata, SectorScene } from './types';
import skmeans from 'skmeans';

export class SectorSceneImpl implements SectorScene {
  static createFromRootSector(version: number, maxTreeIndex: number, unit: string, root: SectorMetadata): SectorScene {
    const sectorsById: Map<number, SectorMetadata> = new Map();
    traverseDepthFirst(root, x => {
      sectorsById.set(x.id, x);
      return true;
    });
    return new SectorSceneImpl(version, maxTreeIndex, unit, root, sectorsById);
  }

  readonly version: number;
  readonly maxTreeIndex: number;
  readonly root: SectorMetadata;
  readonly unit: string;
  private readonly sectors: Map<number, SectorMetadata>;

  constructor(
    version: number,
    maxTreeIndex: number,
    unit: string,
    root: SectorMetadata,
    sectorsById: Map<number, SectorMetadata>
  ) {
    this.version = version;
    this.maxTreeIndex = maxTreeIndex;
    this.root = root;
    this.sectors = sectorsById;
    this.unit = unit;
  }

  get sectorCount(): number {
    return this.sectors.size;
  }

  getSectorById(sectorId: number): SectorMetadata | undefined {
    return this.sectors.get(sectorId);
  }

  getAllSectors(): SectorMetadata[] {
    return [...this.sectors.values()];
  }

  getSectorsContainingPoint(p: vec3): SectorMetadata[] {
    const accepted: SectorMetadata[] = [];
    traverseDepthFirst(this.root, x => {
      if (x.bounds.containsPoint(p)) {
        accepted.push(x);
        return true;
      }
      return false;
    });
    return accepted;
  }

  getSectorsIntersectingBox(b: Box3): SectorMetadata[] {
    const accepted: SectorMetadata[] = [];
    traverseDepthFirst(this.root, x => {
      if (x.bounds.intersectsBox(b)) {
        accepted.push(x);
        return true;
      }
      return false;
    });
    return accepted;
  }

  getBoundsOfMostGeometry(): Box3 {
    if (this.root.children.length === 0) {
      return this.root.bounds;
    }
    // Determine all corners of the bboxes
    const allBounds: Box3[] = [];
    const centers: number[][] = [];
    traverseDepthFirst(this.root, x => {
      if (x.children.length === 0) {
        centers.push([...x.bounds.center]);
        allBounds.push(x.bounds);
      }
      return true;
    });

    // Cluster the corners into two groups and determine bounds of each cluster
    const clusters = skmeans(centers, 2, 'kmpp');
    const clusterCounts = [0, 0];
    const clusterBounds = [new Box3([]), new Box3([])];
    clusters.idxs.map(x => clusterCounts[x]++);
    const biggestCluster = clusterCounts[0] >= clusterCounts[1] ? 0 : 1;
    clusters.idxs.forEach((cluster, idx) => {
      clusterCounts[cluster]++;
      clusterBounds[cluster].extendByBox(allBounds[idx]);
    });

    if (clusterBounds[0].intersectsBox(clusterBounds[1])) {
      // Overlapping clusters - assume it's because the model doesn't contain junk geometry
      return Box3.mergeBoxes(clusterBounds);
    } else {
      // Create bounds of the biggest cluster - assume the smallest one is junk geometry
      return clusterBounds[biggestCluster];
    }
  }

  getSectorsIntersectingFrustum(
    projectionMatrix: THREE.Matrix4,
    inverseCameraModelMatrix: THREE.Matrix4
  ): SectorMetadata[] {
    const frustumMatrix = new THREE.Matrix4().multiplyMatrices(projectionMatrix, inverseCameraModelMatrix);
    const frustum = new THREE.Frustum().setFromProjectionMatrix(frustumMatrix);
    const bbox = new THREE.Box3();
    const accepted: SectorMetadata[] = [];
    traverseDepthFirst(this.root, x => {
      if (frustum.intersectsBox(toThreeJsBox3(bbox, x.bounds))) {
        accepted.push(x);
        return true;
      }
      return false;
    });
    return accepted;
  }
}
