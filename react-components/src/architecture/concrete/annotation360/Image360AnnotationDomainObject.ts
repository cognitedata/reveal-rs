/*!
 * Copyright 2024 Cognite AS
 */

import { type DomainObject } from '../../base/domainObjects/DomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { PrimitiveType } from '../../base/utilities/primitives/PrimitiveType';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { LineDomainObject } from '../primitives/line/LineDomainObject';
import { Color } from 'three';
import { LineRenderStyle } from '../primitives/line/LineRenderStyle';

export class Image360AnnotationDomainObject extends LineDomainObject {
  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super(PrimitiveType.Polygon);
    this.color = new Color(Color.NAMES.red);
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get typeName(): TranslateKey {
    return { fallback: 'Annotation polygon' };
  }

  public override clone(what?: symbol): DomainObject {
    const clone = new Image360AnnotationDomainObject();
    clone.copyFrom(this, what);
    return clone;
  }

  public override get hasPanelInfo(): boolean {
    return false;
  }

  public override createRenderStyle(): RenderStyle | undefined {
    const style = new LineRenderStyle();
    style.showLabel = false;
    style.pipeRadius = 0;
    style.selectedPipeRadius = 2 * style.pipeRadius;
    style.depthTest = false;
    style.transparent = true; // Needed to make the line visible through other objects
    return style;
  }
}
