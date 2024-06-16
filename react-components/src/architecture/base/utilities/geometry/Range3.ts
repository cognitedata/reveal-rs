/*!
 * Copyright 2024 Cognite AS
 */

import { type Vector2, Vector3, Box3, type Plane, Line3 } from 'three';
import { Range1 } from './Range1';
import { square } from '../extensions/mathExtensions';
import { Vector3Pool } from '@cognite/reveal';
import { clear } from '../extensions/arrayExtensions';

export class Range3 {
  // ==================================================
  // STATIC FIELDS
  // ==================================================

  public static readonly empty = new Range3();

  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public x: Range1 = new Range1();
  public y: Range1 = new Range1();
  public z: Range1 = new Range1();

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get isEmpty(): boolean {
    return this.x.isEmpty || this.y.isEmpty || this.z.isEmpty;
  }

  public get min(): Vector3 {
    return new Vector3(this.x.min, this.y.min, this.z.min);
  }

  public get max(): Vector3 {
    return new Vector3(this.x.max, this.y.max, this.z.max);
  }

  public get delta(): Vector3 {
    return new Vector3(this.x.delta, this.y.delta, this.z.delta);
  }

  public get center(): Vector3 {
    return new Vector3(this.x.center, this.y.center, this.z.center);
  }

  public get diagonal(): number {
    return Math.sqrt(square(this.x.delta) + square(this.y.delta) + square(this.z.delta));
  }

  public get area(): number {
    return 2 * (this.x.delta + this.y.delta + this.z.delta);
  }

