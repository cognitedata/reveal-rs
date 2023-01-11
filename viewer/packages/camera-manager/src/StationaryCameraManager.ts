/*!
 * Copyright 2022 Cognite AS
 */

import { assertNever, pixelToNormalizedDeviceCoordinates } from '@reveal/utilities';
import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import pull from 'lodash/pull';

import { CameraManager } from './CameraManager';
import { CameraManagerHelper } from './CameraManagerHelper';
import {
  CameraChangeDelegate,
  CameraEventDelegate,
  CameraManagerEventType,
  CameraState,
  CameraStopDelegate
} from './types';
import { DebouncedCameraStopEventTrigger } from './utils/DebouncedCameraStopEventTrigger';

export class StationaryCameraManager implements CameraManager {
  private readonly _camera: THREE.PerspectiveCamera;
  private readonly _cameraChangedListeners: Array<CameraChangeDelegate> = [];
  private readonly _domElement: HTMLElement;
  private _defaultFOV: number;
  private readonly _stopEventTrigger: DebouncedCameraStopEventTrigger;
  private _isDragging = false;
  private readonly _camEuler: THREE.Euler;

  constructor(domElement: HTMLElement, camera: THREE.PerspectiveCamera) {
    this._domElement = domElement;
    this._camera = camera;
    this._defaultFOV = camera.fov;
    this._stopEventTrigger = new DebouncedCameraStopEventTrigger(this);
    this._camEuler = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ');
  }

  getCamera(): THREE.PerspectiveCamera {
    return this._camera;
  }

  // Stationary camera only reacts to rotation being set
  setCameraState(state: CameraState): void {
    const rotation = state.rotation ?? this._camera.quaternion;
    this._camera.quaternion.copy(rotation);
    this._cameraChangedListeners.forEach(cb => cb(this._camera.position, this._camera.position));
  }

  getCameraState(): Required<CameraState> {
    const unitForward = new THREE.Vector3(0, 0, -1);
    unitForward.applyQuaternion(this._camera.quaternion);
    return {
      position: this._camera.position,
      rotation: this._camera.quaternion,
      target: unitForward.add(this._camera.position)
    };
  }

  activate(cameraManager: CameraManager): void {
    const { position, rotation } = cameraManager.getCameraState();
    this.setCameraState({ rotation });
    this._camera.position.copy(position);

    this._defaultFOV = cameraManager.getCamera().fov;

    this._camera.fov = this._defaultFOV;
    this._camera.aspect = cameraManager.getCamera().aspect;
    this._camera.updateProjectionMatrix();

    this._domElement.addEventListener('pointermove', this.rotateCamera);
    this._domElement.addEventListener('pointerdown', this.enableDragging);
    this._domElement.addEventListener('pointerup', this.disableDragging);
    this._domElement.addEventListener('pointerout', this.disableDragging);
    this._domElement.addEventListener('wheel', this.zoomCamera);
  }

  deactivate(): void {
    this._domElement.removeEventListener('pointermove', this.rotateCamera);
    this._domElement.removeEventListener('pointerdown', this.enableDragging);
    this._domElement.removeEventListener('pointerup', this.disableDragging);
    this._domElement.removeEventListener('pointerout', this.disableDragging);
    this._domElement.addEventListener('wheel', this.zoomCamera);
  }

  on(eventType: CameraManagerEventType, callback: CameraEventDelegate): void {
    switch (eventType) {
      case 'cameraChange':
        this._cameraChangedListeners.push(callback);
        break;
      case 'cameraStop':
        this._stopEventTrigger.subscribe(callback as CameraStopDelegate);
        break;
      default:
        assertNever(eventType);
    }
  }

  off(eventType: CameraManagerEventType, callback: CameraChangeDelegate): void {
    switch (eventType) {
      case 'cameraChange':
        pull(this._cameraChangedListeners, callback);
        break;
      case 'cameraStop':
        this._stopEventTrigger.unsubscribe(callback as CameraStopDelegate);
        break;
      default:
        assertNever(eventType);
    }
  }

  fitCameraToBoundingBox(boundingBox: THREE.Box3, _?: number, radiusFactor?: number): void {
    const { position, target } = CameraManagerHelper.calculateCameraStateToFitBoundingBox(
      this._camera,
      boundingBox,
      radiusFactor
    );

    this.setCameraState({ position, target });
  }

