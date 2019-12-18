/*!
 * Copyright 2019 Cognite AS
 */
import * as THREE from 'three';
import { SectorMetadata, SectorModelTransformation } from '../../../models/sector/types';
import { Box3 } from '../../../utils/Box3';
import { vec3, mat4 } from 'gl-matrix';
import { determineSectors, determineSectorsQuality } from '../../../models/sector/determineSectors';
import { expectSetEqual } from '../../expects';
import { toThreeMatrix4, fromThreeMatrix, fromThreeVector3 } from '../../../views/threejs/utilities';
import { traverseDepthFirst } from '../../../utils/traversal';
import { SectorNode } from '../../..';

function createSceneFromRoot(root: SectorMetadata) {
  const sectors = new Map<number, SectorMetadata>();
  traverseDepthFirst(root, sector => {
    sectors.set(sector.id, sector);
    return true;
  });
  return {
    root,
    sectors
  };
}

function sectorNodeFromTreeNode(node: TreeNode, parent?: SectorMetadata): SectorMetadata {
  const result = {
    id: node.id,
    path: '',
    bounds: new Box3([]),
    parent,
    children: new Array<SectorMetadata>()
  };
  result.children = node.children.map(x => sectorNodeFromTreeNode(x, result));
  return result;
}

interface TreeNode {
  id: number;
  children: TreeNode[];
}

describe('determine sector quality', () => {
  const treeRoot: TreeNode = {
    id: 1,
    children: [
      {
        id: 2,
        children: [
          {
            id: 3,
            children: []
          },
          {
            id: 4,
            children: []
          }
        ]
      },
      {
        id: 5,
        children: []
      },
      {
        id: 6,
        children: [
          {
            id: 7,
            children: []
          },
          {
            id: 8,
            children: []
          }
        ]
      }
    ]
  };

  const root: SectorMetadata = sectorNodeFromTreeNode(treeRoot);
  const scene = createSceneFromRoot(root);

  test('no detailed gives root as simple', () => {
    const detailed: number[] = [];
    const sectors = determineSectorsQuality(scene, new Set(detailed));
    expectSetEqual(sectors.simple, [1]);
    expectSetEqual(sectors.detailed, []);
  });

  test('root detailed makes children simple', () => {
    const detailed: number[] = [1];
    const sectors = determineSectorsQuality(scene, new Set(detailed));
    expectSetEqual(sectors.simple, [2, 5, 6]);
    expectSetEqual(sectors.detailed, [1]);
  });

  test('leaf node makes all parents detailed', () => {
    const detailed: number[] = [8];
    const sectors = determineSectorsQuality(scene, new Set(detailed));
    expectSetEqual(sectors.simple, [2, 5, 7]);
    expectSetEqual(sectors.detailed, [1, 6, 8]);
  });

  test('lone node leaves other branches simple', () => {
    const detailed: number[] = [5];
    const sectors = determineSectorsQuality(scene, new Set(detailed));
    expectSetEqual(sectors.simple, [2, 6]);
    expectSetEqual(sectors.detailed, [1, 5]);
  });

  test('detailed at different levels', () => {
    const detailed: number[] = [2, 7];
    const sectors = determineSectorsQuality(scene, new Set(detailed));
    expectSetEqual(sectors.simple, [3, 4, 5, 8]);
    expectSetEqual(sectors.detailed, [1, 2, 6, 7]);
  });

  test('all detailed', () => {
    const detailed: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
    const sectors = determineSectorsQuality(scene, new Set(detailed));
    expectSetEqual(sectors.simple, []);
    expectSetEqual(sectors.detailed, [1, 2, 3, 4, 5, 6, 7, 8]);
  });
});
