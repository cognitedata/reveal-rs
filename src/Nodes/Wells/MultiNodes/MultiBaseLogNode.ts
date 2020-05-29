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

import { BaseVisualNode } from "@/Core/Nodes/BaseVisualNode";
import { MultiWellTrajectoryNode } from "@/Nodes/Wells/MultiNodes/MultiWellTrajectoryNode";

export abstract class MultiBaseLogNode extends BaseVisualNode
{
  //==================================================
  // FIELDS
  //==================================================


  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get trajectoryNode(): MultiWellTrajectoryNode | null { return this.getAncestorByType(MultiWellTrajectoryNode); }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return MultiBaseLogNode.name; }
  public /*override*/ isA(className: string): boolean { return className === MultiBaseLogNode.name || super.isA(className); }
}