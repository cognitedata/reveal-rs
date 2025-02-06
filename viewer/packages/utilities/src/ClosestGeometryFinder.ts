/*!
 * Copyright 2024 Cognite AS
 */

import { type Vector3 } from 'three';

/**
 * A utility class to find and store the closest geometry to a given origin point.
 * @template T - The type of the geometry.
 * @beta
 */
export class ClosestGeometryFinder<T> {
  private _closestGeometry: T | undefined = undefined; // The closest geometry found so far.
  private readonly _origin: Vector3; // The origin point from which distances are measured.
  private _minDistanceSquared = Number.MAX_VALUE; // The minimum distance squared from the origin to the closest geometry.

  /**
   * Creates an instance of ClosestGeometryFinder.
   *
   * @param origin - The origin point from which distances are measured.
   */
  public constructor(origin: Vector3) {
    this._origin = origin;
    this.clear();
  }

  /**
   * Sets the minimum distance to the closest geometry.
   *
   * @param value - The minimum distance.
   */
  public set minDistance(value: number) {
    this._minDistanceSquared = value * value;
  }

  /**
   * Gets the minimum distance to the closest geometry.
   *
   * @returns The minimum distance.
   */
  public get minDistance(): number {
    return Math.sqrt(this._minDistanceSquared);
  }

  /**
   * Gets the closest geometry found so far.
   *
   * @returns The closest geometry or undefined if no geometry has been added.
   */
  public getClosestGeometry(): T | undefined {
    return this._closestGeometry;
  }

  /**
   * Sets the closest geometry.
   *
   * @param geometry - The geometry to set as the closest.
   */
  public setClosestGeometry(geometry: T): void {
    this._closestGeometry = geometry;
  }

  /**
   * Checks if a given point is closer to the origin than the current closest geometry.
   *
   * @param point - The point to check.
   * @returns True if the point is closer, false otherwise.
   */
  public isClosest(point: Vector3): boolean {
    const distanceSquared = point.distanceToSquared(this._origin);
    if (distanceSquared > this._minDistanceSquared) {
      return false;
    }
    this._minDistanceSquared = distanceSquared;
    return true;
  }

  /**
   * Clears the closest geometry and resets the minimum distance.
   */
  public clear(): void {
    this._closestGeometry = undefined;
    this._minDistanceSquared = Number.MAX_VALUE;
  }

  /**
   * Adds a geometry if the given point is closer to the origin than the current closest geometry.
   *
   * @param point - The point associated with the geometry.
   * @param geometry - The geometry to add.
   * @returns True if the geometry was added, false otherwise.
   */
  public add(point: Vector3, geometry: T): boolean {
    if (!this.isClosest(point)) {
      return false;
    }
    this.setClosestGeometry(geometry);
    return true;
  }

  /**
   * Lazily adds a geometry if the given point is closer to the origin than the current closest geometry.
   *
   * @param point - The point associated with the geometry.
   * @param geometryCreator - A function that creates the geometry to add.
   * @returns True if the geometry was added, false otherwise.
   */
  public addLazy(point: Vector3, geometryCreator: () => T): boolean {
    if (!this.isClosest(point)) {
      return false;
    }
    this.setClosestGeometry(geometryCreator());
    return true;
  }
}