  public get volume(): number {
    return this.x.delta * this.y.delta * this.z.delta;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(min?: Vector3, max?: Vector3) {
    if (min === undefined && max !== undefined) {
      this.set(max, max);
    } else if (min !== undefined && max === undefined) {
      this.set(min, min);
    } else if (min !== undefined && max !== undefined) {
      this.set(min, max);
    }
  }

  public clone(): Range3 {
    const range = new Range3();
    range.x = this.x.clone();
    range.y = this.y.clone();
    range.z = this.z.clone();
    return range;
  }

  // ==================================================
  // INSTANCE METHODS: Requests
  // ==================================================

  public equals(other: Range3 | undefined): boolean {
    if (other === undefined) {
      return false;
    }
    return this.x.equals(other.x) && this.y.equals(other.y) && this.z.equals(other.z);
  }

  public isInside(point: Vector3): boolean {
    return this.x.isInside(point.x) && this.y.isInside(point.y) && this.z.isInside(point.z);
  }

  // ==================================================
  // INSTANCE METHODS: Getters
  // ==================================================

  public toString(): string {
    return `(X: ${this.x.toString()}, Y: ${this.y.toString()}, Z: ${this.z.toString()})`;
  }

  public getMin(target: Vector3): Vector3 {
    return target.set(this.x.min, this.y.min, this.z.min);
  }

  public getMax(target: Vector3): Vector3 {
    return target.set(this.x.max, this.y.max, this.z.max);
  }

  public getDelta(target: Vector3): Vector3 {
    return target.set(this.x.delta, this.y.delta, this.z.delta);
  }

  public getCenter(target: Vector3): Vector3 {
    return target.set(this.x.center, this.y.center, this.z.center);
  }

  public getBox(target?: Box3): Box3 {
    if (target === undefined) {
      target = new Box3();
    }
    target.min.set(this.x.min, this.y.min, this.z.min);
    target.max.set(this.x.max, this.y.max, this.z.max);
    return target;
  }

  public getCornerPoints(corners: Vector3[]): Vector3[] {
    for (let corner = 0; corner < 8; corner++) {
      this.getCornerPoint(corner, corners[corner]);
    }
    return corners;
  }

  public getCornerPoint(corner: number, target: Vector3): Vector3 {
    //      7-------6
    //    / |      /|
    //   4-------5  |
    //   |  |    |  |
    //   Z  3----|--2
    //   | /     |Y
    //   0---X---1

    switch (corner) {
      case 0:
        return target.set(this.x.min, this.y.min, this.z.min);
      case 1:
        return target.set(this.x.max, this.y.min, this.z.min);
      case 2:
        return target.set(this.x.max, this.y.max, this.z.min);
      case 3:
        return target.set(this.x.min, this.y.max, this.z.min);
      case 4:
        return target.set(this.x.min, this.y.min, this.z.max);
      case 5:
        return target.set(this.x.max, this.y.min, this.z.max);
      case 6:
        return target.set(this.x.max, this.y.max, this.z.max);
      case 7:
        return target.set(this.x.min, this.y.max, this.z.max);
      default:
        throw Error('getCornerPoint');
    }
  }

  // ==================================================
  // INSTANCE METHODS: Plane intersection
  // ==================================================

  public getHorizontalIntersection(plane: Plane, cornerIndex: number): Vector3 {
    const corner = this.getCornerPoint(cornerIndex, newVector3());
    return plane.projectPoint(corner, corner);
  }

  public getIntersectionOfEdge(
    plane: Plane,
    cornerIndex1: number,
    cornerIndex2: number
  ): Vector3 | undefined {
    // Finds 2 corners and make a line between them, then intersect the line
    const corner1 = this.getCornerPoint(cornerIndex1, newVector3());
    const corner2 = this.getCornerPoint(cornerIndex2, newVector3());
    TEMPORARY_LINE.set(corner1, corner2);
    const point = plane.intersectLine(TEMPORARY_LINE, newVector3());
    return point ?? undefined;
  }

  // ==================================================
  // INSTANCE METHODS: Operations
  // ==================================================

  public copy(box: Box3): void {
    this.set(box.min, box.max);
  }

  public set(min: Vector3, max: Vector3): void {
    this.x.set(min.x, max.x);
    this.y.set(min.y, max.y);
    this.z.set(min.z, max.z);
  }

  public translate(value: Vector3): void {
    this.x.translate(value.x);
    this.y.translate(value.y);
    this.z.translate(value.z);
  }

  public scaleDelta(value: Vector3): void {
    this.x.scaleDelta(value.x);
    this.y.scaleDelta(value.y);
    this.z.scaleDelta(value.z);
  }

  public add(value: Vector3): void {
    this.x.add(value.x);
    this.y.add(value.y);
    this.z.add(value.z);
  }

  public add2(value: Vector2): void {
    this.x.add(value.x);
    this.y.add(value.y);
  }

  public addRange(value: Range3 | undefined): void {
    if (value === undefined) return;
    this.x.addRange(value.x);
    this.y.addRange(value.y);
    this.z.addRange(value.z);
  }

  public expandByMargin(margin: number): void {
    this.x.expandByMargin(margin);
    this.y.expandByMargin(margin);
    this.z.expandByMargin(margin);
  }

  public expandByMargin3(margin: Vector3): void {
    this.x.expandByMargin(margin.x);
    this.y.expandByMargin(margin.y);
    this.z.expandByMargin(margin.z);
  }

  public expandByFraction(fraction: number): void {
    this.x.expandByFraction(fraction);
    this.y.expandByFraction(fraction);
    this.z.expandByFraction(fraction);
  }

  // ==================================================
  // STATIC METHODS
  // ==================================================

  public static createCube(halfSize: number): Range3 {
    const range = new Range3();
    range.x.set(-halfSize, halfSize);
    range.y.set(-halfSize, halfSize);
    range.z.set(-halfSize, halfSize);
    return range;
  }

  public static getRangeFromPlanes0(planes: Plane[], originalBoundingBox: Range3): Range3 {
    let boundingBox = originalBoundingBox.clone();
    for (const plane of planes) {
      const smallerBoundingBox = new Range3();
      // Add in visible corners
      for (let corner = 0; corner < 8; corner++) {
        const cornerPoint = boundingBox.getCornerPoint(corner, newVector3());
        if (plane.distanceToPoint(cornerPoint) >= 0) {
          smallerBoundingBox.add(cornerPoint);
        }
      }
      // Add in edge intersections
      for (let startIndex = 0; startIndex < 8; startIndex += 4) {
        for (let corner = 0; corner < 4; corner++) {
          const corner1 = startIndex + corner;
          const corner2 = startIndex + ((corner + 1) % 4);
          const intersection = boundingBox.getIntersectionOfEdge(plane, corner1, corner2);
          if (intersection !== undefined) {
            smallerBoundingBox.add(intersection);
          }
        }
      }
      for (let corner = 0; corner < 4; corner++) {
        const intersection = boundingBox.getIntersectionOfEdge(plane, corner, corner + 4);
        if (intersection !== undefined) {
          smallerBoundingBox.add(intersection);
        }
      }
      boundingBox = smallerBoundingBox;
    }
    return boundingBox;
  }

  public static getRangeFromPlanes(planes: Plane[], originalBoundingBox: Range3): Range3 {
    const isHorizontal = (plane: Plane): boolean => {
      return plane.normal.x === 0 && plane.normal.y === 0;
    };

    const result = new Range3();

    // Add in visible corners
    for (let corner = 0; corner < 8; corner++) {
      let visible = true;
      const cornerPoint = originalBoundingBox.getCornerPoint(corner, newVector3());
      for (const plane of planes) {
        if (plane.distanceToPoint(cornerPoint) >= 0) {
          continue;
        }
        visible = false;
        break;
      }
      if (!visible) {
        continue;
      }
      result.add(cornerPoint);
    }

    for (const plane of planes) {
      let start: Vector3 | undefined;
      let end: Vector3 | undefined;
      for (let corner = 0; corner < 4; corner++) {
        const corner1 = corner;
        const corner2 = isHorizontal(plane) ? corner + 4 : (corner + 1) % 4;
        const intersection = originalBoundingBox.getIntersectionOfEdge(plane, corner1, corner2);
        if (intersection === undefined) {
          continue;
        }
        if (start === undefined) {
          start = intersection.clone();
          continue;
        }
        if (end === undefined) {
          end = intersection.clone();
          break;
        }
      }
      if (start === undefined || end === undefined) {
        continue;
      }
      const lines = new Array<Line3>();
      lines.push(new Line3(start, end));

      for (const otherPlane of planes) {
        if (otherPlane === plane || isHorizontal(plane) !== isHorizontal(otherPlane)) {
          continue;
        }
        const length = lines.length;
        for (let i = 0; i < length; i++) {
          const line = lines[i];
          const intersection = otherPlane.intersectLine(line, new Vector3());
          if (intersection === null) {
            continue;
          }
          line.set(line.start, intersection);
          lines.push(new Line3(intersection, line.start));
        }
      }
      for (const line of lines) {
        const center = line.getCenter(newVector3());
        let visible = true;
        for (const otherPlane of planes) {
          if (otherPlane === plane || isHorizontal(plane) !== isHorizontal(otherPlane)) {
            continue;
          }
          if (otherPlane.distanceToPoint(center) >= 0) {
            continue;
          }
          visible = false;
          break;
        }
        if (!visible) {
          continue;
        }
        if (!isHorizontal(plane)) {
          result.x.add(line.start.x);
          result.y.add(line.start.y);
          result.x.add(line.end.x);
          result.y.add(line.end.y);
        } else {
          result.z.add(line.start.z);
          result.z.add(line.end.z);
        }
      }
    }
    return result;
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Vector pool
// ==================================================

const TEMPORARY_LINE = new Line3(); // Temporary, used in getIntersection() only
const VECTOR_POOL = new Vector3Pool();
function newVector3(copyFrom?: Vector3): Vector3 {
  return VECTOR_POOL.getNext(copyFrom);
}
