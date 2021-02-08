/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { CogniteClient, CogniteInternalId } from '@cognite/sdk';

import { NodeIdAndTreeIndexMaps } from './NodeIdAndTreeIndexMaps';
import { CameraConfiguration } from './types';
import { CogniteModelBase } from './CogniteModelBase';
import { NotSupportedInMigrationWrapperError } from './NotSupportedInMigrationWrapperError';
import { NumericRange, Box3, toThreeJsBox3 } from '../../utilities';
import { CadRenderHints, CadNode } from '../../experimental';
import { trackError } from '../../utilities/metrics';

import { SupportedModelTypes, CadLoadingHints, CadModelMetadata } from '../types';
import { callActionWithIndicesAsync } from '../../utilities/callActionWithIndicesAsync';
import { CogniteClientNodeIdAndTreeIndexMapper } from '../../utilities/networking/CogniteClientNodeIdAndTreeIndexMapper';
import { NodeStyleProvider } from '../../datamodels/cad/styling/NodeStyleProvider';
import { NodeSet } from '../../datamodels/cad/styling';
import { NodeAppearance } from '../../datamodels/cad';

/**
 * Represents a single 3D CAD model loaded from CDF.
 * @noInheritDoc
 * @module @cognite/reveal
 */
export class Cognite3DModel extends THREE.Object3D implements CogniteModelBase {
  public readonly type: SupportedModelTypes = 'cad';

  get nodeApperanceProvider(): NodeStyleProvider {
    return this.cadNode.nodeAppearanceProvider;
  }

  /**
   * Get settings used for rendering.
   */
  get renderHints(): CadRenderHints {
    return this.cadNode.renderHints;
  }

  /**
   * Specify settings for rendering.
   */
  // TODO 2021-01-19 larsmoa: Remove rendering hints per model
  set renderHints(hints: CadRenderHints) {
    this.cadNode.renderHints = hints;
  }

  /**
   * Get settings used for loading pipeline.
   */
  // TODO 2021-01-19 larsmoa: Remove loading hints per model
  get loadingHints(): CadLoadingHints {
    return this.cadNode.loadingHints;
  }

  /**
   * Specify settings for loading pipeline.
   */
  set loadingHints(hints: CadLoadingHints) {
    this.cadNode.loadingHints = hints;
  }

  /**
   * The CDF model ID of the model.
   */
  readonly modelId: number;
  /**
   * The CDF revision ID of the model.
   */
  readonly revisionId: number;
  /** @internal */
  readonly cadNode: CadNode;

  private readonly cadModel: CadModelMetadata;
  private readonly nodeTransforms: Map<number, THREE.Matrix4>;

  private readonly client: CogniteClient;
  private readonly nodeIdAndTreeIndexMaps: NodeIdAndTreeIndexMaps;

  /**
   * @param modelId
   * @param revisionId
   * @param cadNode
   * @param client
   * @internal
   */
  constructor(modelId: number, revisionId: number, cadNode: CadNode, client: CogniteClient) {
    super();
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.cadModel = cadNode.cadModelMetadata;
    this.client = client;
    this.nodeTransforms = new Map();
    const indexMapper = new CogniteClientNodeIdAndTreeIndexMapper(client);
    this.nodeIdAndTreeIndexMaps = new NodeIdAndTreeIndexMaps(modelId, revisionId, client, indexMapper);

    this.cadNode = cadNode;

    this.add(this.cadNode);
  }

  /**
   * Sets the default appearance for nodes that are not styled using
   * {@link addStyledNodesSet}. Updating the default style can be an
   * expensive operation, so use with care.
   *
   * @param appearance  Default node appereance. Note that this apperance cannot
   * have a transform ({@link NodeAppearance.worldTransform}).
   */
  setDefaultNodeAppearance(appearance: NodeAppearance) {
    this.cadNode.defaultNodeAppearance = appearance;
  }

  /**
   * Gets the default appearance for nodes that are not styled using
   * {@link addStyledNodesSet}.
   */
  getDefaultNodeAppearance(): NodeAppearance {
    return this.cadNode.defaultNodeAppearance;
  }

