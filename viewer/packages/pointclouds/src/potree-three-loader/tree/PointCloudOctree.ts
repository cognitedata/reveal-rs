/*!
 * Copyright 2022 Cognite AS
 */
import { Box3, Camera, Object3D, Points, Ray, Sphere, Vector3, WebGLRenderer } from 'three';
import { DEFAULT_MIN_NODE_PIXEL_SIZE } from '../rendering/constants';
import { PointCloudMaterial, PointSizeType } from '../rendering';
import { IPointCloudTreeGeometry } from '../geometry/IPointCloudTreeGeometry';
import { IPointCloudTreeGeometryNode } from '../geometry/IPointCloudTreeGeometryNode';
import { PointCloudOctreeNode } from './PointCloudOctreeNode';
import { PickParams, PointCloudOctreePicker } from './PointCloudOctreePicker';
import { PointCloudTree } from './PointCloudTree';
import { PickPoint } from '../types/types';
import { IPotree } from '../types/IPotree';
import { IPointCloudTreeNodeBase } from './IPointCloudTreeNodeBase';
import { IPointCloudTreeNode } from './IPointCloudTreeNode';
import { computeTransformedBoundingBox } from '../utils/bounds';

export class PointCloudOctree extends PointCloudTree {
  potree: IPotree;
  disposed: boolean = false;
  pcoGeometry: IPointCloudTreeGeometry;
  boundingBox: Box3;
  boundingSphere: Sphere;
  material: PointCloudMaterial;
  level: number = 0;
  maxLevel: number = Infinity;
  /**
   * The minimum radius of a node's bounding sphere on the screen in order to be displayed.
   */
  minNodePixelSize: number = DEFAULT_MIN_NODE_PIXEL_SIZE;
  root: IPointCloudTreeNodeBase | undefined = undefined;
  boundingBoxNodes: Object3D[] = [];
  visibleNodes: IPointCloudTreeNode[] = [];
  visibleGeometry: IPointCloudTreeGeometryNode[] = [];
  numVisiblePoints: number = 0;
  showBoundingBox: boolean = false;
  private readonly visibleBounds: Box3 = new Box3();
  private picker: PointCloudOctreePicker | undefined;

  constructor(potree: IPotree, pcoGeometry: IPointCloudTreeGeometry, material?: PointCloudMaterial) {
    super();

    this.name = '';
    this.potree = potree;
    this.root = pcoGeometry.root;
    this.pcoGeometry = pcoGeometry;
    this.boundingBox = pcoGeometry.boundingBox;
    this.boundingSphere = this.boundingBox.getBoundingSphere(new Sphere());

    this.position.copy(pcoGeometry.offset);
    this.updateMatrix();

    this.material = material || new PointCloudMaterial();
    this.initMaterial(this.material);
  }

  private initMaterial(material: PointCloudMaterial): void {
    this.updateMatrixWorld(true);

    const { min, max } = computeTransformedBoundingBox(
      this.pcoGeometry.tightBoundingBox || this.getBoundingBoxWorld(),
      this.matrixWorld
    );

    const bWidth = max.z - min.z;
    material.heightMin = min.z - 0.2 * bWidth;
    material.heightMax = max.z + 0.2 * bWidth;
  }

  dispose(): void {
    if (this.root) {
      this.root.dispose();
    }

    this.pcoGeometry.root?.traverse(n => this.potree.lru.remove(n));
    this.pcoGeometry.dispose();
    this.material.dispose();

    this.visibleNodes = [];
    this.visibleGeometry = [];

    if (this.picker) {
      this.picker.dispose();
      this.picker = undefined;
    }

    this.disposed = true;
  }

  get pointSizeType(): PointSizeType {
    return this.material.pointSizeType;
  }

  set pointSizeType(value: PointSizeType) {
    this.material.pointSizeType = value;
  }

