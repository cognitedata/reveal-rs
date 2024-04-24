/*!
 * Copyright 2024 Cognite AS
 */
import { Vector2, Vector3 } from 'three';
import { type Range1 } from './Range1';
import { Range3 } from './Range3';
import { Grid2 } from './Grid2';

import cloneDeep from 'lodash/cloneDeep';
import { type Shape } from './Shape';
import { Index2 } from './Index2';
import { getGaussian } from '../utilities/math';

export class RegularGrid2 extends Grid2 {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public origin: Vector2; // Z is translation in Z

  public inc: Vector2; // Z is ignored

  private _hasRotationAngle = false;

  private _rotationAngle = 0;

  private _sinRotationAngle = 0;

  private _cosRotationAngle = 1;

  private _buffer: Float32Array;

  static readonly _staticHelperA = new Vector3();

  static readonly _staticHelperB = new Vector3();

  static readonly _staticHelperC = new Vector3();

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
    inc: Vector2,
    rotationAngle: number | undefined = undefined
  ) {
    super(nodeSize);
    this.origin = origin;
    this.inc = inc;
    if (rotationAngle !== undefined) {
      this.rotationAngle = rotationAngle;
    }
    this._buffer = new Float32Array(nodeSize.size);
  }

  // ==================================================
  // OVERRIDES of object
  // ==================================================

  public override toString(): string {
    return `nodeSize: (${this.nodeSize.toString()}) origin: (${this.origin.x}, ${this.origin.y}) inc: (${this.inc.x}, ${this.inc.y})`;
  }

  // ==================================================
  // OVERRIDES of Shape
  // ==================================================

  public override clone(): Shape {
    return cloneDeep(this);
  }

  public expandBoundingBox(boundingBox: Range3): void {
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
    if (resultPosition === undefined)
      // eslint-disable-next-line no-param-reassign
      resultPosition = new Vector3();

    const z = this.getZ(i, j);
    if (Number.isNaN(z)) return false;

    if (this._hasRotationAngle) {
      const dx = this.inc.x * i;
      const dy = this.inc.y * j;
      resultPosition.x = dx * this._cosRotationAngle - dy * this._sinRotationAngle;
      resultPosition.y = dx * this._sinRotationAngle + dy * this._cosRotationAngle;
    } else {
      resultPosition.x = this.inc.x * i;
      resultPosition.y = this.inc.y * j;
    }
    resultPosition.z = z;
    resultPosition.x += this.origin.x;
    resultPosition.y += this.origin.y;
    return true;
  }

  public getNodePosition2(i: number, j: number, resultPosition: Vector3): void {
    if (this._hasRotationAngle) {
      const dx = this.inc.x * i;
      const dy = this.inc.y * j;
      resultPosition.x = dx * this._cosRotationAngle - dy * this._sinRotationAngle;
      resultPosition.y = dx * this._sinRotationAngle + dy * this._cosRotationAngle;
    } else {
      resultPosition.x = this.inc.x * i;
      resultPosition.y = this.inc.y * j;
    }
    resultPosition.x += this.origin.x;
    resultPosition.y += this.origin.y;
  }

  public getRelativeNodePosition(i: number, j: number, resultPosition: Vector3): boolean {
    const z = this.getZ(i, j);
    if (Number.isNaN(z)) return false;

    resultPosition.x = this.inc.x * i;
    resultPosition.y = this.inc.y * j;
    resultPosition.z = z;
    return true;
  }

  // ==================================================
  // INSTANCE METHODS: Getters: Cell position
  // ==================================================

  public getCellFromPosition(position: Vector3, resultCell?: Index2): Index2 {
    if (resultCell === undefined)
      // eslint-disable-next-line no-param-reassign
      resultCell = Index2.newZero;

    const dx = position.x - this.origin.x;
    const dy = position.y - this.origin.y;

    let i;
    let j: number;
    if (this._hasRotationAngle) {
      const x = dx * this._cosRotationAngle + dy * this._sinRotationAngle;
      const y = -dx * this._sinRotationAngle + dy * this._cosRotationAngle;
      i = x / this.inc.x;
      j = y / this.inc.y;
    } else {
      i = dx / this.inc.x;
      j = dy / this.inc.y;
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
    if (resultNormal === undefined) resultNormal = new Vector3();

    if (z === undefined) {
      z = this.getZ(i, j);
    }

    const a = RegularGrid2._staticHelperA;
    const b = RegularGrid2._staticHelperB;

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

    if (def0 && def1) {
      a.set(+this.inc.x, 0, z0);
      b.set(0, +this.inc.y, z1);
      a.cross(b);
      resultNormal.add(a);
    }
    if (def1 && def2) {
      a.set(0, +this.inc.y, z1);
      b.set(-this.inc.x, 0, z2);
      a.cross(b);
      resultNormal.add(a);
    }
    if (def2 && def3) {
      a.set(-this.inc.x, 0, z2);
      b.set(0, -this.inc.y, z3);
      a.cross(b);
      resultNormal.add(a);
    }
    if (def3 && def0) {
      a.set(0, -this.inc.y, z3);
      b.set(+this.inc.x, 0, z0);
      a.cross(b);
      resultNormal.add(a);
    }
    if (normalize) {
      resultNormal.normalize();
      if (resultNormal.lengthSq() < 0.5) {
        resultNormal.set(0, 0, 1);
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

          // New value = (Sum the surrunding values + 2 * Current value) / N
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

  // ==================================================
  // STATIC METHODS:
  // ==================================================

  static createFractal(
    boundingBox: Range3,
    powerOf2: number,
    dampning: number = 0.7,
    smoothNumberOfPasses: number = 0,
    rotationAngle: number
  ): RegularGrid2 {
    const origin = new Vector2();
    const inc = new Vector2(1, 1);
    const nodeSize = new Index2(2 ** powerOf2 + 1);
    const stdDev = 1;
    const grid = new RegularGrid2(nodeSize, origin, inc, rotationAngle);

    const i0 = 0;
    const j0 = 0;
    const i1 = grid.cellSize.i;
    const j1 = grid.cellSize.j;

    grid.setZ(i0, j0, getGaussian(0, stdDev));
    grid.setZ(i1, j0, getGaussian(0, stdDev));
    grid.setZ(i0, j1, getGaussian(0, stdDev));
    grid.setZ(i1, j1, getGaussian(0, stdDev));

    subDivide(grid, i0, j0, i1, j1, stdDev, powerOf2, dampning);

    grid.origin.x = boundingBox.x.min;
    grid.origin.y = boundingBox.y.min;
    grid.inc.x = boundingBox.x.delta / grid.cellSize.i;
    grid.inc.y = boundingBox.y.delta / grid.cellSize.j;

    grid.normalizeZ(boundingBox.z);
    grid.smoothSimple(smoothNumberOfPasses);
    return grid;
  }
}

// ==================================================
// LOCAL FUNCTIONS: Helpers
// ==================================================

function setValueBetween(
  grid: RegularGrid2,
  i0: number,
  j0: number,
  i2: number,
  j2: number,
  stdDev: number,
  zMean?: number
): number {
  const i1 = Math.trunc((i0 + i2) / 2);
  const j1 = Math.trunc((j0 + j2) / 2);

  const oldZ = grid.getZ(i1, j1);
  if (oldZ !== 0) return oldZ; // Assume already calculated (little bit dirty...)

  if (zMean === undefined)
    // eslint-disable-next-line no-param-reassign
    zMean = (grid.getZ(i0, j0) + grid.getZ(i2, j2)) / 2;

  const newZ = getGaussian(zMean, stdDev);
  grid.setZ(i1, j1, newZ);
  return newZ;
}

function subDivide(
  grid: RegularGrid2,
  i0: number,
  j0: number,
  i2: number,
  j2: number,
  stdDev: number,
  level: number,
  dampning: number
): void {
  if (i2 - i0 <= 1 && j2 - j0 <= 1) return; // Nothing more to update
  if (i2 - i0 !== j2 - j0) throw Error('Logical bug, should be a square');

  // eslint-disable-next-line no-param-reassign
  stdDev *= dampning;
  let z = 0;
  z += setValueBetween(grid, i0, j0, i2, j0, stdDev);
  z += setValueBetween(grid, i0, j2, i2, j2, stdDev);
  z += setValueBetween(grid, i0, j0, i0, j2, stdDev);
  z += setValueBetween(grid, i2, j0, i2, j2, stdDev);

  setValueBetween(grid, i0, j0, i2, j2, stdDev, z / 4);

  // eslint-disable-next-line no-param-reassign
  level -= 1;
  if (level === 0) return;

  const i1 = Math.trunc((i0 + i2) / 2);
  const j1 = Math.trunc((j0 + j2) / 2);

  subDivide(grid, i0, j0, i1, j1, stdDev, level, dampning);
  subDivide(grid, i0, j1, i1, j2, stdDev, level, dampning);
  subDivide(grid, i1, j0, i2, j1, stdDev, level, dampning);
  subDivide(grid, i1, j1, i2, j2, stdDev, level, dampning);
}