  /**
   * Customizes rendering style for a set of nodes, e.g. to highlight, hide
   * or color code a set of 3D objects. This allows for custom look and feel
   * of the 3D model which is useful to highlight certain parts or to
   * color code the 3D model based on information (e.g. coloring the 3D model
   * by construction status).
   *
   * The {@link NodeSet} can be updated dynamically and the rendered nodes will be
   * updated automatically as the styling changes. The appearance of the style nodes
   * cannot be changed.
   *
   * Nodes are expected to only be in one style set, and the behaviour is undefined
   * when a node is part of two different sets.
   *
   * @param nodes Dynamic set of nodes to apply the provided appearance to.
   * @param appearance Apperance to style the provided set with.
   *
   * @example
   * ```js
   * model.setDefaultNodeApperance({ rendererGhosted: true });
   * const visibleSet = new FixedNodeSet(someTreeIndices);
   * model.addStyledSet(visibleSet, { rendererGhosted: false });
   * ```
   */
  addStyledNodesSet(nodes: NodeSet, appearance: NodeAppearance) {
    this.nodeApperanceProvider.addStyledSet(nodes, appearance);
  }

  /**
   * Removes styling for previously added set, resetting the style to the default.
   * @param nodes   Node set previously added using {@see addStyledSet}.
   */
  removeStyledNodeSet(nodes: NodeSet) {
    this.nodeApperanceProvider.removedStyledSet(nodes);
  }
  /**
   * Maps a position retrieved from the CDF API (e.g. 3D node information) to
   * coordinates in "ThreeJS model space". This is necessary because CDF has a right-handed
   * Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.
   * @param p     The CDF coordinate to transform.
   * @param out   Optional preallocated buffer for storing the result. May be `p`.
   * @returns Transformed position.
   */
  mapFromCdfToModelCoordinates(p: THREE.Vector3, out?: THREE.Vector3): THREE.Vector3 {
    out = out !== undefined ? out : new THREE.Vector3();
    if (out !== p) {
      out.copy(p);
    }
    out.applyMatrix4(this.cadModel.modelMatrix);
    return out;
  }

  /**
   * Maps from a 3D position in "ThreeJS model space" (e.g. a ray intersection coordinate)
   * to coordinates in "CDF space". This is necessary because CDF has a right-handed
   * Z-up coordinate system while ThreeJS uses a right-hand Y-up coordinate system.
   * @param p       The ThreeJS coordinate to transform.
   * @param out     Optional preallocated buffer for storing the result. May be `p`.
   * @returns Transformed position.
   */
  mapPositionFromModelToCdfCoordinates(p: THREE.Vector3, out?: THREE.Vector3): THREE.Vector3 {
    out = out !== undefined ? out : new THREE.Vector3();
    if (out !== p) {
      out.copy(p);
    }
    out.applyMatrix4(this.cadModel.inverseModelMatrix);
    return out;
  }

  /**
   * Cleans up used resources.
   */
  dispose() {
    this.children = [];
  }

  /**
   * @param _nodeId
   * @param _subtreeSize
   * @deprecated
   * @throws NotSupportedInMigrationWrapperError.
   */
  getSubtreeNodeIds(_nodeId: number, _subtreeSize?: number): Promise<number[]> {
    throw new NotSupportedInMigrationWrapperError('Use getSubtreeTreeIndices(treeIndex: number)');
  }

  /**
   * Get array of subtree tree indices.
   * @param treeIndex
   */
  async getSubtreeTreeIndices(treeIndex: number): Promise<number[]> {
    const treeIndices = await this.determineTreeIndices(treeIndex, true);
    return treeIndices.toArray();
  }

  /**
   * @param _nodeId
   * @param _box
   * @deprecated Use {@link Cognite3DModel.getModelBoundingBox} or {@link Cognite3DModel.getBoundingBoxByTreeIndex}.
   * @throws NotSupportedInMigrationWrapperError.
   */
  getBoundingBox(_nodeId?: number, _box?: THREE.Box3): THREE.Box3 {
    throw new NotSupportedInMigrationWrapperError(
      'Use getBoundingboxByTreeIndex(treeIndex: number), getBoundingBoxByNodeId(nodeId: number) or getModelBoundingBox()'
    );
  }

