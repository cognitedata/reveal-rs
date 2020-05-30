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

import { TargetTreeNode } from "@/Core/Nodes/TargetTreeNode";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { BaseTargetNode } from "@/Core/Nodes/BaseTargetNode";
import { ITargetIdAccessor } from "@/Core/Interfaces/ITargetIdAccessor";

export class BaseRootNode extends BaseNode
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor()
  {
    super();
    this.name = "Root";
  }

  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  public get targets(): TargetTreeNode 
  {
    const child = this.getChildByType(TargetTreeNode);
    if (!child)
      throw new Error("Cannot find the " + TargetTreeNode.name);
    return child;
  }

  //==================================================
  // OVERRIDES of Identifiable
  //==================================================

  public /*override*/ get className(): string { return BaseRootNode.name; }
  public /*override*/ isA(className: string): boolean { return className === BaseRootNode.name || super.isA(className); }

  //==================================================
  // OVERRIDES of BaseNode
  //==================================================

  public /*override*/ get canChangeColor(): boolean { return false; }
  public /*override*/ get typeName(): string { return "Root" }

  protected /*override*/ get activeTargetIdAccessor(): ITargetIdAccessor | null
  {
    const targetNode = this.activeTarget;
    return targetNode as ITargetIdAccessor;
  }

  protected /*override*/ initializeCore(): void
  {
    super.initializeCore();
    if (!this.hasChildByType(TargetTreeNode))
      this.addChild(new TargetTreeNode());
  }

  //==================================================
  // INSTANCE METHODS
  //==================================================

  public get activeTarget(): BaseTargetNode | null
  {
    return this.targets.getActiveDescendantByType(BaseTargetNode);
  }
}