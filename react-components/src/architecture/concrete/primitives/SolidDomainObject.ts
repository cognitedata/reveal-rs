/*!
 * Copyright 2024 Cognite AS
 */

import { type SolidPrimitiveRenderStyle } from './SolidPrimitiveRenderStyle';
import { type Box3, type Matrix4, type Vector3 } from 'three';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { BoxFace } from '../../base/utilities/box/BoxFace';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { type PrimitiveType } from './PrimitiveType';
import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { getIconByPrimitiveType } from '../measurements/getIconByPrimitiveType';
import { DomainObjectTransaction } from '../../base/undo/DomainObjectTransaction';
import { type Transaction } from '../../base/undo/Transaction';

export const MIN_SIZE = 0.01;

export abstract class SolidDomainObject extends VisualDomainObject {
  // For focus when edit in 3D (Used when isSelected is true only)
  public focusType: FocusType = FocusType.None;
  public focusFace: BoxFace | undefined = undefined;

  public static GizmoOnly = 'GizmoOnly';

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get renderStyle(): SolidPrimitiveRenderStyle {
    return this.getRenderStyle() as SolidPrimitiveRenderStyle;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  protected constructor() {
    super();
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return getIconByPrimitiveType(this.primitiveType);
  }

  public override get isLegal(): boolean {
    return this.focusType !== FocusType.Pending;
  }

  public override createTransaction(changed: symbol): Transaction {
    return new DomainObjectTransaction(this, changed);
  }

  // ==================================================
  // VIRTUAL METHODS (To be overridden)
  // ==================================================

  public abstract get primitiveType(): PrimitiveType;

  public canRotateComponent(_component: number): boolean {
    return true;
  }

  public abstract getBoundingBox(): Box3;

  public abstract getRotationMatrix(): Matrix4;

  public abstract getScaledMatrix(scale: Vector3): Matrix4;

  public abstract getMatrix(): Matrix4;

  public abstract setMatrix(matrix: Matrix4): void;

  public clear(): void {
    this.focusType = FocusType.None;
    this.focusFace = undefined;
  }

  // ==================================================
  // INSTANCE METHODS: Others
  // ==================================================

  public setFocusInteractive(focusType: FocusType, focusFace?: BoxFace): boolean {
    const changeFromPending =
      this.focusType === FocusType.Pending && focusType !== FocusType.Pending;
    if (focusType === FocusType.None) {
      if (this.focusType === FocusType.None) {
        return false; // No change
      }
      this.focusType = FocusType.None;
      this.focusFace = undefined; // Ignore input face
    } else {
      if (focusType === this.focusType && BoxFace.equals(this.focusFace, focusFace)) {
        return false; // No change
      }
      this.focusType = focusType;
      this.focusFace = focusFace;
    }
    this.notify(Changes.focus);
    if (changeFromPending) {
      this.notify(Changes.geometry);
    }
    return true;
  }

  public static isValidSize(value: number): boolean {
    return value > MIN_SIZE;
  }
}