  /**
   * Determines the full bounding box of the model.
   * @param outBbox Optional. Used to write result to.
   * @param restrictToMostGeometry Optional. When true, returned bounds are restricted to
   * where most of the geometry is located. This is useful for models that have junk geometry
   * located far from the "main" model. Added in version 1.3.0.
   * @returns Model bounding box.
   * @version `restrictToMostGeometry` added in 1.3.0
   *
   * @example
   * ```js
   * const box = new THREE.Box3()
   * model.getModelBoundingBox(box);
   * // box now has the bounding box
   * ```
   * ```js
   * // the following code does the same
   * const box = model.getModelBoundingBox();
   * ```
   */
  getModelBoundingBox(outBbox?: THREE.Box3, restrictToMostGeometry?: boolean): THREE.Box3 {
    const bounds: Box3 = restrictToMostGeometry
      ? this.cadModel.scene.getBoundsOfMostGeometry()
      : this.cadModel.scene.root.bounds;

    outBbox = outBbox || new THREE.Box3();
    toThreeJsBox3(outBbox, bounds);
    outBbox.applyMatrix4(this.cadModel.modelMatrix);
    return outBbox;
  }

  /**
   * Retrieves the camera position and target stored for the model. Typically this
   * is used to store a good starting position for a model. Returns `undefined` if there
   * isn't any stored camera configuration for the model.
   */
  getCameraConfiguration(): CameraConfiguration | undefined {
    return this.cadModel.cameraConfiguration;
  }

  /**
   * Sets transformation matrix of the model. This overrides the current transformation.
   * @version new in 1.1.0
   * @param matrix Transformation matrix.
   */
  setModelTransformation(matrix: THREE.Matrix4): void {
    this.cadNode.setModelTransformation(matrix);
  }

  /**
   * Gets transformation matrix of the model.
   * @version new in 1.1.0
   * @param out Preallocated `THREE.Matrix4` (optional).
   */
  getModelTransformation(out?: THREE.Matrix4): THREE.Matrix4 {
    return this.cadNode.getModelTransformation(out);
  }

  /**
   * @param sector
   * @internal
   */
  updateNodeIdMaps(sector: Map<number, number>) {
    this.nodeIdAndTreeIndexMaps.updateMaps(sector);
  }

  /**
   * Fetches a bounding box from the CDF by the nodeId.
   * @param nodeId
   * @param box Optional. Used to write result to.
   * @example
   * ```js
   * const box = new THREE.Box3()
   * const nodeId = 100500;
   * await model.getBoundingBoxByNodeId(nodeId, box);
   * // box now has the bounding box
   *```
   * ```js
   * // the following code does the same
   * const box = await model.getBoundingBoxByNodeId(nodeId);
   * ```
   */
  async getBoundingBoxByNodeId(nodeId: number, box?: THREE.Box3): Promise<THREE.Box3> {
    const response = await this.client.revisions3D.retrieve3DNodes(this.modelId, this.revisionId, [{ id: nodeId }]);
    if (response.length < 1) {
      throw new Error('NodeId not found');
    }
    const boundingBox3D = response[0].boundingBox;
    if (boundingBox3D === undefined) {
      trackError(new Error(`Node ${nodeId} doesn't have a defined bounding box, returning model bounding box`), {
        moduleName: 'Cognite3DModel',
        methodName: 'getBoundingBoxByNodeId'
      });
      return this.getModelBoundingBox();
    }

    const min = boundingBox3D.min;
    const max = boundingBox3D.max;
    const result = box || new THREE.Box3();
    result.min.set(min[0], min[1], min[2]);
    result.max.set(max[0], max[1], max[2]);
    return result.applyMatrix4(this.cadModel.modelMatrix);
  }

