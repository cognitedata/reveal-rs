/*!
 * Copyright 2024 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { type RenderStyle } from '../../../base/domainObjectsHelpers/RenderStyle';
import { DepthTestRenderStyle } from '../DepthTestRenderStyle';
import { BLACK_COLOR, WHITE_COLOR } from '../../../base/utilities/colors/colorExtensions';

export class PlaneRenderStyle extends DepthTestRenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public showSolid = true;
  public showLines = true;
  public linesColor = BLACK_COLOR.clone();
  public selectedLinesColor = WHITE_COLOR.clone();
  public opacityUse = true;
  public opacity = 0.5;
  public selectedOpacity = 0.8;

  // ==================================================
  // OVERRIDES of BaseStyle
  // ==================================================

  public override clone(): RenderStyle {
    return cloneDeep<PlaneRenderStyle>(this);
  }
}
