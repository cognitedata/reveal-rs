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

import { PolylinesNode } from "@/SubSurface/Basics/PolylinesNode";
import { PolylinesRenderStyle } from "@/SubSurface/Basics/PolylinesRenderStyle";
import { Base3DView } from "@/Core/Views/Base3DView";

import { StubTargetNode } from "@/__tests__/StubModule/StubTargetNode";

export class StubPolylinesView extends Base3DView {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor() {
 super();
}

  //= =================================================
  // INSTANCE PROPERTIES
  //= =================================================

  protected get node(): PolylinesNode {
 return super.getNode() as PolylinesNode;
}

  protected get style(): PolylinesRenderStyle {
 return super.getStyle() as PolylinesRenderStyle;
}

  protected get target(): StubTargetNode {
 return super.getTarget() as StubTargetNode;
}

  //= =================================================
  // OVERRIDES of BaseView
  //= =================================================

  protected /* override */ initializeCore(): void {
    const { node } = this;
    if (!node)
      throw Error("The node is not set");

    const { style } = this;
    if (!style)
      throw Error("The style is not set");

    const { target } = this;
    if (!target)
      throw Error("The target is not set");

    if (!target.isInitialized)
      throw Error("The target is not initialized");

    if (!node.isInitialized)
      throw Error("The node is not initialized");

    const { polylines } = node;
    if (!polylines)
      throw Error("The polylines is missing in view");

    let count = 0;
    for (const polyline of polylines.list)
      for (const _ of polyline.list)
        count += 1;

    if (count === 0)
      throw Error("No data in the polylines");
  }
}
