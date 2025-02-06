/*!
 * Copyright 2024 Cognite AS
 */

import {
  type CameraManager,
  CustomObject,
  isFlexibleCameraManager,
  type Cognite3DViewer,
  type IFlexibleCameraManager,
  CDF_TO_VIEWER_TRANSFORMATION,
  CogniteCadModel,
  CognitePointCloudModel,
  Image360Action,
  type DataSourceType
} from '@cognite/reveal';
import {
  Vector3,
  AmbientLight,
  DirectionalLight,
  type PerspectiveCamera,
  type Box3,
  type Plane
} from 'three';
import { CommandsController } from './CommandsController';
import { RootDomainObject } from '../domainObjects/RootDomainObject';
import { getOctDir } from '../utilities/extensions/vectorExtensions';
import { getResizeCursor } from '../utilities/geometry/getResizeCursor';
import { type DomainObject } from '../domainObjects/DomainObject';
import { type AxisGizmoTool } from '@cognite/reveal/tools';
import { type BaseRevealConfig } from './BaseRevealConfig';
import { DefaultRevealConfig } from './DefaultRevealConfig';
import { CommandsUpdater } from '../reactUpdaters/CommandsUpdater';
import { Range3 } from '../utilities/geometry/Range3';
import { getBoundingBoxFromPlanes } from '../utilities/geometry/getBoundingBoxFromPlanes';
import { Changes } from '../domainObjectsHelpers/Changes';
import { type CogniteClient } from '@cognite/sdk';
import { type BaseTool } from '../commands/BaseTool';
import { ContextMenuController } from './ContextMenuController';
import { InstanceStylingController } from './InstanceStylingController';
import { type Class } from '../domainObjectsHelpers/Class';
import { CdfCaches } from './CdfCaches';
import { type DmsUniqueIdentifier } from '../../../data-providers';
import { type Image360Model, type PointCloud } from '../../concrete/reveal/RevealTypes';

const DIRECTIONAL_LIGHT_NAME = 'DirectionalLight';

export type RevealRenderTargetOptions = {
  coreDmOnly?: boolean;
};

export class RevealRenderTarget {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _commandsController: CommandsController;
  private readonly _rootDomainObject: RootDomainObject;
  private readonly _contextmenuController: ContextMenuController;
  private readonly _cdfCaches: CdfCaches;
  private readonly _instanceStylingController: InstanceStylingController;

  private _ambientLight: AmbientLight | undefined;
  private _directionalLight: DirectionalLight | undefined;
  private _clippedBoundingBox: Box3 | undefined;
  private _cropBoxUniqueId: number | undefined = undefined;
  private _axisGizmoTool: AxisGizmoTool | undefined;
  private _config: BaseRevealConfig | undefined = undefined;

  public readonly toViewerMatrix = CDF_TO_VIEWER_TRANSFORMATION.clone();
  public readonly fromViewerMatrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
  public ghostMode = false;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  constructor(
    viewer: Cognite3DViewer<DataSourceType>,
    sdk: CogniteClient,
    options?: RevealRenderTargetOptions
  ) {
    this._viewer = viewer;

    const cameraManager = this.cameraManager;
    if (!isFlexibleCameraManager(cameraManager)) {
      throw new Error('Can not use RevealRenderTarget without the FlexibleCameraManager');
    }

    const coreDmOnly = options?.coreDmOnly ?? false;
    this._cdfCaches = new CdfCaches(sdk, viewer, { coreDmOnly });
    this._commandsController = new CommandsController(this.domElement);
    this._commandsController.addEventListeners();
    this._contextmenuController = new ContextMenuController();
    this._instanceStylingController = new InstanceStylingController();
    this._rootDomainObject = new RootDomainObject(this, sdk);

    this.initializeLights();
    this._viewer.on('cameraChange', this.cameraChangeHandler);

    this.setConfig(new DefaultRevealConfig());
  }

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get viewer(): Cognite3DViewer<DataSourceType> {
    return this._viewer;
  }

  public get isInside360Image(): boolean {
    return this._viewer.canDoImage360Action(Image360Action.Exit);
  }

  public get active360ImageId(): string | DmsUniqueIdentifier | undefined {
    return this._viewer.getActive360ImageInfo()?.image360.id;
  }

  public get config(): BaseRevealConfig | undefined {
    return this._config;
  }

  public get rootDomainObject(): RootDomainObject {
    return this._rootDomainObject;
  }

  public get canvas(): HTMLCanvasElement {
    return this._viewer.canvas;
  }

