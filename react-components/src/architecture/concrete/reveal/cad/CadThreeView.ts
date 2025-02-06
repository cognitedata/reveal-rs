/*!
 * Copyright 2025 Cognite AS
 */

import { type CadRenderStyle } from './CadRenderStyle';
import { type CadDomainObject } from './CadDomainObject';
import { Box3 } from 'three';
import { type CogniteCadModel } from '@cognite/reveal';
import { ThreeView } from '../../../base/views/ThreeView';
import { type DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';

export class CadThreeView extends ThreeView<CadDomainObject> {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected override get style(): CadRenderStyle {
    return super.style as CadRenderStyle;
  }

  public get model(): CogniteCadModel | undefined {
    const domainObject = this.domainObject;
    return domainObject.model;
  }

  // ==================================================
  // OVERRIDES of BaseView
  // ==================================================

  public override update(change: DomainObjectChange): void {
    super.update(change);
    if (change.isChanged(Changes.renderStyle)) {
      this.invalidateRenderTarget();
    }
  }

  public override onShow(): void {
    const model = this.model;
    if (model === undefined) {
      return;
    }
    super.onShow();
    model.visible = true;
  }

  public override onHide(): void {
    const model = this.model;
    if (model === undefined) {
      return;
    }
    model.visible = false;
    super.onHide();
  }

  // ==================================================
  // OVERRIDES of ThreeView
  // ==================================================

  protected override calculateBoundingBox(): Box3 {
    const model = this.model;
    if (model === undefined) {
      return new Box3().makeEmpty();
    }
    const boundingBox = new Box3();
    return model.getModelBoundingBox(boundingBox, true);
  }
}
