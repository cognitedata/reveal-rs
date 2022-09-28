/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { PopulateIndexSetFromPagedResponseHelper } from './PopulateIndexSetFromPagedResponseHelper';
import { NodeCollection } from './NodeCollection';
import { CdfModelNodeCollectionDataProvider } from './CdfModelNodeCollectionDataProvider';
import { SerializedNodeCollection } from './SerializedNodeCollection';
import { EmptyAreaCollection } from './prioritized/EmptyAreaCollection';
import { AreaCollection } from './prioritized/AreaCollection';

import { IndexSet, NumericRange } from '@reveal/utilities';

import {
  Asset,
  AssetMapping3D,
  AssetMappings3DListFilter,
  CogniteClient,
  Filter3DAssetMappingsQuery
} from '@cognite/sdk';

import cloneDeep from 'lodash/cloneDeep';

/**
 * Filter that determines if a collection of {@see Asset} should be accepted or rejected.
 */
export type AssetsFilter = (candidates: Asset[]) => Promise<Asset[]>;

/**
 * Filtering options for {@see AssetNodeCollection}.
 */
export type AssetNodeCollectionFilter = {
  /**
   * When provided, only assets below this assets are included. Supports maximum 100
   * asset IDs. By default, all assets are included.
   */
  assetId?: number | number[];

  /**
   * When provided, only assets fully or partially inside this box are included.
   */
  boundingBox?: THREE.Box3;

  /**
   * When provided, only assets that pass the provided check is included in the result.
   * This can be used to filter results by properties of the respective assets, e.g.
   * labels or metadata values.
   *
   * Note that enabling this can reduce performance of the collection.
   *
   * Ignored if undefined.
   *
   * @see {@link AssetsFilterFactory} for filters for common use cases.
   */
  assetsFilter?: AssetsFilter;
};

/**
 * Represents a set of nodes associated with an [asset in Cognite Fusion]{@link https://docs.cognite.com/api/v1/#tag/Assets}
 * linked to the 3D model using [asset mappings]{@link https://docs.cognite.com/api/v1/#tag/3D-Asset-Mapping}. A node
 * is considered to be part of an asset if it has a direct asset mapping or if one of its ancestors has an asset mapping
 * to the asset.
 *
 * The collection support various filtering mechanisms, see {@link AssetNodeCollectionFilter}.
 */
export class AssetNodeCollection extends NodeCollection {
  public static readonly classToken = 'AssetNodeCollection';

  private readonly _client: CogniteClient;
  private _indexSet = new IndexSet();
  private _areas: AreaCollection = EmptyAreaCollection.instance();
  private readonly _modelMetadataProvider: CdfModelNodeCollectionDataProvider;
  private _fetchResultHelper: PopulateIndexSetFromPagedResponseHelper<AssetMapping3D> | undefined;
  private _filter: AssetNodeCollectionFilter | undefined;

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
  async executeFilter(filter: AssetNodeCollectionFilter): Promise<void> {
    if (this._fetchResultHelper !== undefined) {
      // Interrupt any ongoing operation to avoid fetching results unnecessary
      this._fetchResultHelper.interrupt();
    }
    const fetchResultHelper = new PopulateIndexSetFromPagedResponseHelper<AssetMapping3D>(
      assetMappings => assetMappings.map(mapping => new NumericRange(mapping.treeIndex, mapping.subtreeSize)),
      mappings => this.fetchBoundingBoxesForAssetMappings(mappings),
      () => this.notifyChanged()
    );
    fetchResultHelper.setFilterItemsCallback(this.buildAssetMappingsFilter(filter.assetsFilter));
    this._fetchResultHelper = fetchResultHelper;

    this._indexSet = fetchResultHelper.indexSet;
    this._areas = fetchResultHelper.areas;

    this._filter = filter;
    const request = this.executeRequestForFilter(filter);
    const completed = await fetchResultHelper.pageResults(request);

    if (completed) {
      // Completed without being interrupted
      this._fetchResultHelper = undefined;
    }
  }

  private executeRequestForFilter(filter: AssetNodeCollectionFilter) {
    const model = this._modelMetadataProvider;

    if (filter.assetId !== undefined && filter.boundingBox !== undefined && Array.isArray(filter.assetId)) {
      throw new Error(`Cannot provide both list of assets and bounds`);
    }

    function mapBoundingBoxToCdf(box?: THREE.Box3) {
      if (box === undefined) {
        return undefined;
      }

      const result = new THREE.Box3().copy(box);
      model.mapBoxFromModelToCdfCoordinates(result, result);
      return { min: [result.min.x, result.min.y, result.min.z], max: [result.max.x, result.max.y, result.max.z] };
    }

    if (filter.assetId !== undefined && Array.isArray(filter.assetId)) {
      if (filter.boundingBox !== undefined) {
        throw new Error(`Cannot provide both list of assets and bounds`);
      }
      // TODO 2022-09-12 larsmoa: Should be quite easy to split into multiple request
      if (filter.assetId.length > 100) {
        throw new Error(`Cannot provide more than 100 assetIds.`);
      }
      const filterQuery: Filter3DAssetMappingsQuery = {
        filter: { assetIds: filter.assetId },
        limit: 1000
      };
      return this._client.assetMappings3D.filter(model.modelId, model.revisionId, filterQuery);
    } else {
      const filterQuery: AssetMappings3DListFilter = {
        assetId: filter.assetId,
        intersectsBoundingBox: mapBoundingBoxToCdf(filter.boundingBox),
        limit: 1000
      };
      return this._client.assetMappings3D.list(model.modelId, model.revisionId, filterQuery);
    }
  }

  private buildAssetMappingsFilter(
    assetsFilter: AssetsFilter | undefined
  ): ((items: AssetMapping3D[]) => Promise<AssetMapping3D[]>) | undefined {
    if (assetsFilter === undefined) {
      return undefined;
    }

    const filterCallback = async (items: AssetMapping3D[]) => {
      const uniqueAssetIds = new Set<number>(items.map(x => x.assetId));
      const assetIds = [...uniqueAssetIds].map(x => ({ id: x }));
      const assets = await this._client.assets.retrieve(assetIds, { ignoreUnknownIds: true });
      const acceptedAssetIds = new Set<number>((await assetsFilter(assets)).map(x => x.id));
      return items.filter(assetMapping => acceptedAssetIds.has(assetMapping.assetId));
    };
    return filterCallback;
  }

  private async fetchBoundingBoxesForAssetMappings(assetMappings: AssetMapping3D[]) {
    const nodeList = await this._client.revisions3D.retrieve3DNodes(
      this._modelMetadataProvider.modelId,
      this._modelMetadataProvider.revisionId,
      assetMappings.map(mapping => {
        return { id: mapping.nodeId };
      })
    );

    const boundingBoxes = nodeList
      .filter(node => node.boundingBox)
      .map(node => {
        const bmin = node.boundingBox!.min;
        const bmax = node.boundingBox!.max;
        const bounds = new THREE.Box3().setFromArray([bmin[0], bmin[1], bmin[2], bmax[0], bmax[1], bmax[2]]);
        this._modelMetadataProvider.mapBoxFromCdfToModelCoordinates(bounds, bounds);
        return bounds;
      });

    return boundingBoxes;
  }

  getFilter(): AssetNodeCollectionFilter | undefined {
    return this._filter;
  }

  clear(): void {
    if (this._fetchResultHelper !== undefined) {
      this._fetchResultHelper.interrupt();
    }
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
