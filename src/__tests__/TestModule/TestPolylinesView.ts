
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

import { BaseView } from "../../Core/Views/BaseView";
import { PolylinesNode } from "../../Core/Geometry/PolylinesNode";
import { PolylinesRenderStyle } from "../../Core/Geometry/PolylinesRenderStyle";
import { TestTargetNode } from "./TestTargetNode";

export class TestPolylinesView extends BaseView
{
  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // PROPERTIES
  //==================================================

  protected get node(): PolylinesNode { return super.getNode() as PolylinesNode; }
  protected get style(): PolylinesRenderStyle { return super.getStyle() as PolylinesRenderStyle; }
  protected get target(): TestTargetNode { return super.getTarget() as TestTargetNode; }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  public /*override*/ initialize(): void
  {
    const node = this.node;
    const style = this.style;
    const target = this.target;

    if (target.isInitialized)
      throw Error("target is not initialized");

    const polylines = node.data;
    if (!polylines)
      throw Error("polylines is missing in view");

    let count = 0;
    for (const polyline of polylines.list)
      for (const point of polyline.list)
        count++;

    if (count === 0)
      throw Error("No data in polylines");
  }
}
