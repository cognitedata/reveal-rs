//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import CameraControls from "camera-controls";
import * as THREE from "three";
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { Range3 } from "@/Core/Geometry/Range3";
import { Ma } from "@/Core/Primitives/Ma";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { Vector3 } from "@/Core/Geometry/Vector3";

// https://andreasrohner.at/posts/Web%20Development/JavaScript/Simple-orbital-camera-controls-for-THREE-js/
// https://github.com/yomotsu/camera-controls
// https://www.npmjs.com/package/camera-controls

export class CameraControl
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private static _isCameraControlInstalled = false;
  private _camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private _controls: CameraControls | null = null;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get camera(): THREE.PerspectiveCamera | THREE.OrthographicCamera { return this._camera; }

  public get controls(): CameraControls
  {
    if (!this._controls)
      throw Error("Controls is not set");
    return this._controls;
  }

  public get distance(): number
  {
    const { controls } = this;
    let position = new THREE.Vector3();
    let target = new THREE.Vector3();
    position = controls.getPosition(position);
    target = controls.getTarget(target);
    return target.distanceTo(position);
  }

  //==================================================
  // CONSTRUCTOR
  //==================================================

  constructor(target: ThreeRenderTargetNode)
  {
    if (!CameraControl._isCameraControlInstalled)
    {
      CameraControls.install({ THREE });
      CameraControl._isCameraControlInstalled = true;
    }

    this._camera = target.isPerspectiveMode ? this.createPerspectiveCamera(target) : this.createOrthographicCamera(target);
    this._camera.position.set(0, 0, 5);
    this._camera.up.set(0,0,1);
    this._controls = new CameraControls(this._camera, target.domElement);
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public onResize(aspectRatio: number): void
  {
    const camera = this._camera;
    if (!this._camera)
      return;

    if (!(camera instanceof THREE.PerspectiveCamera))
      return;

    camera.aspect = aspectRatio;
    camera.updateProjectionMatrix();

  }

  public viewRange(boundingBox: Range3 | undefined): boolean
  {
    return this.viewFrom(boundingBox, -2);
  }

  public viewFrom(boundingBox: Range3 | undefined, index: number): boolean
  {
    if (!boundingBox || boundingBox.isEmpty)
      return false;

    const { controls } = this;
    const { camera } = this;

    let distanceFactor = 1;
    if (camera instanceof THREE.PerspectiveCamera)
    {
      const fov = Ma.toRad(camera.fov);
      distanceFactor = 0.65 / (camera.aspect * Math.tan(fov / 2));
    }
    const targetPosition = boundingBox.center;
    const position = boundingBox.center;

    if (index < -1)
    {
      // this.viewAllAlternative(camera as THREE.PerspectiveCamera, this.controls, boundingBox);
      // return true;

      let tempPosition = new THREE.Vector3();
      let tempTarget = new THREE.Vector3();
      tempPosition = controls.getPosition(tempPosition);
      tempTarget = controls.getTarget(tempTarget);

      // View all
      const direction = Vector3.substract(ThreeConverter.fromThreeVector3(tempPosition), ThreeConverter.fromThreeVector3(tempTarget));
      direction.normalize();

      const dots = new Vector3(Vector3.getAxis(0).getDot(direction), Vector3.getAxis(1).getDot(direction), Vector3.getAxis(2).getDot(direction));
      const deltaWeight = dots.clone();
      deltaWeight.abs();
      deltaWeight.negate();
      deltaWeight.addScalar(1);
      deltaWeight.multiply(boundingBox.delta);

      dots.multiply(boundingBox.delta);
      dots.divideScalar(2); // Dots are now distance from the center to the edge

      let distance = deltaWeight.absMaxCoord * distanceFactor; // Distance from edge
      distance += dots.length; // Distance center to edge
      direction.multiplyScalar(distance);
      position.add(direction);
    }
    if (index === -1)
    {
      // View all with a slope
      distanceFactor /= 2;
      const distanceX = Math.max(boundingBox.y.delta, boundingBox.z.delta) * distanceFactor * Math.sin(Math.PI / 4);
      const distanceY = Math.max(boundingBox.x.delta, boundingBox.z.delta) * distanceFactor * Math.sin(Math.PI / 4);
      const distanceZ = Math.max(boundingBox.x.delta, boundingBox.y.delta) * distanceFactor * Math.sin(Math.PI / 8);
      position.x = boundingBox.max.x + distanceX;
      position.y = boundingBox.max.y + distanceY;
      position.z = boundingBox.max.z + distanceZ;
    }
    else if (index === 0 || index === 1)
    {
      const distance = Math.max(boundingBox.x.delta, boundingBox.y.delta) * distanceFactor;
      if (index === 0)
      {
        // Top
        controls.rotateTo(0, Math.PI / 2, false);
        position.z = boundingBox.max.z + distance;
      }
      if (index === 1)
      {
        //Bottom
        controls.rotateTo(Math.PI, Math.PI / 2, false);
        position.z = boundingBox.min.z - distance;
      }
    }
    else if (index === 2 || index === 3)
    {
      const distance = Math.max(boundingBox.x.delta, boundingBox.z.delta) * distanceFactor;
      if (index === 2)
      {
        //South
        controls.rotateTo(Math.PI / 2, 0, false);
        position.y = boundingBox.min.y - distance;
      }
      else
      {
        //North
        controls.rotateTo(-Math.PI / 2, 0, false);
        position.y = boundingBox.max.y + distance;
      }
    }
    else if (index === 4 || index === 5)
    {
      const distance = Math.max(boundingBox.y.delta, boundingBox.z.delta) * distanceFactor;
      if (index === 4)
      {
        //West
        controls.rotateTo(0, 0, false);
        position.x = boundingBox.min.x - distance;
      }
      else
      {
        //East
        controls.rotateTo(Math.PI, 0, false);
        position.x = boundingBox.max.x + distance;
      }
    }
    controls.setTarget(targetPosition.x, targetPosition.y, targetPosition.z);
    controls.setPosition(position.x, position.y, position.z);
    return true;
  }

  public zoomToTarget(position: THREE.Vector3): void
  {
    const { controls } = this;
    const tmp = new THREE.Vector3();
    const distance = controls.getPosition(tmp).distanceTo(position);
    controls.setTarget(position.x, position.y, position.z, true);
    controls.dollyTo(distance / 2, true);
  }

  public viewAllAlternative(camera: THREE.PerspectiveCamera, controls: CameraControls, boundingBox: Range3 | undefined, fitOffset = 1.2)
  {
    if (!boundingBox)
      return;

    // Transform it......
    const box = new THREE.Box3();
    const size = ThreeConverter.toThreeVector3(boundingBox.delta);
    const center = ThreeConverter.toThreeVector3(boundingBox.center);

    const maxSize = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxSize / (2 * Math.atan(Math.PI * camera.fov / 360));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = fitOffset * Math.max(fitHeightDistance, fitWidthDistance);

    let position = new THREE.Vector3();
    let target = new THREE.Vector3();
    position = controls.getPosition(position);
    target = controls.getTarget(target);

    const direction = target.clone()
      .sub(camera.position)
      .normalize()
      .multiplyScalar(distance);

    controls.maxDistance = distance * 10;
    target.sub(direction);

    controls.setTarget(center.x, center.y, center.z);
    controls.setPosition(target.x, target.y, target.z);
  }

  //==================================================
  // INSTANCE METHODS: Creators
  //==================================================

  private createPerspectiveCamera(target: ThreeRenderTargetNode): THREE.PerspectiveCamera
  {
    const aspectRatio = target ? target.aspectRatio : undefined;
    const camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 10_000);
    return camera;
  }

  private createOrthographicCamera(target: ThreeRenderTargetNode): THREE.OrthographicCamera
  {
    const range = target.pixelRange;
    const camera = new THREE.OrthographicCamera(-range.x.delta / 2, range.x.delta / 2, range.y.delta / 2, -range.y.delta / 2, 0.1, 10_000);
    return camera;
  }
}
