/*!
 * Copyright 2024 Cognite AS
 */

import { type Box3, Matrix4, Quaternion, Vector3 } from 'three';
import { Range3 } from '../geometry/Range3';
import { square } from '../extensions/mathExtensions';
import { Primitive } from './Primitive';
import { PrimitiveType } from './PrimitiveType';

const UP_AXIS = new Vector3(0, 0, 1);

export class Cylinder extends Primitive {
  public static MinSize = 0.01;

  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public radius = Cylinder.MinSize;
  public readonly centerA = new Vector3(0, 0, -Cylinder.MinSize);
  public readonly centerB = new Vector3(0, 0, +Cylinder.MinSize);

  // Redundant variable, calculated when needed
  private readonly _center = new Vector3();
  private readonly _axis = new Vector3();
  private readonly _size = new Vector3();

  // ==================================================
  // OVERRIDES of Primitive
  // ==================================================

  public override get primitiveType(): PrimitiveType {
    return PrimitiveType.Cylinder;
  }

  public override get area(): number {
    return 2 * Math.PI * this.radius * this.height;
  }

  public override get volume(): number {
    return Math.PI * square(this.radius) * this.height;
  }

  public override get diagonal(): number {
    return Math.sqrt(square(this.radius) + square(this.height));
  }

  public override getMatrix(): Matrix4 {
    return new Matrix4().compose(this.center, this.getQuaternion(), this.size);
  }

  public override setMatrix(matrix: Matrix4): void {
    const centerA = new Vector3(0, 0, -0.5).applyMatrix4(matrix);
    const centerB = new Vector3(0, 0, 0.5).applyMatrix4(matrix);
    const scale = new Vector3();
    matrix.decompose(new Vector3(), new Quaternion(), scale);

    this.centerA.copy(centerA);
    this.centerB.copy(centerB);
    this.radius = scale.x / 2;
  }

  public override expandBoundingBox(boundingBox: Box3): void {
    const range = new Range3(this.centerA, this.centerB);
    range.expandByMargin3(Range3.getCircleRangeMargin(this.axis, this.radius));
    boundingBox.union(range.getBox());
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get height(): number {
    return this.centerA.distanceTo(this.centerB);
  }

  public get center(): Vector3 {
    return this._center.addVectors(this.centerB, this.centerA).divideScalar(2);
  }

  public get size(): Vector3 {
    return this._size.set(this.diameter, this.diameter, this.height);
  }

  public get axis(): Vector3 {
    return this._axis.subVectors(this.centerB, this.centerA).normalize();
  }

  public get diameter(): number {
    return 2 * this.radius;
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public getRotationMatrix(matrix: Matrix4 = new Matrix4()): Matrix4 {
    matrix.identity();
    return matrix.makeRotationFromQuaternion(this.getQuaternion());
  }

  public getScaledMatrix(scale: Vector3, matrix: Matrix4 = new Matrix4()): Matrix4 {
    return matrix.compose(this.center, this.getQuaternion(), scale);
  }

  private getQuaternion(): Quaternion {
    const quaternion = new Quaternion();
    return quaternion.setFromUnitVectors(UP_AXIS, this.axis);
  }

  // ==================================================
  // INSTANCE METHODS: Operations
  // ==================================================

  public copy(cylinder: Cylinder): this {
    this.radius = cylinder.radius;
    this.centerA.copy(cylinder.centerA);
    this.centerB.copy(cylinder.centerB);
    return this;
  }

  public clear(): void {
    this.radius = Cylinder.MinSize;
    this.centerA.set(0, 0, -Cylinder.MinSize);
    this.centerB.set(0, 0, +Cylinder.MinSize);
  }

  public forceMinSize(): void {
    this.radius = Math.max(this.radius, Cylinder.MinSize);
  }

  // ==================================================
  // STATIC METHODS:
  // ==================================================

  public static isValidSize(value: number): boolean {
    return value > Cylinder.MinSize;
  }
}