  /**
   * Determine the bounding box of the node identified by the tree index provided. Note that this
   * function uses the CDF API to look up the bounding box.
   * @param treeIndex Tree index of the node to find bounding box for.
   * @param box Optional preallocated container to hold the bounding box.
   * @example
   * ```js
   * const box = new THREE.Box3()
   * const treeIndex = 42;
   * await model.getBoundingBoxByTreeIndex(treeIndex, box);
   * // box now has the bounding box
   *```
   * ```js
   * // the following code does the same
   * const box = await model.getBoundingBoxByTreeIndex(treeIndex);
   * ```
   */
  async getBoundingBoxByTreeIndex(treeIndex: number, box?: THREE.Box3): Promise<THREE.Box3> {
    const nodeId = await this.nodeIdAndTreeIndexMaps.getNodeId(treeIndex);
    return this.getBoundingBoxByNodeId(nodeId, box);
  }

  /**
   * @param _action
   * @deprecated Use {@link Cognite3DModel.iterateNodesByTreeIndex} instead.
   * @throws NotSupportedInMigrationWrapperError.
   */
  iterateNodes(_action: (nodeId: number, treeIndex?: number) => void): void {
    throw new NotSupportedInMigrationWrapperError('Use iterateNodesByTreeIndex(action: (treeIndex: number) => void)');
  }

  /**
   * Iterates over all nodes in the model and applies the provided action to each node (identified by tree index).
   * The passed action is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
   * applied until promise is resolved (iteration is done).
   * @param action Function that will be called with a treeIndex argument.
   * @returns Promise that is resolved once the iteration is done.
   * @example
   * ```js
   * const logIndex = (treeIndex) => console.log(treeIndex);
   * await model.iterateNodesByTreeIndex(logIndex); // 0, 1, 2, ...
   * ```
   */
  iterateNodesByTreeIndex(action: (treeIndex: number) => void): Promise<void> {
    return callActionWithIndicesAsync(0, this.cadModel.scene.maxTreeIndex, action);
  }

  /**
   * @param _nodeId
   * @param _action
   * @param _treeIndex
   * @param _subtreeSize
   * @deprecated Use {@link Cognite3DModel.iterateNodesByTreeIndex} instead.
   * @throws NotSupportedInMigrationWrapperError.
   */
  iterateSubtree(
    _nodeId: number,
    _action: (nodeId: number, treeIndex?: number) => void,
    _treeIndex?: number,
    _subtreeSize?: number
  ): Promise<boolean> {
    throw new NotSupportedInMigrationWrapperError(
      'Use iterateSubtreeByTreeIndex(treeIndex: number, action: (treeIndex: number) => void)'
    );
  }

  /**
   * Iterates over all nodes in a subtree of the model and applies the provided action to each node
   * (identified by tree index). The provided node is included in the visited set.  The passed action
   * is applied incrementally to avoid main thread blocking, meaning that the changes can be partially
   * applied until promise is resolved (iteration is done).
   * @param treeIndex Tree index of the top parent of the subtree.
   * @param action Function that will be called with a treeIndex argument.
   * @returns Promise that is resolved once the iteration is done.
   * @example
   * ```js
   * // make a subtree to be gray
   * await model.iterateNodesByTreeIndex(treeIndex => {
   *   model.setNodeColorByTreeIndex(treeIndex, 127, 127, 127);
   * });
   * ```
   */
  async iterateSubtreeByTreeIndex(treeIndex: number, action: (treeIndex: number) => void): Promise<void> {
    const treeIndices = await this.determineTreeIndices(treeIndex, true);
    return callActionWithIndicesAsync(treeIndices.from, treeIndices.toInclusive, action);
  }

  /**
   * Set override transform of the node by tree index.
   * @version new in 1.1.0
   * @param treeIndex
   * @param transform
   * @param applyToChildren
   */
  async setNodeTransformByTreeIndex(
    treeIndex: number,
    transform: THREE.Matrix4,
    applyToChildren = true
  ): Promise<number> {
    // Note! There's a lot of code duplication in this function. This is done because
    // all our efforts into trying to share code here has reduced it's performance.
    // Since performance is key for this function we've decided to duplicate code.
    if (applyToChildren) {
      const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
      for (let idx = treeIndices.from; idx <= treeIndices.toInclusive; ++idx) {
        this.nodeTransforms.set(idx, transform);
      }
      this.updateNodeStyle(treeIndices);
      return treeIndices.count;
    } else {
      this.nodeTransforms.set(treeIndex, transform);
      this.updateNodeStyle(treeIndex);
      return 1;
    }
  }

