/*!
 * Copyright 2024 Cognite AS
 */
import { type Vector2, Vector3 } from 'three';
import { type Range1 } from '../../../base/utilities/geometry/Range1';
import { Range3 } from '../../../base/utilities/geometry/Range3';
import { Grid2 } from './Grid2';

import cloneDeep from 'lodash/cloneDeep';
import { type Shape } from '../../../base/utilities/geometry/Shape';
import { Index2 } from '../../../base/utilities/geometry/Index2';

export class RegularGrid2 extends Grid2 {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly origin: Vector2;
  public readonly increment: Vector2;

  private _buffer: Float32Array<ArrayBuffer>; // NaN value in this array means undefined node
  private _hasRotationAngle = false;
  private _rotationAngle = 0;
  private _sinRotationAngle = 0; // Due to speed
  private _cosRotationAngle = 1; // Due to speed
  static _tempVectorA = new Vector3();
  static _tempVectorB = new Vector3();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get rotationAngle(): number {
    return this._rotationAngle;
  }

  public set rotationAngle(value: number) {
    this._hasRotationAngle = value !== 0;
    if (this._hasRotationAngle) {
      this._rotationAngle = value;
      this._sinRotationAngle = Math.sin(this._rotationAngle);
      this._cosRotationAngle = Math.cos(this._rotationAngle);
    } else {
      this._rotationAngle = 0;
      this._sinRotationAngle = 0;
      this._cosRotationAngle = 1;
    }
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(
    nodeSize: Index2,
    origin: Vector2,
    increment: Vector2,
    rotationAngle: number | undefined = undefined
  ) {
    super(nodeSize);
    this.origin = origin;
    this.increment = increment;
    if (rotationAngle !== undefined) {
      this.rotationAngle = rotationAngle;
    }
    this._buffer = new Float32Array(nodeSize.size);
  }

  // ==================================================
  // OVERRIDES of object
  // ==================================================

  public override toString(): string {
    return `nodeSize: (${this.nodeSize.toString()}) origin: (${this.origin.x}, ${this.origin.y}) inc: (${this.increment.x}, ${this.increment.y})`;
  }

  // ==================================================
  // OVERRIDES of Shape
  // ==================================================

  public override clone(): Shape {
    return cloneDeep(this);
  }

  public override expandBoundingBox(boundingBox: Range3): void {
    const position = new Vector3();
    for (let j = this.nodeSize.j - 1; j >= 0; j--) {
      for (let i = this.nodeSize.i - 1; i >= 0; i--) {
        if (this.getNodePosition(i, j, position)) {
          boundingBox.add(position);
        }
      }
    }
  }

  // ==================================================
  // INSTANCE METHODS: Requests
  // ==================================================

  public isNodeDef(i: number, j: number): boolean {
    return !Number.isNaN(this.getZ(i, j));
  }

  public isNodeInsideDef(i: number, j: number): boolean {
    return this.isNodeInside(i, j) && this.isNodeDef(i, j);
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getZ(i: number, j: number): number {
    const index = this.getNodeIndex(i, j);
    return this._buffer[index];
  }

  // ==================================================
  // INSTANCE METHODS: Getters: Node position
  // ==================================================

  public getNodePosition(i: number, j: number, resultPosition?: Vector3): boolean {
    if (resultPosition === undefined) {
      resultPosition = new Vector3();
    }
    const z = this.getZ(i, j);
    if (Number.isNaN(z)) {
      return false;
    }
    if (this._hasRotationAngle) {
      const dx = this.increment.x * i;
      const dy = this.increment.y * j;
      resultPosition.x = dx * this._cosRotationAngle - dy * this._sinRotationAngle;
      resultPosition.y = dx * this._sinRotationAngle + dy * this._cosRotationAngle;
    } else {
      resultPosition.x = this.increment.x * i;
      resultPosition.y = this.increment.y * j;
    }
    resultPosition.x += this.origin.x;
    resultPosition.y += this.origin.y;
    resultPosition.z = z;
    return true;
  }

  public getNodePosition2(i: number, j: number, resultPosition: Vector3): void {
    if (this._hasRotationAngle) {
      const dx = this.increment.x * i;
      const dy = this.increment.y * j;
      resultPosition.x = dx * this._cosRotationAngle - dy * this._sinRotationAngle;
      resultPosition.y = dx * this._sinRotationAngle + dy * this._cosRotationAngle;
    } else {
      resultPosition.x = this.increment.x * i;
      resultPosition.y = this.increment.y * j;
    }
    resultPosition.x += this.origin.x;
    resultPosition.y += this.origin.y;
  }

  public getRelativeNodePosition(i: number, j: number, resultPosition: Vector3): boolean {
    const z = this.getZ(i, j);
    if (Number.isNaN(z)) return false;

    resultPosition.x = this.increment.x * i;
    resultPosition.y = this.increment.y * j;
    resultPosition.z = z;
    return true;
  }

  // ==================================================
  // INSTANCE METHODS: Getters: Cell position
  // ==================================================

  public getCellFromPosition(position: Vector3, resultCell?: Index2): Index2 {
    if (resultCell === undefined) {
      resultCell = new Index2();
    }
    const dx = position.x - this.origin.x;
    const dy = position.y - this.origin.y;

    let i;
    let j: number;
    if (this._hasRotationAngle) {
      const x = dx * this._cosRotationAngle + dy * this._sinRotationAngle;
      const y = -dx * this._sinRotationAngle + dy * this._cosRotationAngle;
      i = x / this.increment.x;
      j = y / this.increment.y;
    } else {
      i = dx / this.increment.x;
      j = dy / this.increment.y;
    }
    resultCell.i = Math.floor(i);
    resultCell.j = Math.floor(j);
    return resultCell;
  }

  // ==================================================
  // INSTANCE METHODS: Getters: Others
  // ==================================================

  public getNormal(
    i: number,
    j: number,
    z: number | undefined,
    normalize: boolean,
    resultNormal?: Vector3
  ): Vector3 {
    if (resultNormal === undefined) {
      resultNormal = new Vector3();
    }
    if (z === undefined) {
      z = this.getZ(i, j);
    }
    resultNormal.set(0, 0, 0);

    let def0 = this.isNodeInside(i + 1, j + 0);
    let def1 = this.isNodeInside(i + 0, j + 1);
    let def2 = this.isNodeInside(i - 1, j + 0);
    let def3 = this.isNodeInside(i + 0, j - 1);

    const i0 = def0 ? this.getNodeIndex(i + 1, j + 0) : -1;
    const i1 = def1 ? this.getNodeIndex(i + 0, j + 1) : -1;
    const i2 = def2 ? this.getNodeIndex(i - 1, j + 0) : -1;
    const i3 = def3 ? this.getNodeIndex(i + 0, j - 1) : -1;

    let z0 = def0 ? this._buffer[i0] : 0;
    let z1 = def1 ? this._buffer[i1] : 0;
    let z2 = def2 ? this._buffer[i2] : 0;
    let z3 = def3 ? this._buffer[i3] : 0;

    if (def0) {
      if (Number.isNaN(z0)) def0 = false;
      else z0 -= z;
    }
    if (def1) {
      if (Number.isNaN(z1)) def1 = false;
      else z1 -= z;
    }
    if (def2) {
      if (Number.isNaN(z2)) def2 = false;
      else z2 -= z;
    }
    if (def3) {
      if (Number.isNaN(z3)) def3 = false;
      else z3 -= z;
    }

    const a = RegularGrid2._tempVectorA;
    const b = RegularGrid2._tempVectorB;

    if (def0 && def1) {
      a.set(+this.increment.x, 0, z0);
      b.set(0, +this.increment.y, z1);
      a.cross(b);
      resultNormal.add(a);
    }
    if (def1 && def2) {
      a.set(0, +this.increment.y, z1);
      b.set(-this.increment.x, 0, z2);
      a.cross(b);
      resultNormal.add(a);
    }
    if (def2 && def3) {
      a.set(-this.increment.x, 0, z2);
      b.set(0, -this.increment.y, z3);
      a.cross(b);
      resultNormal.add(a);
    }
    if (def3 && def0) {
      a.set(0, -this.increment.y, z3);
      b.set(+this.increment.x, 0, z0);
      a.cross(b);
      resultNormal.add(a);
    }
    if (normalize) {
      resultNormal.normalize();
      if (resultNormal.lengthSq() < 0.5) {
        resultNormal.set(0, 0, 1); // If the normal is too small, we assume it is a flat surface
      }
    }
    return resultNormal;
  }

  public getCornerRange(): Range3 {
    const corner = new Vector3();
    const range = new Range3();
    range.add2(this.origin);
    this.getNodePosition2(0, this.nodeSize.j - 1, corner);
    range.add(corner);
    this.getNodePosition2(this.nodeSize.i - 1, 0, corner);
    range.add(corner);
    this.getNodePosition2(this.nodeSize.i - 1, this.nodeSize.j - 1, corner);
    range.add(corner);
    return range;
  }

  // ==================================================
  // INSTANCE METHODS: Setters
  // ==================================================

  public setNodeUndef(i: number, j: number): void {
    this.setZ(i, j, Number.NaN);
  }

  public setZ(i: number, j: number, value: number): void {
    const index = this.getNodeIndex(i, j);
    this._buffer[index] = value;
  }

  // ==================================================
  // INSTANCE METHODS: Operation
  // ==================================================

  public normalizeZ(wantedRange?: Range1): void {
    const currentRange = this.zRange;
    for (let i = this._buffer.length - 1; i >= 0; i--) {
      let z = this._buffer[i];
      z = currentRange.getFraction(z);
      if (wantedRange !== undefined) z = wantedRange.getValue(z);
      this._buffer[i] = z;
    }
    this.touch();
  }

  public smoothSimple(numberOfPasses: number = 1): void {
    if (numberOfPasses <= 0) return;
    let buffer = new Float32Array(this.nodeSize.size);
    for (let pass = 0; pass < numberOfPasses; pass++) {
      for (let i = this.nodeSize.i - 1; i >= 0; i--)
        for (let j = this.nodeSize.j - 1; j >= 0; j--) {
          if (!this.isNodeDef(i, j)) continue;

          const iMin = Math.max(i - 1, 0);
          const iMax = Math.min(i + 1, this.cellSize.i);
          const jMin = Math.max(j - 1, 0);
          const jMax = Math.min(j + 1, this.cellSize.j);

          let count = 0;
          let sum = 0;

          // New value = (Sum the surrounding values + 2 * Current value) / N
          for (let ii = iMin; ii <= iMax; ii++)
            for (let jj = jMin; jj <= jMax; jj++) {
              if (ii === i && jj === j) continue;

              if (!this.isNodeDef(ii, jj)) continue;

              sum += this.getZ(ii, jj);
              count += 1;
            }
          sum += this.getZ(i, j) * count;
          count += count;
          const index = this.getNodeIndex(i, j);
          buffer[index] = sum / count;
        }
      [this._buffer, buffer] = [buffer, this._buffer]; // Swap buffers
    }
    this.touch();
  }
}
