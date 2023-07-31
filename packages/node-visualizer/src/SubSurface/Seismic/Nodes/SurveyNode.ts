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

import { Range3 } from '../../../Core/Geometry/Range3';
import { RegularGrid3 } from '../../../Core/Geometry/RegularGrid3';
import { BaseVisualNode } from '../../../Core/Nodes/BaseVisualNode';
import { BasePropertyFolder } from '../../../Core/Property/Base/BasePropertyFolder';
import Icon from '../../../images/Nodes/SurveyNode.png';

import { SeismicOutlineNode } from './SeismicOutlineNode';
import { SeismicPlaneFolder } from './SeismicPlaneFolder';

export class SurveyNode extends BaseVisualNode {
  //= =================================================
  // STATIC FIELDS
  //= =================================================

  static className = 'SurveyNode';

  public surveyCube: RegularGrid3 | null = null;

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
    return SurveyNode.className;
  }

  public /* override */ isA(className: string): boolean {
    return className === SurveyNode.className || super.isA(className);
  }

  //= =================================================
  // OVERRIDES of BaseNode
  //= =================================================

  public get /* override */ typeName(): string {
    return 'Survey';
  }

  public /* override */ getIcon(): string {
    return Icon;
  }

  public /* override */ canChangeColor(): boolean {
    return false;
  }

  public get /* override */ boundingBox(): Range3 {
    return this.surveyCube ? this.surveyCube.boundingBox : new Range3();
  }

  protected /* override */ initializeCore() {
    super.initializeCore();

    if (!this.hasChildByType(SeismicOutlineNode))
      this.addChild(new SeismicOutlineNode());

    if (!this.hasChildByType(SeismicPlaneFolder))
      this.addChild(new SeismicPlaneFolder());
  }

  protected /* override */ populateStatisticsCore(
    folder: BasePropertyFolder
  ): void {
    super.populateStatisticsCore(folder);

    const cube = this.surveyCube;
    if (!cube) return;

    folder.addReadOnlyIndex3('# Cells', cube.cellSize);
    folder.addReadOnlyIndex2('Start cell', cube.startCell);
    folder.addReadOnlyVector3('Spacing', cube.inc);
    folder.addReadOnlyVector3('Origin', cube.origin);
    folder.addReadOnlyAngle('Rotation', cube.rotationAngle);
    folder.addReadOnlyRange3(cube.boundingBox);
  }
}
