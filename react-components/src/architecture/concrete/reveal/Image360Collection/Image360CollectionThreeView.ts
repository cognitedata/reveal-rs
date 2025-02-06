/*!
 * Copyright 2025 Cognite AS
 */

import { type Image360CollectionRenderStyle } from './Image360CollectionRenderStyle';
import { type Image360CollectionDomainObject } from './Image360CollectionDomainObject';
import { Box3, Vector3 } from 'three';
import { ThreeView } from '../../../base/views/ThreeView';
import { type DomainObjectChange } from '../../../base/domainObjectsHelpers/DomainObjectChange';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type Image360Model } from '../RevealTypes';

export class Image360CollectionThreeView extends ThreeView<Image360CollectionDomainObject> {
  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  protected override get style(): Image360CollectionRenderStyle {
    return super.style as Image360CollectionRenderStyle;
  }

  public get model(): Image360Model | undefined {
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
    model.setIconsVisibility(true);
  }

  public override onHide(): void {
    const model = this.model;
    if (model === undefined) {
      return;
    }
    model.setIconsVisibility(false);
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
    const boundingBox = new Box3().makeEmpty();
    const position = new Vector3();
    for (const entity of model.image360Entities) {
      position.setFromMatrixPosition(entity.transform);
      boundingBox.expandByPoint(position);
    }
    return boundingBox;
  }
}
