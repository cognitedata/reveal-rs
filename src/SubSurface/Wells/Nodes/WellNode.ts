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

import { Vector3 } from "@/Core/Geometry/Vector3";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import WellNodeIcon from "@images/Nodes/WellNode.png";
import ExpanderProperty from "@/Core/Property/Concrete/Folder/ExpanderProperty";

export class WellNode extends BaseNode
{
  //==================================================
  // STATIC FIELDS
  //==================================================

  static className = "WellNode";

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  public wellHead = Vector3.newZero;

  public waterDepth = 0;

  public elevationType: string = "";

  public get origin(): Vector3 { return new Vector3(this.wellHead.x, this.wellHead.y, 0); }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return WellNode.className; }

  public /*override*/ isA(className: string): boolean { return className === WellNode.className || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "Well"; }

  public /*override*/ getIcon(): string { return WellNodeIcon; }

  protected /*override*/ populateStatisticsCore(folder: ExpanderProperty): void
  {
    super.populateStatisticsCore(folder);
    folder.addReadOnlyXY("Wellhead", this.wellHead.x, this.wellHead.y, 2);
    folder.addReadOnlyInteger("# Trajectories", this.children.length);
  }
}
