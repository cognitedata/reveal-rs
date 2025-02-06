/*!
 * Copyright 2024 Cognite AS
 */

import { Vector3, Plane } from 'three';

/**
 * Determines if a point is visible by a set of planes.
 *
 * @param planes - An array of Plane objects to check visibility against.
 * @param point - The Vector3 point to be checked.
 * @returns A boolean indicating whether the point is visible by all planes.
 */
export function isPointVisibleByPlanes(planes: Plane[], point: Vector3): boolean {
  return planes.every(p => p.distanceToPoint(point) >= 0);
}
