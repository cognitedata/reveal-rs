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

import { RootNode } from "../Nodes/RootNode";
import { ViewFactory } from "./ViewFactory";

export abstract class BaseModule
{
  //==================================================
  // VIRTUAL METHODS: 
  //==================================================

  protected /*virtual*/ registerViewsCore(factory: ViewFactory): void { }
  protected /*virtual*/ abstract createRootCore(): RootNode;

  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  public install(): void
  {
    const factory = ViewFactory.instance;
    this.registerViewsCore(factory);
  }

  public createRoot(): RootNode
  {
    const root = this.createRootCore();
    root.initialize();
    return root;
  }
}

