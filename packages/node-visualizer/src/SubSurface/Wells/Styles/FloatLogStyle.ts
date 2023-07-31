//= ====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//= ====================================================================================

import cloneDeep from 'lodash/cloneDeep';

import { TargetId } from '../../../Core/Primitives/TargetId';
import { BaseRenderStyle } from '../../../Core/Styles/BaseRenderStyle';
import { ColorType } from '../../../Core/Enums/ColorType';
import { BaseStyle } from '../../../Core/Styles/BaseStyle';
import { BasePropertyFolder } from '../../../Core/Property/Base/BasePropertyFolder';
import { ColorTypeProperty } from '../../../Core/Property/Concrete/Property/ColorTypeProperty';
import { NumberProperty } from '../../../Core/Property/Concrete/Property/NumberProperty';
import { BandPosition } from '../../../Core/Enums/BandPosition';
import { BandPositionProperty } from '../../../Core/Property/Concrete/Property/BandPositionProperty';
import { BooleanProperty } from '../../../Core/Property/Concrete/Property/BooleanProperty';

export class FloatLogStyle extends BaseRenderStyle {
  //= =================================================
  // INSTANCE FIELDS
  //= =================================================

  public fillColorType = new ColorTypeProperty({
    use: true,
    name: 'Fill Color Type',
    value: ColorType.ColorMap,
  });

  public strokeColorType = new ColorTypeProperty({
    use: true,
    name: 'Stroke Color Type',
    value: ColorType.Specified,
  });

  public bandPosition = new BandPositionProperty({
    name: 'Band Position',
    value: BandPosition.Automatic,
  });

  public lineWidth = new NumberProperty({
    name: 'Stroke',
    value: 2,
    options: [1, 2, 3, 4, 5],
  });

  public min = new NumberProperty({
    name: 'Minimum',
    value: Number.NaN,
    use: false,
  });

  public max = new NumberProperty({
    name: 'Maximum',
    value: Number.NaN,
    use: false,
  });

  public reverse = new BooleanProperty({ name: 'Reverse Scale', value: false });

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(targetId: TargetId) {
    super(targetId);
  }

  //= =================================================
  // OVERRIDES of BaseStyle
  //= =================================================

  public /* override */ clone(): BaseStyle {
    return cloneDeep<FloatLogStyle>(this);
  }

  protected /* override */ populateCore(folder: BasePropertyFolder) {
    super.populateCore(folder);

    this.lineWidth.isEnabledDelegate = () => this.strokeColorType.use;
    this.fillColorType.solid = true;

    folder.addChild(this.bandPosition);
    folder.addChild(this.fillColorType);
    folder.addChild(this.strokeColorType);
    folder.addChild(this.lineWidth);
    folder.addChild(this.min);
    folder.addChild(this.max);
    folder.addChild(this.reverse);
  }
}
