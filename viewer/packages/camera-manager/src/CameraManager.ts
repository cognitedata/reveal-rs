/*!
 * Copyright 2022 Cognite AS
 */

import { CameraChangeData, CameraState } from './types';
/**
 * Camera manager interface. It is responsible for all manipulations that are done with the camera,
 * including animations and modification of state. Also, gives ability
 * to provide custom `THREE.PerspectiveCamera` instance to {@link Cognite3DViewer}.
 * For working implementation required to fire `cameraChange`-event when camera is changed.
 * Default implementation is {@link DefaultCameraManager}.
 */
export interface CameraManager {
  /**
   * Returns the camera used for rendering in {@link Cognite3DViewer}.
   * Note that the camera will not be modified directly by Reveal.
   * Implementations must trigger the `cameraChange`-event whenever the
   * camera changes.
   */
  getCamera(): THREE.PerspectiveCamera;
  /**
   * Set camera's state
   *
   * @param state Camera state, all fields are optional.
   * @param state.position Camera position in world space.
   * @param state.target Camera target in world space.
   * @param state.rotation Camera local rotation in quaternion form.
   * @example
   * ```js
   * // store position, target
   * const { position, target } = cameraManager.getCameraState();
   * // restore position, target
   * cameraManager.setCameraState({ position, target });
   * ```
   */
  setCameraState(state: CameraState): void;

  /**
   * Get camera's state
   */
  getCameraState(): Required<CameraState>;

  /**
   * Subscribes to changes of the camera event. This is used by Reveal to react on changes of the camera.
   * @param event Name of the event.
   * @param callback Callback to be called when the event is fired.
   */
  on(event: 'cameraChange', callback: CameraChangeData): void;
  /**
   * Unsubscribes from changes of the camera event.
   * @param event Name of the event.
   * @param callback Callback function to be unsubscribed.
   */
  off(event: 'cameraChange', callback: CameraChangeData): void;

  fitCameraToBoundingBox(boundingBox: THREE.Box3, duration?: number, radiusFactor?: number): void;
  /**
   * Updates internal state of camera manager. Expected to update visual state of the camera
   * as well as it's near and far planes if needed. Called every time screen is refreshed.
   * @param deltaTime Delta time since last update in seconds.
   * @param boundingBox Global bounding box of the model(s) and any custom objects added to the scene.
   */
  update(deltaTime: number, boundingBox: THREE.Box3): void;
  /**
   * @obvious
   */
  dispose(): void;
}
