/*!
 * Copyright 2022 Cognite AS
 */

import { Vec3WithIndex } from '../styling/shapes/linalg';

import * as THREE from 'three';
import { OctreeNode } from './OctreeNode';

export class PointOctree {
  private _root: OctreeNode;

  constructor(points: Float64Array, boundingBox: THREE.Box3, pointOffset: THREE.Vector3) {
    const pointArray = new Array<Vec3WithIndex>(points.length / 3);
    for (let i = 0; i < points.length / 3; i++) {
      pointArray[i] = [points[3 * i + 0], // + pointOffset.x,
                       points[3 * i + 1], // + pointOffset.y,
                       points[3 * i + 2], // + pointOffset.z,
                       i];
    }

    this._root = new OctreeNode(pointArray, boundingBox);
  }

  getPointsInBox(box: THREE.Box3): Vec3WithIndex[] {
    const list: Vec3WithIndex[] = [];

    this._root.getPointsInBox(box, list);

    return list;
  }

  get root(): OctreeNode {
    return this._root;
  }
};
