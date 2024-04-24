/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObjectChange } from '../utilities/DomainObjectChange';
import { BaseView } from './BaseView';
import { Range3 } from '../Geometry/Range3';
import { Changes } from '../utilities/Changes';
import { type RenderStyle } from '../utilities/RenderStyle';
import { type RevealRenderTarget } from '../RenderTarget/RevealRenderTarget';
import { type DomainObject } from '../DomainObject/DomainObject';

export abstract class BaseThreeView extends BaseView {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _boundingBox: Range3 | undefined = undefined;
  private _target: RevealRenderTarget | undefined = undefined;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get hasRenderTarget(): boolean {
    return this._target !== undefined;
  }

  public get renderTarget(): RevealRenderTarget {
    if (this._target === undefined) {
      throw Error('The RevealRenderTarget is missing in the view');
    }
    return this._target;
  }

  protected get style(): RenderStyle | undefined {
    return this.domainObject.getRenderStyle();
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.geometry)) {
      this.touchBoundingBox();
    }
    this.invalidate();
  }

  public override clearMemory(): void {
    super.clearMemory();
    this.touchBoundingBox();
  }

  public override onShow(): void {
    super.onShow();
    this.invalidate();
  }

  public override onHide(): void {
    super.onHide();
    this.invalidate();
  }

  public override dispose(): void {
    super.dispose();
    this._target = undefined;
  }

  // ==================================================
  // VIRTUAL METHODS
  // ==================================================

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  public abstract get isVisible(): boolean;

  protected calculateBoundingBox(): Range3 {
    // Override this function to recalculate the bounding box of the view
    return Range3.empty;
  }

  public shouldPick(): boolean {
    return true; // To be overriudden
  }

  // ==================================================
  // INSTANCE METHODS:
  // ==================================================

  public get boundingBox(): Range3 | undefined {
    if (this._boundingBox === undefined) {
      this._boundingBox = this.calculateBoundingBox();
    }
    return this._boundingBox;
  }

  protected touchBoundingBox(): void {
    this._boundingBox = undefined;
  }

  public attach(domainObject: DomainObject, target: RevealRenderTarget): void {
    this.domainObject = domainObject;
    this._target = target;
  }

  protected invalidate(): void {
    this.renderTarget.invalidate();
  }
}