  public get domElement(): HTMLElement {
    return this._viewer.domElement;
  }

  public get commandsController(): CommandsController {
    return this._commandsController;
  }

  public get contextMenuController(): ContextMenuController {
    return this._contextmenuController;
  }

  public get cdfCaches(): CdfCaches {
    return this._cdfCaches;
  }

  public get instanceStylingController(): InstanceStylingController {
    return this._instanceStylingController;
  }

  public get cursor(): string {
    return this.domElement.style.cursor;
  }

  public set cursor(value: string | undefined) {
    this.domElement.style.cursor = value ?? 'default';
  }

  public get cameraManager(): CameraManager {
    return this.viewer.cameraManager;
  }

  public get flexibleCameraManager(): IFlexibleCameraManager {
    const cameraManager = this.cameraManager;
    if (!isFlexibleCameraManager(cameraManager)) {
      throw new Error('Camera manager is not flexible');
    }
    return cameraManager;
  }

  public get camera(): PerspectiveCamera {
    return this.cameraManager.getCamera();
  }

  // ==================================================
  // INSTANCE PROPERTIES: Get bounding box
  // ==================================================

  public get clippedVisualSceneBoundingBox(): Box3 {
    if (this._clippedBoundingBox === undefined) {
      return this.visualSceneBoundingBox;
    }
    const boundingBox = this.visualSceneBoundingBox.clone();
    boundingBox.intersect(this._clippedBoundingBox);
    return boundingBox;
  }

  public get sceneBoundingBox(): Box3 {
    return this.viewer.getSceneBoundingBox();
  }

  public get visualSceneBoundingBox(): Box3 {
    return this.viewer.getVisualSceneBoundingBox();
  }

  // ==================================================
  // INSTANCE METHODS: Get models from the viewer
  // ==================================================

  public *getPointClouds(): Generator<PointCloud> {
    for (const model of this.viewer.models) {
      if (model instanceof CognitePointCloudModel) {
        yield model;
      }
    }
  }

  public *getCadModels(): Generator<CogniteCadModel> {
    for (const model of this.viewer.models) {
      if (model instanceof CogniteCadModel) {
        yield model;
      }
    }
  }

  public *get360ImageCollections(): Generator<Image360Model> {
    for (const collection of this.viewer.get360ImageCollections()) {
      yield collection;
    }
  }

  // ==================================================
  // INSTANCE METHODS: Convert back and from Viewer coordinates
  // ==================================================

  public convertFromViewerCoordinates(point: Vector3): Vector3 {
    const clone = point.clone();
    clone.applyMatrix4(this.fromViewerMatrix);
    return clone;
  }

