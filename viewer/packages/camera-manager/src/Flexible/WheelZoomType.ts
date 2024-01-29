/*!
 * Copyright 2021 Cognite AS
 */

/**
 * Sets mouse wheel initiated action.
 *
 * Modes:
 *
 * 'ToTarget' - zooms just to the current target (center of the screen) of the camera.
 *
 * 'PastCursor' - zooms in the direction of the ray coming from camera through cursor screen position, allows going through objects.
 *
 * 'ToCursor' - mouse wheel scroll zooms towards the point on the model where cursor is hovering over, doesn't allow going through objects.
 *
 * Default is 'zoomPastCursor'.
 *
 * @experimental
 */

export enum WheelZoomType {
  ToTarget = 'toTarget',
  PastCursor = 'pastCursor',
  ToCursor = 'toCursor',
  Auto = 'auto'
}