  moveTo(targetPosition: THREE.Vector3, duration = 2000): Promise<void> {
    const from = { t: 0 };
    const to = { t: 1 };
    const { position } = this.getCameraState();
    const tween = new TWEEN.Tween(from)
      .to(to, duration)
      .onUpdate(() => {
        const temporaryPosition = new THREE.Vector3().lerpVectors(position, targetPosition, from.t);
        this._camera.position.copy(temporaryPosition);
      })
      .easing(num => TWEEN.Easing.Quintic.InOut(num))
      .start(TWEEN.now());

    return new Promise(resolve => {
      tween.onComplete(() => {
        tween.stop();
        resolve();
      });
    });
  }

  update(_: number, boundingBox: THREE.Box3): void {
    CameraManagerHelper.updateCameraNearAndFar(this._camera, boundingBox);
  }

  dispose(): void {
    this.deactivate();
    this._cameraChangedListeners.splice(0);
    this._stopEventTrigger.dispose();
  }

  private readonly enableDragging = (_: PointerEvent) => {
    this._isDragging = true;
  };

  private readonly disableDragging = (_: PointerEvent) => {
    this._isDragging = false;
  };

  private readonly rotateCamera = (event: PointerEvent) => {
    if (!this._isDragging) {
      return;
    }

    const { movementX, movementY } = event;
    const sensitivityScaler = 0.0015;

    const euler = new THREE.Euler().setFromQuaternion(this._camera.quaternion, 'YXZ');

    euler.x -= -movementY * sensitivityScaler * (this._camera.fov / this._defaultFOV);
    euler.y -= -movementX * sensitivityScaler * (this._camera.fov / this._defaultFOV);
    euler.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, euler.x));
    this._camera.quaternion.setFromEuler(euler);

    console.log(THREE.MathUtils.radToDeg(this._camera.rotation.x).toFixed(2));
    console.log(THREE.MathUtils.radToDeg(this._camera.rotation.y).toFixed(2));
    console.log(THREE.MathUtils.radToDeg(this._camera.rotation.z).toFixed(2));
    console.log('-----------------------------------------------------------');

    this._cameraChangedListeners.forEach(cb => cb(this._camera.position, this._camera.position));
  };

  private readonly zoomCamera = (event: WheelEvent) => {
    const sensitivityScaler = 0.05;
    const preCursorRay = this.getMouseRay(event).normalize();

    const lastFov = this._camera.fov;
    const newFov = Math.min(Math.max(this._camera.fov + event.deltaY * sensitivityScaler, 10), this._defaultFOV);

    this._camera.fov = Math.min(Math.max(this._camera.fov + event.deltaY * sensitivityScaler, 10), this._defaultFOV);
    this._camera.updateProjectionMatrix();

    if (this._camera.fov == lastFov) return;

    const postCursorRay = this.getMouseRay(event).normalize();

    ////--------------------------------
    const quatRotation = new THREE.Quaternion().setFromUnitVectors(postCursorRay, preCursorRay);
    const eulerRotation = new THREE.Euler().setFromQuaternion(quatRotation, 'ZYX');
    const cameraRotation = new THREE.Euler().setFromQuaternion(this._camera.quaternion, 'XYZ');

    // cameraRotation.x += eulerRotation.x;
    // cameraRotation.y += eulerRotation.y;
    // // cameraRotation.z += eulerRotation.z;
    // cameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotation.x));
    // this._camera.quaternion.setFromEuler(cameraRotation);

    ////--------------------------------

    // const cameraZRotation = this._camera.rotation.z;
    // this._camera.applyQuaternion(quatRotation);
    // this._camera.rotation.z = cameraZRotation;

    console.log(THREE.MathUtils.radToDeg(this._camera.rotation.x).toFixed(2));
    console.log(THREE.MathUtils.radToDeg(this._camera.rotation.y).toFixed(2));
    console.log(THREE.MathUtils.radToDeg(this._camera.rotation.z).toFixed(2));
    console.log('...........................................................');
    this._cameraChangedListeners.forEach(cb => cb(this._camera.position, this._camera.position));
  };

  private getMouseRay(event: WheelEvent) {
    const { width, height } = this._domElement.getBoundingClientRect();
    const ndcCoordinates = pixelToNormalizedDeviceCoordinates(event.offsetX, event.offsetY, width, height);
    const ray = new THREE.Vector3(ndcCoordinates.x, ndcCoordinates.y, 1)
      .unproject(this._camera)
      .sub(this._camera.position);
    return ray;
  }
}
