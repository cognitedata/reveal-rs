/*!
 * Copyright 2021 Cognite AS
 */
import { NumericRange, IndexSet } from '@reveal/utilities';
import { AreaCollection } from './prioritized/AreaCollection';
import { ClusteredAreaCollection } from './prioritized/ClusteredAreaCollection';
import { NodeCollectionBase, SerializedNodeCollection } from './NodeCollectionBase';

import * as THREE from 'three';
import { EmptyAreaCollection } from './prioritized/EmptyAreaCollection';

/**
 * Node collection that holds a set of nodes defined by a set of tree indices.
 */
export class TreeIndexNodeCollection extends NodeCollectionBase {
  public static readonly classToken = 'TreeIndexNodeCollection';

  private _treeIndices: IndexSet;
  private _areaCollection: AreaCollection | undefined;

  constructor(treeIndexSet?: IndexSet);
  constructor(treeIndices?: Iterable<number>);
  constructor(treeIndexRange?: NumericRange);
  constructor(values?: IndexSet | Iterable<number> | NumericRange) {
    super(TreeIndexNodeCollection.classToken);
    if (values instanceof IndexSet) {
      this._treeIndices = values;
    } else if (values instanceof NumericRange) {
      this._treeIndices = new IndexSet(values);
    } else {
      this._treeIndices = new IndexSet(values);
    }
  }

  updateSet(treeIndices: IndexSet) {
    this._treeIndices = treeIndices;
    this.notifyChanged();
  }

  /**
   * Sets this set to hold an empty set.
   */
  clear() {
    this._treeIndices = new IndexSet();
    this.notifyChanged();
  }

  getIndexSet(): IndexSet {
    return this._treeIndices;
  }

  getAreas(): AreaCollection {
    if (!this._areaCollection) {
      if (this._treeIndices.count === 0) {
        return EmptyAreaCollection.instance();
      }

      throw new Error(
        `The AreaCollection returned by getAreas() for TreeIndexNodeCollection must be constructed manually using addAreas() and addAreaPoints()`
      );
    }

    return this._areaCollection;
  }

  /**
   * Add areas to this node collection's area set.
   * Nearby areas may be clustered and merged together to keep
   * the number of areas in the set small.
   */
  addAreas(areas: THREE.Box3[]): void {
    if (!this._areaCollection) {
      this._areaCollection = new ClusteredAreaCollection();
    }

    this._areaCollection.addAreas(areas);
  }

  /**
   * Add points to this node collection's area set.
   * This effectively adds boxes of size 1x1x1 meter with the points as their centers.
   */
  addAreaPoints(points: THREE.Vector3[]): void {
    if (!this._areaCollection) {
      this._areaCollection = new ClusteredAreaCollection();
    }

    const areas = points.map(p => new THREE.Box3().setFromCenterAndSize(p, new THREE.Vector3(1, 1, 1)));

    this._areaCollection.addAreas(areas);
  }

  clearAreas(): void {
    this._areaCollection = undefined;
  }

  get isLoading(): boolean {
    return false;
  }

  serialize(): SerializedNodeCollection {
    return {
      token: this.classToken,
      state: this._treeIndices.toRangeArray(),
      options: { areas: this._areaCollection ? [...this._areaCollection.areas()] : undefined }
    };
  }
}
