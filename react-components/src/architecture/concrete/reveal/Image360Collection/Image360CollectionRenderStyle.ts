/*!
 * Copyright 2025 Cognite AS
 */

import { cloneDeep } from 'lodash';
import { RenderStyle } from '../../../base/renderStyles/RenderStyle';

export class Image360CollectionRenderStyle extends RenderStyle {
  public override clone(): RenderStyle {
    return cloneDeep<Image360CollectionRenderStyle>(this);
  }
}
