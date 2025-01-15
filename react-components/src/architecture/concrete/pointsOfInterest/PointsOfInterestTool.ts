/*!
 * Copyright 2024 Cognite AS
 */
import { type TranslationInput } from '../../base/utilities/TranslateInput';
import { PointsOfInterestDomainObject } from './PointsOfInterestDomainObject';
import { isPointsOfInterestIntersection } from './types';
import { type IconName } from '../../base/utilities/IconName';
import { PointsOfInterestAdsProvider } from './ads/PointsOfInterestAdsProvider';
import { type Vector3 } from 'three';
import { type PointsOfInterestProvider } from './PointsOfInterestProvider';
import { type AnchoredDialogContent } from '../../base/commands/BaseTool';
import { AnchoredDialogUpdater } from '../../base/reactUpdaters/AnchoredDialogUpdater';
import { CreatePointsOfInterestWithDescriptionCommand } from './CreatePointsOfInterestWithDescriptionCommand';
import { type RevealRenderTarget } from '../../base/renderTarget/RevealRenderTarget';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { getInstancesFromClick } from '../../../utilities/getInstancesFromClick';
import { DefaultNodeAppearance } from '@cognite/reveal';
import { createInstanceStyleGroup } from '../../../components/Reveal3DResources/instanceStyleTranslation';
import { type InstanceReference } from '../../../utilities/instanceIds';

const ASSIGNED_INSTANCE_STYLING_SYMBOL = Symbol('poi3d-assigned-instance-styling');

export class PointsOfInterestTool<PoiIdType> extends BaseEditTool {
  private _isCreating: boolean = false;

  private _anchoredDialogContent: AnchoredDialogContent | undefined;

  public override get icon(): IconName {
    return 'Waypoint';
  }

  public override get shortCutKey(): string {
    return 'P';
  }

  public override onEscapeKey(): void {
    this.closeCreateCommandDialog();
  }

  public override get tooltip(): TranslationInput {
    return { key: 'POINT_OF_INTEREST_CREATE' };
  }

  public override onActivate(): void {
    super.onActivate();
    let domainObject = this.getPointsOfInterestDomainObject();
    if (domainObject === undefined) {
      domainObject = this.initializePointsOfInterestDomainObject();
    }
    domainObject.setVisibleInteractive(true, this.renderTarget);
    this.setIsCreating(true);
    this.setCursor('copy');
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    const domainObject = this.getPointsOfInterestDomainObject();
    domainObject.setSelectedPointOfInterest(undefined);
    this.setIsCreating(false);
    this.setCursor('default');
    this.setAssignedInstance(undefined);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    if (this._isCreating) {
      await this.initiateCreatePointOfInterest(event);
      this.setIsCreating(false);
      return;
    }
    await this.selectOverlayFromClick(event);
  }

  public override attach(renderTarget: RevealRenderTarget): void {
    super.attach(renderTarget);
    this.initializePointsOfInterestDomainObject();
  }

  public override getAnchoredDialogContent(): AnchoredDialogContent | undefined {
    return this._anchoredDialogContent;
  }

  public getPointsOfInterestDomainObject(): PointsOfInterestDomainObject<PoiIdType> {
    return this.initializePointsOfInterestDomainObject();
  }

  public initializePointsOfInterestDomainObject(): PointsOfInterestDomainObject<PoiIdType> {
    const oldPoiDomainObject = this.rootDomainObject.getDescendantByType(
      PointsOfInterestDomainObject
    );

    if (oldPoiDomainObject !== undefined) {
      return oldPoiDomainObject;
    }

    const domainObject = new PointsOfInterestDomainObject(
      new PointsOfInterestAdsProvider(
        this.rootDomainObject.sdk
      ) as unknown as PointsOfInterestProvider<PoiIdType>
    );
    this.rootDomainObject.addChildInteractive(domainObject);
    return domainObject;
  }

  public get isCreating(): boolean {
    return this._isCreating;
  }

  public setIsCreating(value: boolean): void {
    this._isCreating = value;
    if (value) {
      this.renderTarget.setCrosshairCursor();
    } else {
      this.renderTarget.setNavigateCursor();
    }
  }

  private setAssignedInstance(instance: InstanceReference | undefined): void {
    if (instance === undefined) {
      this.renderTarget.instanceStylingController.setStylingGroup(
        ASSIGNED_INSTANCE_STYLING_SYMBOL,
        undefined
      );
      return;
    }

    const stylingGroup = createInstanceStyleGroup([instance], DefaultNodeAppearance.Highlighted);

    this.renderTarget.instanceStylingController.setStylingGroup(
      ASSIGNED_INSTANCE_STYLING_SYMBOL,
      stylingGroup
    );
  }

  private setAnchoredDialogContent(dialogContent: AnchoredDialogContent | undefined): void {
    this._anchoredDialogContent = dialogContent;
    AnchoredDialogUpdater.update();
  }

  public openCreateCommandDialog(position: Vector3, clickEvent: PointerEvent): void {
    const poiObject = this.getPointsOfInterestDomainObject();

    const scene = poiObject?.getScene();
    if (scene === undefined) {
      return;
    }

    const createPointCommand = new CreatePointsOfInterestWithDescriptionCommand(position, scene);
    createPointCommand.attach(this.renderTarget);

    const customListeners = [
      {
        eventName: 'keydown',
        callback: (event: Event): void => {
          if (event instanceof KeyboardEvent && event.key === 'Escape') {
            this.onEscapeKey();
          }
        }
      }
    ];

    const onFinishCallback = (): void => {
      this.closeCreateCommandDialog();
    };

    const onCancelCallback = (): void => {
      onFinishCallback();
    };

    createPointCommand.onFinish = onFinishCallback;
    createPointCommand.onCancel = onCancelCallback;

    this.setAnchoredDialogContent({
      contentCommands: [createPointCommand],
      position,
      onCloseCallback: onCancelCallback,
      customListeners
    });

    void getInstancesFromClick(this.renderTarget, clickEvent).then((instances) => {
      if (instances !== undefined && instances.length !== 0) {
        const selectedInstance = instances[0];

        this.setAssignedInstance(selectedInstance);
        createPointCommand.associatedInstance = selectedInstance;
        createPointCommand.setCustomInputAsInstanceReference(selectedInstance);
      }
    });
  }

  public closeCreateCommandDialog(): void {
    this.setAnchoredDialogContent(undefined);
    this.renderTarget.commandsController.activateDefaultTool();
  }

  private async selectOverlayFromClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);

    if (intersection === undefined || !isPointsOfInterestIntersection(intersection)) {
      await super.onClick(event);
      return;
    }

    intersection.domainObject.setSelectedPointOfInterest(intersection.userData);
  }

  private async initiateCreatePointOfInterest(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined || isPointsOfInterestIntersection(intersection)) {
      this.closeCreateCommandDialog();
      return;
    }

    this.openCreateCommandDialog(intersection.point, event);
  }
}
