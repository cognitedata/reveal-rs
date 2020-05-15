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

import { FloatLog } from "./../Logs/FloatLog";
import { BaseLogNode } from "./BaseLogNode";

export class FloatLogNode extends BaseLogNode
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get data(): FloatLog | null { return this._data as FloatLog; }
  public set data(value: FloatLog | null) { this._data = value; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseLogNode.name; }
  public /*override*/ isA(className: string): boolean { return className === BaseLogNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get typeName(): string { return "FloatLogNode" }
}