/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { BoxRenderStyle } from './BoxRenderStyle';
import { type RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { BoxThreeView } from './BoxThreeView';
import { Matrix4, Vector3 } from 'three';

export class BoxDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public readonly scale: Vector3 = new Vector3(1, 1, 1);
  public readonly center: Vector3 = new Vector3(0, 0, 0);
  public readonly zRotation: number = 0;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get matrix(): Matrix4 {
    const matrix = new Matrix4();
    matrix.makeRotationZ(this.zRotation);
    matrix.setPosition(this.center.clone());
    matrix.scale(this.scale.clone());
    return matrix;
  }

  public get renderStyle(): BoxRenderStyle | undefined {
    return this.getRenderStyle() as BoxRenderStyle;
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  // eslint-disable-next-line @typescript-eslint/class-literal-property-style
  public override get typeName(): string {
    return 'Box';
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new BoxRenderStyle();
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new BoxThreeView();
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  public setDelta(index:number, value: number): void
  {
    setComponent(index: number, value: number): this;
        switch(dimension)
    {
      case 1:
        vector.x += value;
        break;
      case 2:
        this.scale.y += value;
        break;
      case 3:
        this.scale.z += value;
        break;

    }

  }
}
