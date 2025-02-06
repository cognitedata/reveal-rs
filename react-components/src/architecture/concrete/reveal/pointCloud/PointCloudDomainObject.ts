/*!
 * Copyright 2025 Cognite AS
 */

import { VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../../base/renderStyles/RenderStyle';
import { type IconName } from '../../../base/utilities/IconName';
import { type TranslationInput } from '../../../base/utilities/TranslateInput';
import { type ThreeView } from '../../../base/views/ThreeView';
import { type PointCloud } from '../RevealTypes';
import { PointCloudRenderStyle } from './PointCloudRenderStyle';
import { PointCloudThreeView } from './PointCloudThreeView';

export class PointCloudDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  readonly _model: PointCloud;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get model(): PointCloud | undefined {
    return this._model;
  }
  // ==================================================
  // CONSTRUCTORS
  // ==================================================

  public constructor(model: PointCloud) {
    super();
    this._model = model;
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get typeName(): TranslationInput {
    return { untranslated: 'PointCloud' };
  }

  public override get icon(): IconName {
    return 'PointCloud';
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new PointCloudRenderStyle();
  }

  protected override removeCore(): void {
    super.removeCore();
    this.rootDomainObject?.renderTarget?.viewer?.removeModel(this._model);
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new PointCloudThreeView();
  }
}
