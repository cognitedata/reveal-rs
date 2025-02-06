/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { PopulateIndexSetFromPagedResponseHelper } from './PopulateIndexSetFromPagedResponseHelper';
import { NodeCollection } from './NodeCollection';
import { SerializedNodeCollection } from './SerializedNodeCollection';
import { EmptyAreaCollection } from './prioritized/EmptyAreaCollection';
import { AreaCollection } from './prioritized/AreaCollection';

import { IndexSet, NumericRange } from '@reveal/utilities';

import { AssetMapping3D, CogniteClient } from '@cognite/sdk';

import cloneDeep from 'lodash/cloneDeep';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';

/**
 * Represents a set of nodes associated with an [asset in Cognite Fusion]{@link https://docs.cognite.com/api/v1/#tag/Assets}
 * linked to the 3D model using [asset mappings]{@link https://docs.cognite.com/api/v1/#tag/3D-Asset-Mapping}. A node
 * is considered to be part of an asset if it has a direct asset mapping or if one of its ancestors has an asset mapping
 * to the asset.
 */
export class AssetNodeCollection extends NodeCollection {
  public static readonly classToken = 'AssetNodeCollection';

  private readonly _client: CogniteClient;
  private _indexSet = new IndexSet();
  private _areas: AreaCollection = EmptyAreaCollection.instance();
  private readonly _modelMetadataProvider: CdfModelNodeCollectionDataProvider;
  private _fetchResultHelper: PopulateIndexSetFromPagedResponseHelper<AssetMapping3D> | undefined;
  private _filter: { assetId?: number; boundingBox?: THREE.Box3 } | undefined;

  constructor(client: CogniteClient, modelMetadataProvider: CdfModelNodeCollectionDataProvider) {
    super(AssetNodeCollection.classToken);
    this._client = client;
    this._modelMetadataProvider = modelMetadataProvider;
    this._fetchResultHelper = undefined;
  }

  get isLoading(): boolean {
    return this._fetchResultHelper !== undefined && this._fetchResultHelper.isLoading;
  }

  /**
   * Updates the node collection to hold nodes associated with the asset given, or
   * assets within the bounding box or all assets associated with the 3D model.
   * @param filter
   * @param filter.assetId      ID of a single [asset]{@link https://docs.cognite.com/dev/concepts/resource_types/assets.html} (optional)
   * @param filter.boundingBox  When provided, only assets within the provided bounds will be included in the filter.
   */
  async executeFilter(filter: { assetId?: number; boundingBox?: THREE.Box3 }): Promise<void> {
    const model = this._modelMetadataProvider;

    if (this._fetchResultHelper !== undefined) {
      // Interrupt any ongoing operation to avoid fetching results unnecessary
      this._fetchResultHelper.interrupt();
    }
    const fetchResultHelper = new PopulateIndexSetFromPagedResponseHelper<AssetMapping3D>(
      assetMappings => assetMappings.map(mapping => new NumericRange(mapping.treeIndex, mapping.subtreeSize)),
      mappings => this.fetchBoundingBoxesForAssetMappings(mappings),
      () => this.notifyChanged()
    );
    this._fetchResultHelper = fetchResultHelper;

    const totalInverseModelTransform = model
      .getModelTransformation()
      .clone()
      .multiply(model.getCdfToDefaultModelTransformation())
      .invert();

    function mapBoundingBoxToCdf(box?: THREE.Box3) {
      if (box === undefined) {
        return undefined;
      }

      const result = new THREE.Box3().copy(box);
      result.applyMatrix4(totalInverseModelTransform);
      return { min: [result.min.x, result.min.y, result.min.z], max: [result.max.x, result.max.y, result.max.z] };
    }

    const filterQuery = {
      assetId: filter.assetId,
      intersectsBoundingBox: mapBoundingBoxToCdf(filter.boundingBox),
      limit: 1000,
    };

    this._indexSet = fetchResultHelper.indexSet;
    this._areas = fetchResultHelper.areas;

    this._filter = filter;

    const request = this._client.assetMappings3D.list(model.modelId, model.revisionId, filterQuery);
    const completed = await fetchResultHelper.pageResults(request);

    if (completed) {
      // Completed without being interrupted
      this._fetchResultHelper = undefined;
    }
  }

  private async fetchBoundingBoxesForAssetMappings(assetMappings: AssetMapping3D[]) {
    if (assetMappings.length === 0) {
      return [];
    }

    const nodeList = await this._client.revisions3D.retrieve3DNodes(
      this._modelMetadataProvider.modelId,
      this._modelMetadataProvider.revisionId,
      assetMappings.map(mapping => {
        return { id: mapping.nodeId };
      })
    );

    const totalModelTransformation = this._modelMetadataProvider
      .getModelTransformation()
      .clone()
      .multiply(this._modelMetadataProvider.getCdfToDefaultModelTransformation());

    const boundingBoxes = nodeList
      .filter(node => node.boundingBox)
      .map(node => {
        const bmin = node.boundingBox!.min;
        const bmax = node.boundingBox!.max;
        const bounds = new THREE.Box3().setFromArray([bmin[0], bmin[1], bmin[2], bmax[0], bmax[1], bmax[2]]);
        bounds.applyMatrix4(totalModelTransformation);
        return bounds;
      });

    return boundingBoxes;
  }

  getFilter(): { assetId?: number | undefined; boundingBox?: THREE.Box3 | undefined } | undefined {
    return this._filter;
  }

  clear(): void {
    if (this._fetchResultHelper !== undefined) {
      this._fetchResultHelper.interrupt();
    }
    this._areas = EmptyAreaCollection.instance();
    this._indexSet.clear();
  }

  getIndexSet(): IndexSet {
    return this._indexSet;
  }

  getAreas(): AreaCollection {
    return this._areas;
  }

  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: cloneDeep(this._filter)
    };
  }
}
