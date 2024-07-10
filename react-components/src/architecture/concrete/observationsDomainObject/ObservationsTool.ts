/*!
 * Copyright 2024 Cognite AS
 */
import { type IconType } from '@cognite/cogs.js';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { ObservationsDomainObject } from './ObservationsDomainObject';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { CreateObservationCommand } from './CreateObservationCommand';
import { first, sortBy } from 'lodash';
import { isDefined } from '../../../utilities/isDefined';
import { SaveObservationsCommand } from './SaveObservationsCommand';
import { DeleteObservationCommand } from './DeleteObservationCommand';
import { createEmptyObservationProperties } from './types';

export class ObservationsTool extends BaseEditTool {
  private _isCreating: boolean = false;

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof ObservationsDomainObject;
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

  public override get icon(): IconType {
    return 'Location';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Show and edit observations' };
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new CreateObservationCommand(),
      new DeleteObservationCommand(),
      new SaveObservationsCommand()
    ];
  }

  public override onActivate(): void {
    let domainObject = this.getObservationsDomainObject();
    if (domainObject === undefined) {
      domainObject = new ObservationsDomainObject(this.renderTarget.fdmSdk);
      this.renderTarget.rootDomainObject.addChild(domainObject);
    }
    domainObject.setVisibleInteractive(true, this.renderTarget);
  }

  public override onDeactivate(): void {
    const domainObject = this.getObservationsDomainObject();
    domainObject?.setSelectedObservation(undefined);
    domainObject?.setVisibleInteractive(false, this.renderTarget);
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    if (this._isCreating) {
      await this.createPendingObservation(event);
      return;
    }
    await this.selectOverlayFromClick(event);
  }

  public getObservationsDomainObject(): ObservationsDomainObject | undefined {
    return this.rootDomainObject.getDescendantByType(ObservationsDomainObject);
  }

  public async save(): Promise<void> {
    const domainObject = this.getObservationsDomainObject();
    await domainObject?.save();
  }

  private async selectOverlayFromClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);

    const domainObject = this.getIntersectedSelectableDomainObject(intersection);
    if (!(domainObject instanceof ObservationsDomainObject)) {
      await super.onClick(event);
      return;
    }

    const camera = this.renderTarget.camera;
    const normalizedCoords = this.getNormalizedPixelCoordinates(event);

    const intersectedOverlay = domainObject.overlayCollections
      .map((collection) => collection.intersectOverlays(normalizedCoords, camera))
      .filter(isDefined);

    sortBy(intersectedOverlay, (overlay) =>
      camera.position.distanceToSquared(overlay.getPosition())
    );

    domainObject.setSelectedObservation(first(intersectedOverlay));
  }

  private async createPendingObservation(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);

    if (intersection === undefined) {
      return;
    }

    const domainObject = this.getObservationsDomainObject();
    const pendingOverlay = domainObject?.addPendingObservation(
      intersection.point,
      createEmptyObservationProperties(intersection.point)
    );
    domainObject?.setSelectedObservation(pendingOverlay);
    this.renderTarget.invalidate();

    this.setIsCreating(false);
  }
}