  public convertToViewerCoordinates(point: Vector3): Vector3 {
    const clone = point.clone();
    clone.applyMatrix4(this.toViewerMatrix);
    return clone;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public setDefaultTool(tool: BaseTool): boolean {
    const defaultTool = this.commandsController.defaultTool;
    if (defaultTool !== undefined && tool.equals(defaultTool)) {
      return false;
    }
    const oldTool = this.commandsController.getEqual(tool) as BaseTool;
    if (oldTool !== undefined) {
      return this.commandsController.setDefaultTool(oldTool);
    }
    tool.attach(this);
    this.commandsController.add(tool);
    return this.commandsController.setDefaultTool(tool);
  }

  public setActiveToolByType<T extends BaseTool>(classType: Class<T>): boolean {
    return this.commandsController.setActiveToolByType(classType);
  }

  public setConfig(config: BaseRevealConfig): void {
    this._config = config;

    this.setDefaultTool(config.createDefaultTool());
    const axisGizmoTool = config.createAxisGizmoTool();
    if (axisGizmoTool !== undefined) {
      axisGizmoTool.connect(this._viewer);
      this._axisGizmoTool = axisGizmoTool;
    }
  }

  public onStartup(): void {
    this._config?.onStartup(this);
    CommandsUpdater.update(this);
  }

  public dispose(): void {
    this._viewer.dispose();
    if (this._ambientLight !== undefined) {
      this._viewer.removeObject3D(this._ambientLight);
    }
    if (this._directionalLight !== undefined) {
      this._viewer.removeObject3D(this._directionalLight);
    }
    this.commandsController.removeEventListeners();
    this.commandsController.dispose();
    this._axisGizmoTool?.dispose();
    CommandsUpdater.dispose();
  }

  public invalidate(): void {
    this._viewer.requestRedraw();
  }

  private initializeLights(): void {
    this._ambientLight = new AmbientLight(0xffffff, 0.25); // soft white light
    this._directionalLight = new DirectionalLight(0xffffff, 2);
    this._directionalLight.name = DIRECTIONAL_LIGHT_NAME;
    this._directionalLight.position.set(0, 1, 0);

    const ambientLight = new CustomObject(this._ambientLight);
    const directionalLight = new CustomObject(this._directionalLight);
    ambientLight.isPartOfBoundingBox = false;
    directionalLight.isPartOfBoundingBox = false;

    this.viewer.addCustomObject(ambientLight);
    this.viewer.addCustomObject(directionalLight);
  }

  // ==================================================
  // EVENT HANDLERS
  // ==================================================

  cameraChangeHandler = (_position: Vector3, _target: Vector3): void => {
    const light = this._directionalLight;
    if (light === undefined) {
      return;
    }
    const camera = this.camera;

    // Get camera direction
    const cameraDirection = new Vector3();
    camera.getWorldDirection(cameraDirection);

    cameraDirection.negate();
    light.position.copy(cameraDirection);
  };

  // ==================================================
  // INSTANCE METHODS: Fit operations
  // ==================================================

  public fitView(): boolean {
    this.viewer.fitCameraToBoundingBox(this.clippedVisualSceneBoundingBox);
    return true;
  }

  // ==================================================
  // INSTANCE METHODS: Clipping operations (Experimental code)
  // ==================================================

  public getGlobalClippingPlanes(): Plane[] {
    return this.viewer.getGlobalClippingPlanes();
  }

  public get isGlobalClippingActive(): boolean {
    return this.getGlobalClippingPlanes().length > 0;
  }

  public get isGlobalCropBoxActive(): boolean {
    return this.isGlobalClippingActive && this._cropBoxUniqueId !== undefined;
  }

  public isGlobalCropBox(domainObject: DomainObject): boolean {
    return this._cropBoxUniqueId !== undefined && domainObject.uniqueId === this._cropBoxUniqueId;
  }

  public setGlobalClipping(clippingPlanes: Plane[], domainObject?: DomainObject): void {
    if (clippingPlanes.length === 0) {
      this.clearGlobalClipping();
      return;
    }
    const sceneBoundingBox = this.sceneBoundingBox.clone();
    sceneBoundingBox.applyMatrix4(this.fromViewerMatrix);
    const sceneRange = new Range3();
    sceneRange.copy(sceneBoundingBox);
    const clippedRange = getBoundingBoxFromPlanes(clippingPlanes, sceneRange);
    const clippedBoundingBox = clippedRange.getBox();

    for (const plane of clippingPlanes) {
      plane.applyMatrix4(this.toViewerMatrix);
    }
    clippedBoundingBox.applyMatrix4(this.toViewerMatrix);

    // Set the values
    this.viewer.setGlobalClippingPlanes(clippingPlanes);
    this._clippedBoundingBox = clippedBoundingBox;
    this._cropBoxUniqueId = domainObject?.uniqueId;
    this.rootDomainObject.notifyDescendants(Changes.clipping);
  }

  public clearGlobalClipping(): void {
    this.viewer.setGlobalClippingPlanes([]);
    this._clippedBoundingBox = undefined;
    this._cropBoxUniqueId = undefined;
    this.rootDomainObject.notifyDescendants(Changes.clipping);
  }

  // ==================================================
  // INSTANCE METHODS: Cursor
  // See: https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
  // ==================================================

  public setDefaultCursor(): void {
    this.cursor = 'default';
  }

  public setNavigateCursor(): void {
    this.cursor = 'pointer';
  }

  public setCrosshairCursor(): void {
    this.cursor = 'crosshair';
  }

  /**
   * Sets the resize cursor based on two points in 3D space to the resize
   * // cursor has a correct direction.
   * @param point1 - The first point in CDF space.
   * @param point2 - The second point in CDF space.
   */
  public getResizeCursor(point1: Vector3, point2: Vector3): string | undefined {
    point1 = this.convertToViewerCoordinates(point1);
    point2 = this.convertToViewerCoordinates(point2);

    const screenPoint1 = this.viewer.worldToScreen(point1, false);
    if (screenPoint1 === null) {
      return undefined;
    }
    const screenPoint2 = this.viewer.worldToScreen(point2, false);
    if (screenPoint2 === null) {
      return undefined;
    }
    const screenVector = screenPoint2?.sub(screenPoint1).normalize();
    screenVector.y = -screenVector.y; // Flip y axis so the x-y axis is mathematically correct
    return getResizeCursor(getOctDir(screenVector));
  }
}
