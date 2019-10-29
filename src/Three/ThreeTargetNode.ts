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

import CameraControls from 'camera-controls';
import * as THREE from 'three';

import { RenderTargetNode } from "../Core/Nodes/RenderTargetNode";
import { ThreeCameraNode as ThreeCameraNode } from "./ThreeCameraNode";
import { ThreeConverter } from "./ThreeConverter";
import { Range3 } from '../Core/Geometry/Range3';

export class ThreeTargetNode extends RenderTargetNode
{
  //==================================================
  // FIELDS
  //==================================================

  private _scene: THREE.Scene | null = null;
  private _renderer: THREE.WebGLRenderer | null = null;

  //==================================================
  // PROPERTIES
  //==================================================

  public get scene(): THREE.Scene
  {
    if (!this._scene)
      this._scene = new THREE.Scene();
    return this._scene;
  }

  public get activeCameraNode(): ThreeCameraNode { return super.getActiveCameraNode() as ThreeCameraNode };

  public get activeCamera(): THREE.Camera
  {
    const cameraNode = this.activeCameraNode;
    if (!cameraNode)
      throw Error("The camera is not set");

    return cameraNode.camera;
  }

  public set activeCamera(value: THREE.Camera)
  {
    const cameraNode = this.activeCameraNode;
    if (!cameraNode)
      throw Error("The camera is not set");

    cameraNode.camera = value;
  }

  public get activeControls(): CameraControls | null
  {
    const cameraNode = this.activeCameraNode;
    if (!cameraNode)
      throw Error("The camera is not set");

    return cameraNode.controls;
  }

  private get renderer(): THREE.WebGLRenderer
  {
    if (!this._renderer)
    {
      this._renderer = new THREE.WebGLRenderer();
      this._renderer.setClearColor(ThreeConverter.toColor(this.color));
      this.setRenderSize();
    }
    return this._renderer;
  }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(range: Range3 | undefined) { super(range); }

  //==================================================
  // OVERRIDES of TargetNode
  //==================================================

  public /*override*/ get className(): string { return ThreeTargetNode.name; }
  public /*override*/ isA(className: string): boolean { return className === ThreeTargetNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ initializeCore()
  {
    super.initializeCore();
    this.addCameraNode(new ThreeCameraNode(), true)
    const clock = new THREE.Clock();
    this.render(clock);

    // Add lights (TODO: move to TreeLightNode?)
    const scene = this.scene;
    const direction = new THREE.Vector3(0.5, -0.5, 1)
    const color = 0xFFFFFF;

    const group = new THREE.Group();
    // Light from the sky
    {
      const intensity = 1;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(direction.x, direction.y, direction.z);
      group.add(light);
    }
    // Light from the ground
    {
      const intensity = 0.75;
      const light = new THREE.DirectionalLight(color, intensity);
      light.position.set(-direction.x, -direction.y, -direction.z);
      group.add(light);
    }
    scene.add(group);
  }

  //==================================================
  // OVERRIDES of RenderTargetNode
  //==================================================

  public /*override*/ viewRange(range: Range3): void
  {
    if (range.isEmpty)
      return;

    const controls = this.activeControls;
    if (!controls)
      return;
    controls.fitTo(ThreeConverter.toBox(range));


    // The below stuff doesn't work!!
    // controls.rotate(0, 0.8);
    controls.moveTo(range.x.center, range.y.center, range.z.center);
    this.Invalidate();

    //https://github.com/yomotsu/camera-controls
  }

  public /*override*/ get domElement(): HTMLElement { return this.renderer.domElement; }

  protected /*override*/ setRenderSize(): void
  {
    const range = this.pixelRange;
    this.renderer.setSize(range.x.delta, range.y.delta);
  }

  //==================================================
  // INSTANCE FUNCTIONS
  //==================================================

  private render(clock: THREE.Clock): void
  {
    requestAnimationFrame(() => { this.render(clock); });

    if (!this.isInitialized)
      return;

    const controls = this.activeControls;
    let needsUpdate = true;
    if (controls)
    {
      const delta = clock.getDelta();
      needsUpdate = controls.update(delta);
    }
    if (this.isInvalidated || needsUpdate)
    {
      this.renderer.render(this.scene, this.activeCamera);
      this.Invalidate(false);
    }
  }
}