  /**
   * @private
   */
  private updateNodeStyle(_treeIndices: NumericRange | number | number[]) {
    throw new Error('Method not implemented.');
  }

  /**
   * Remove override transform of the node by tree index.
   * @version new in 1.1.0
   * @param treeIndex
   * @param applyToChildren
   */
  async resetNodeTransformByTreeIndex(treeIndex: number, applyToChildren = true): Promise<number> {
    // Note! There's a lot of code duplication in this function. This is done because
    // all our efforts into trying to share code here has reduced it's performance.
    // Since performance is key for this function we've decided to duplicate code.
    if (applyToChildren) {
      const treeIndices = await this.determineTreeIndices(treeIndex, applyToChildren);
      for (let idx = treeIndices.from; idx <= treeIndices.toInclusive; ++idx) {
        this.nodeTransforms.delete(idx);
      }
      this.updateNodeStyle(treeIndices);
      return treeIndices.count;
    } else {
      this.nodeTransforms.delete(treeIndex);
      this.updateNodeStyle(treeIndex);
      return 1;
    }
  }

  /**
   * Maps a list of Node IDs to tree indices. This function is useful when you have
   * a list of nodes, e.g. from Asset Mappings, that you want to highlight, hide,
   * color etc in the viewer.
   *
   * @param nodeIds List of node IDs to map to tree indices.
   * @returns A list of tree indices corresponing to the elements in the input.
   * @throws If an invalid/non-existant node ID is provided the function throws an error.
   */
  async mapNodeIdsToTreeIndices(nodeIds: CogniteInternalId[]): Promise<number[]> {
    return this.nodeIdAndTreeIndexMaps.getTreeIndices(nodeIds);
  }

  /**
   * Maps a single node ID to tree index. This is useful when you e.g. have a
   * node ID from an asset mapping and want to highlight the given asset using
   * {@link selectNodeByTreeIndex}. If you have multiple node IDs to map,
   * {@link mapNodeIdsToTreeIndices} is recommended for better performance.
   *
   * @param nodeId A Node ID to map to a tree index.
   * @returns TreeIndex of the provided node.
   * @throws If an invalid/non-existant node ID is provided the function throws an error.
   */
  async mapNodeIdToTreeIndex(nodeId: CogniteInternalId): Promise<number> {
    return this.nodeIdAndTreeIndexMaps.getTreeIndex(nodeId);
  }

  /**
   * Maps a list of tree indices to node IDs for use with the Cognite SDK.
   * This function is useful if you have a list of tree indices, e.g. from
   * {@link Cognite3DModel.iterateSubtreeByTreeIndex}, and want to perform
   * some operations on these nodes using the SDK.
   *
   * @param treeIndices Tree indices to map to node IDs.
   * @returns A list of node IDs corresponding to the elements of the inpu.
   * @throws If an invalid tree index is provided the function throws an error.
   */
  async mapTreeIndicesToNodeIds(treeIndices: number[]): Promise<CogniteInternalId[]> {
    return this.nodeIdAndTreeIndexMaps.getNodeIds(treeIndices);
  }

  /**
   * Maps a single tree index to node ID for use with the API. If you have multiple
   * tree indices to map, {@link mapNodeIdsToTreeIndices} is recommended for better
   * performance.
   * @param treeIndex A tree index to map to a Node ID.
   * @returns TreeIndex of the provided node.
   * @throws If an invalid/non-existant node ID is provided the function throws an error.
   */
  async mapTreeIndexToNodeId(treeIndex: number): Promise<CogniteInternalId> {
    return this.nodeIdAndTreeIndexMaps.getNodeId(treeIndex);
  }

  /** @private */
  private async determineTreeIndices(treeIndex: number, includeDescendants: boolean): Promise<NumericRange> {
    let subtreeSize = 1;
    if (includeDescendants) {
      const subtreeSizePromise = await this.nodeIdAndTreeIndexMaps.getSubtreeSize(treeIndex);
      subtreeSize = subtreeSizePromise ? subtreeSizePromise : 1;
    }
    return new NumericRange(treeIndex, subtreeSize);
  }
}
