/*!
 * Copyright 2024 Cognite AS
 */

import { BoxDomainObject } from '../boxAndLines/BoxDomainObject';
import { Color, type Vector3 } from 'three';
import { BoxRenderStyle } from '../boxAndLines/BoxRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';

export const MIN_BOX_SIZE = 0.01;

export class GizmoBoxDomainObject extends BoxDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(center: Vector3, size: Vector3, zRotation: number) {
    super();
    this.center.copy(center);
    this.size.copy(size);
    this.zRotation = zRotation;
    this.color = new Color(Color.NAMES.white);
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): string {
    return 'Gizmo box';
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new BoxRenderStyle();
    style.showText = false;
    return style;
  }
}
