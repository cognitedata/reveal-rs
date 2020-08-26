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

import * as Lodash from "lodash";
import { TargetId } from "@/Core/Primitives/TargetId";
import { BaseRenderStyle } from "@/Core/Styles/BaseRenderStyle";
import { ContoursStyle } from "@/Core/Styles/ContoursStyle";
import { SolidStyle } from "@/Core/Styles/SolidStyle";
import { BaseStyle } from "@/Core/Styles/BaseStyle";
import BasePropertyFolder from "@/Core/Property/Base/BasePropertyFolder";

export class SurfaceRenderStyle extends BaseRenderStyle
{
  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public solid = new SolidStyle();
  public contours = new ContoursStyle;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(targetId: TargetId)
  {
    super(targetId);
  }

  //==================================================
  // OVERRIDES of BaseStyle
  //==================================================

  public /*override*/ clone(): BaseStyle { return Lodash.cloneDeep<SurfaceRenderStyle>(this); }

  protected /*override*/ populateCore(folder: BasePropertyFolder)
  {
    //const expander = new ExpanderProperty("Solid");
    this.solid.populate(folder);
    //folder.addChild(expander);
    //const expander = new ExpanderProperty("Contours");
    this.contours.populate(folder);
    //folder.addChild(expander);
  }
}
