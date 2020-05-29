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
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { Ma } from "@/Core/Primitives/Ma";

export class Camera
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private _camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private _controls: CameraControls;

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get camera(): THREE.Camera { return this._camera; }
  public get controls(): CameraControls { return this._controls; }

  //==================================================
  // CONSTRUCTOR
  //==================================================

  constructor(target: ThreeRenderTargetNode)
  {
    this._camera = this.createPerspectiveCamera(target);
    // https://andreasrohner.at/posts/Web%20Development/JavaScript/Simple-orbital-camera-controls-for-THREE-js/
    this._controls = new CameraControls(this._camera, target.domElement);
  }

  //==================================================
  // INSTANCE METHODS: Operations
  //==================================================

  public onResize(target: ThreeRenderTargetNode)
  {
    const camera = this._camera;
    if (this._camera === null)
      return;

    if (!(camera instanceof THREE.PerspectiveCamera))
      return;

    camera.aspect = target.aspectRatio;
    camera.updateProjectionMatrix();
  }

  public viewFrom(boundingBox: Range3, index: number): boolean
  {
    if (!boundingBox || boundingBox.isEmpty)
      return false;

    const controls = this.controls;
    const camera = this.camera;

    let distanceFactor = 1;
    if (camera instanceof THREE.PerspectiveCamera)
    {
      const perspectiveCamera = camera as THREE.PerspectiveCamera;
      const fov = Ma.toRad(perspectiveCamera.fov);
      distanceFactor = 0.66 / (camera.aspect * Math.tan(fov / 2));
      console.log(fov);
      console.log(distanceFactor);
    }
    const targetPosition = boundingBox.center;
    const position = boundingBox.center;

    // https://www.npmjs.com/package/camera-controls
    if (index < 0)
    {
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

  public viewRange(boundingBox: Range3 | undefined): boolean
  {
    if (!boundingBox || boundingBox.isEmpty)
      return false;

    const controls = this.controls;

    // https://github.com/yomotsu/camera-controls
    const targetPosition = boundingBox.center;
    controls.setTarget(targetPosition.x, targetPosition.y, targetPosition.z);
    controls.fitTo(ThreeConverter.toBox(boundingBox));
    return true;
  }

  //==================================================
  // INSTANCE METHODS: Creators
  //==================================================

  private createPerspectiveCamera(target: ThreeRenderTargetNode): THREE.PerspectiveCamera
  {
    const aspectRatio = target ? target.aspectRatio : undefined;
    const camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 10_000);
    camera.up.set(0, 0, 1);
    return camera;
  }

  private createOrthographicCamera(target: ThreeRenderTargetNode): THREE.OrthographicCamera
  {
    const range = target.pixelRange;
    const camera = new THREE.OrthographicCamera(-range.x.delta / 2, range.x.delta / 2, range.x.delta / 2, -range.x.delta / 2, 0.1, 10_000);
    camera.up.set(0, 0, 1);
    return camera;
  }



  // public switchCamera(isOrthographic) {

  //   if (!this._camera)
  //     return;
  //   if (!this._controls)
  //     return;

  //   var cameraPosition = this._camera.position.clone();
  //   var cameraMatrix = this._camera.matrix.clone();



  //   var oControlsTarget = oControls.target.clone();
  //   var oControlsPosition = oControls.position0.clone();
  //   if (isOrthographic == false) {
  //     aCamera = pCamera;
  //   } else {
  //     aCamera = oCamera;
  //   }
  //   aCamera.position.copy(cameraPosition);
  //   aCamera.matrix.copy(cameraMatrix);
  //   aCamera.updateProjectionMatrix();
  //   this._controls.object = aCamera;
  //   this._cControls.update();
  //   render();
  // }
}
