/*!
 * Copyright 2025 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { RenderStyle } from '../../../base/renderStyles/RenderStyle';

export class PointCloudRenderStyle extends RenderStyle {
  public override clone(): RenderStyle {
    return cloneDeep<PointCloudRenderStyle>(this);
  }
}
