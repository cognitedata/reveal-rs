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

import { Range3 } from "../Geometry/Range3";
import { BaseView } from "./BaseView";
import { Changes } from "./Changes";
import { NodeEventArgs } from "./NodeEventArgs";

export abstract class Base3DView extends BaseView
{
  //==================================================
  // FIELDS
  //==================================================

  private _boundingBox: Range3 | undefined = undefined;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  protected constructor() { super(); }

  //==================================================
  // VIRTUAL METHODS: 
  //==================================================

  protected /*virtual*/ calculateBoundingBoxCore(): Range3 | undefined
  {
    // Override this function to recalculate the bounding box of the view
    return undefined;
  }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
    if (args.isChanged(Changes.geometry))
      this.touchBoundingBox()
  }

  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  public get boundingBox(): Range3 | undefined
  {
    if (this._boundingBox == undefined)
      this._boundingBox = this.calculateBoundingBoxCore();
    return this._boundingBox;
  }

  public set boundingBox(value: Range3 | undefined) 
  {
    this._boundingBox = value;
  }

  protected touchBoundingBox() : void
  {
    this._boundingBox = undefined;
  }
}