  toTreeNode(geometryNode: IPointCloudTreeGeometryNode, parent?: IPointCloudTreeNode | null): IPointCloudTreeNode {
    const points = new Points(geometryNode.geometry, this.material);
    const node = new PointCloudOctreeNode(geometryNode, points);
    points.name = geometryNode.name;
    points.position.copy(geometryNode.boundingBox.min);
    points.frustumCulled = false;
    points.onBeforeRender = PointCloudMaterial.makeOnBeforeRender(this, node);

    if (parent) {
      parent.sceneNode.add(points);
      parent.children[geometryNode.index] = node;

      geometryNode.oneTimeDisposeHandlers.push(() => {
        node.disposeSceneNode();
        parent.sceneNode.remove(node.sceneNode);
        // Replace the tree node (rendered and in the GPU) with the geometry node.
        parent.children[geometryNode.index] = geometryNode;
      });
    } else {
      this.root = node;
      this.add(points);
    }

    return node;
  }

  updateVisibleBounds(): void {
    const bounds = this.visibleBounds;
    bounds.min.set(Infinity, Infinity, Infinity);
    bounds.max.set(-Infinity, -Infinity, -Infinity);

    for (const node of this.visibleNodes) {
      if (node.isLeafNode) {
        bounds.expandByPoint(node.boundingBox.min);
        bounds.expandByPoint(node.boundingBox.max);
      }
    }
  }

  updateBoundingBoxes(): void {
    if (!this.showBoundingBox || !this.parent) {
      return;
    }

    let bbRoot: any = this.parent.getObjectByName('bbroot');
    if (!bbRoot) {
      bbRoot = new Object3D();
      bbRoot.name = 'bbroot';
      this.parent.add(bbRoot);
    }

    const visibleBoxes: (Object3D | null)[] = [];
    for (const node of this.visibleNodes) {
      if (node.boundingBoxNode !== undefined && node.isLeafNode) {
        visibleBoxes.push(node.boundingBoxNode);
      }
    }

    bbRoot.children = visibleBoxes;
  }

  updateMatrixWorld(force: boolean): void {
    if (this.matrixAutoUpdate === true) {
      this.updateMatrix();
    }

    if (this.matrixWorldNeedsUpdate === true || force === true) {
      if (!this.parent) {
        this.matrixWorld.copy(this.matrix);
      } else {
        this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
      }

      this.matrixWorldNeedsUpdate = false;

      force = true;
    }
  }

  hideDescendants(object: Object3D): void {
    const toHide: Object3D[] = [];
    addVisibleChildren(object);

    while (toHide.length > 0) {
      const objToHide = toHide.shift()!;
      objToHide.visible = false;
      addVisibleChildren(objToHide);
    }

    function addVisibleChildren(obj: Object3D) {
      for (const child of obj.children) {
        if (child.visible) {
          toHide.push(child);
        }
      }
    }
  }

  moveToOrigin(): void {
    this.position.set(0, 0, 0); // Reset, then the matrix will be updated in getBoundingBoxWorld()
    this.position.set(0, 0, 0).sub(this.getBoundingBoxWorld().getCenter(new Vector3()));
  }

  moveToGroundPlane(): void {
    this.position.y += -this.getBoundingBoxWorld().min.y;
  }

  getBoundingBoxWorld(): Box3 {
    this.updateMatrixWorld(true);
    return computeTransformedBoundingBox(this.boundingBox, this.matrixWorld);
  }

  getVisibleExtent(): Box3 {
    return this.visibleBounds.applyMatrix4(this.matrixWorld);
  }

  pick(renderer: WebGLRenderer, camera: Camera, ray: Ray, params: Partial<PickParams> = {}): PickPoint | null {
    this.picker = this.picker || new PointCloudOctreePicker();
    return this.picker.pick(renderer, camera, ray, [this], params);
  }

  get progress(): number {
    return this.visibleGeometry.length === 0 ? 0 : this.visibleNodes.length / this.visibleGeometry.length;
  }
}
