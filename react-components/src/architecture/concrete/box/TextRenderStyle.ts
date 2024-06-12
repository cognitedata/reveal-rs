/*!
 * Copyright 2024 Cognite AS
 */

import { ColorType } from '../../base/domainObjectsHelpers/ColorType';
import { RenderStyle } from '../../base/domainObjectsHelpers/RenderStyle';
import { Color } from 'three';
import { WHITE_COLOR } from '../../base/utilities/colors/colorExtensions';

export abstract class TextRenderStyle extends RenderStyle {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  // For the object itself
  public depthTest = true;
  public colorType = ColorType.Specified;

  // For text only
  public showText = true;
  public textColor = WHITE_COLOR.clone();
  public textBgColor = new Color('#232323');
  public textOpacity = 0.9;
  public relativeTextSize = 0.05; // Relative to diagonal of the object for box and average of length of line segments for line
}
