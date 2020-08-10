//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import * as Lodash from 'lodash';

import { TargetId } from "@/Core/Primitives/TargetId";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { ColorType } from "@/Core/Enums/ColorType";
import { PropertyFolder } from "@/Core/Property/Concrete/Folder/PropertyFolder";

export class CasingLogStyle extends BaseRenderStyle
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public colorType = ColorType.Specified;

  public opacity = 0.7; // Slider for 0 to 1

  public radiusFactor = 1; // Radius in 3D = radiusFactor * casing.radius

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(targetId: TargetId) { super(targetId); }

  //==================================================
  // OVERRIDES of BaseRenderStyle
  //==================================================

  public /*override*/ clone(): BaseRenderStyle { return Lodash.cloneDeep<CasingLogStyle>(this); }

  protected /*override*/ populateCore(folder: PropertyFolder)
  {
    super.populateCore(folder);
  }
}
