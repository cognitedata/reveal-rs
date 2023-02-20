/*!
 * Copyright 2023 Cognite AS
 */

import { EventTrigger, getBox3CornerPoints } from '@reveal/utilities';
import clamp from 'lodash/clamp';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';
import { PointOctree, Node, PointOctant } from 'sparse-octree';
import {
  Vector3,
  Box3,
  WebGLRenderer,
  Camera,
  Box2,
  Matrix4,
  Vector2,
  Group,
  BoxGeometry,
  Mesh,
  MeshBasicMaterial
} from 'three';
import { Image360Icon } from '../entity/Image360Icon';

export class Image360CollectionIconsOctree {
  private _camera: Camera | undefined;
  private readonly _group: Group;
  private readonly _octree: PointOctree<Image360Icon>;
  constructor(
    icons: [Image360Icon, Vector3][],
    onRender: EventTrigger<(renderer: WebGLRenderer, camera: Camera) => void>
  ) {
    const [octree, sizes] = this.createOctreeFromPoints(icons);
    this._octree = octree;
    const viewProjectionMatrix = new Matrix4();
    this._group = new Group();
    // this._group.add(new OctreeHelper(this._octree));
    const boxes = this.createVisualizationBoxes();
    this._group.add(boxes);
    const viz = icons.map(p => p[0]);
    onRender.subscribe((_, camera) => {
      viz.forEach(p => (p.visible = false));
      this._camera = camera;
      viewProjectionMatrix.copy(this._camera.projectionMatrix).multiply(this._camera.matrixWorldInverse);
      const root = this._octree.findNodesByLevel(0)[0];
      const selectedLODs = this.selectGroupingLOD(root, 0.025, viewProjectionMatrix);
      boxes.children.forEach(p => (p.visible = false));
      let c = 0;
      selectedLODs.forEach(node => {
        if (node instanceof PointOctant<Image360Icon> && node.data !== null) {
          const icons = node.data.data as Image360Icon[];
          icons.forEach(p => (p.visible = true));
          return;
        }

        const box = boxes.children[c];
        const nodeCenter = sizes.get(node)!;
        box.position.copy(nodeCenter);
        box.visible = true;
        c++;
      });
    });
  }

  public getVisualizationHelper(): Group {
    return this._group;
  }

  private createVisualizationBoxes(): Group {
    const geometry = new BoxGeometry(4, 4, 4);
    const material = new MeshBasicMaterial({ color: 'red' });
    const boxGroup = new Group();
    for (let i = 0; i < 1000; i++) {
      boxGroup.add(new Mesh(geometry, material));
    }
    return boxGroup;
  }

  private selectGroupingLOD(root: Node, threshold: number, viewProjectionMatrix: Matrix4): Set<Node> {
    const nodesToProcess: Node[] = [];
    const selectedNodes = new Set<Node>();

    if (root.children === undefined || root.children.length === 0) {
      selectedNodes.add(root);
      return selectedNodes;
    }

    nodesToProcess.push(root);

    while (nodesToProcess.length > 0) {
      const currentNode = nodesToProcess.shift()!;
      if (currentNode.children === null || currentNode.children === undefined || currentNode.children.length === 0) {
        selectedNodes.add(currentNode);
        continue;
      }

      currentNode.children.forEach(node => {
        const rootProjectedBounds = this.getApproximateBoxProjectedBounds(
          new Box3(node.min, node.max),
          viewProjectionMatrix
        );
        const screenArea = this.getScreenArea(rootProjectedBounds);
        if (screenArea >= threshold) {
          nodesToProcess.push(node);
        } else {
          selectedNodes.add(currentNode);
        }
      });
    }
    return selectedNodes;
  }

  private createOctreeFromPoints(icons: [Image360Icon, Vector3][]): [PointOctree<Image360Icon>, Map<Node, Vector3>] {
    const points = icons.map(p => p[1]);
    const [min, max] = getPointExtents(points);
    const octree = new PointOctree<Image360Icon>(min, max, 0, 2);
    icons.forEach(p => octree.set(p[1], p[0]));
    const nodeSizes = this.filterEmpty(octree);
    return [octree, nodeSizes];

    function getPointExtents(points: Vector3[]) {
      const box = new Box3().setFromPoints(points);
      return [box.min, box.max];
    }
  }

  private filterEmpty<T>(octree: PointOctree<T>) {
    const treeDepth = octree.getDepth();
    const purgeNodeSet = new Set<Node>();

    const nodeCenters = new Map<Node, Vector3>();

    for (let i = treeDepth; i >= 0; i--) {
      const level = octree.findNodesByLevel(i);
      level.forEach(node => {
        if (node.children !== null && node.children !== undefined) {
          const newChildren = node.children.filter(child => !purgeNodeSet.has(child));
          node.children = newChildren.length > 0 ? newChildren : undefined;
        }

        if (node.children === null || node.children === undefined) {
          if (node instanceof PointOctant) {
            if (node.data === null) {
              purgeNodeSet.add(node);
            } else {
              const points = node.data.points;
              const center = points
                .reduce((result, currentValue) => result.add(currentValue), new Vector3())
                .divideScalar(points.length);
              nodeCenters.set(node, center);
            }
          }
        } else {
          const points = node.children.map(node => nodeCenters.get(node)!);
          const center = points
            .reduce((result, currentValue) => result.add(currentValue), new Vector3())
            .divideScalar(points.length);
          nodeCenters.set(node, center);
        }
      });
    }

    return nodeCenters;
  }

  private getScreenArea(projectedBounds: Box2): number {
    const clampedMinX = clamp(projectedBounds.min.x * 0.5 + 0.5, 0, 1);
    const clampedMinY = clamp(projectedBounds.min.y * 0.5 + 0.5, 0, 1);

    const clampedMaxX = clamp(projectedBounds.max.x * 0.5 + 0.5, 0, 1);
    const clampedMaxY = clamp(projectedBounds.max.y * 0.5 + 0.5, 0, 1);

    return (clampedMaxX - clampedMinX) * (clampedMaxY - clampedMinY);
  }

  private getApproximateBoxProjectedBounds(box: Box3, viewProjectionMatrix: Matrix4): Box2 {
    const corners = getBox3CornerPoints(box);

    corners.forEach(corner => corner.applyMatrix4(viewProjectionMatrix));

    const xMin = minBy(corners, corner => corner.x / corner.w)!;
    const yMin = minBy(corners, corner => corner.y / corner.w)!;

    const xMax = maxBy(corners, corner => corner.x / corner.w)!;
    const yMax = maxBy(corners, corner => corner.y / corner.w)!;

    return new Box2(new Vector2(xMin.x / xMin.w, yMin.y / yMin.w), new Vector2(xMax.x / xMax.w, yMax.y / yMax.w));
  }
}
