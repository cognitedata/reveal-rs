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

import Icon from '../../images/Nodes/ColorMapNode.png';
import { BaseNode } from '../../Nodes/BaseNode';

export class ColorMapNode extends BaseNode {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = 'ColorMapNode';

  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor() {
    super();
  }

  //= =================================================
  // OVERRIDES of Identifiable
  //= =================================================

  public get /* override */ className(): string {
    return ColorMapNode.className;
  }

  public /* override */ isA(className: string): boolean {
    return className === ColorMapNode.className || super.isA(className);
  }

  //= =================================================
  // OVERRIDES of BaseNode
  //= =================================================

  public get /* override */ typeName(): string {
    return 'Color Map';
  }

  public /* override */ getIcon(): string {
    return Icon;
  }
}
