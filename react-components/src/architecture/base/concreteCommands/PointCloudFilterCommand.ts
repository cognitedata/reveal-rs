/*!
 * Copyright 2024 Cognite AS
 */

import { type CognitePointCloudModel, type WellKnownAsprsPointClassCodes } from '@cognite/reveal';
import { type TranslateKey } from '../utilities/TranslateKey';
import { type Color } from 'three';
import { BaseFilterCommand, BaseFilterItemCommand } from '../commands/BaseFilterCommand';
import { CommandsUpdater } from '../reactUpdaters/CommandsUpdater';
import { type RevealRenderTarget } from '../renderTarget/RevealRenderTarget';

export class PointCloudFilterCommand extends BaseFilterCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _modelId: number | undefined = undefined;
  private _revisionId: number | undefined = undefined;

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { key: 'POINT_FILTER', fallback: 'Points filter' };
  }

  public override get isEnabled(): boolean {
    return this.getPointCloud() !== undefined;
  }

  public override initializeChildrenIfNeeded(): void {
    const pointCloud = getFirstPointCloudWithClasses(this.renderTarget);
    if (pointCloud === undefined) {
      this._children = undefined;
      this._modelId = undefined;
      this._revisionId = undefined;
      return;
    }
    if (this._modelId === pointCloud.modelId && this._revisionId === pointCloud.revisionId) {
      return; // Nothing changed
    }
    this._modelId = pointCloud.modelId;
    this._revisionId = pointCloud.revisionId;
    this._children = undefined;
    super.initializeChildrenIfNeeded();
  }

  protected override createChildren(): FilterItemCommand[] {
    const pointCloud = this.getPointCloud();
    if (pointCloud === undefined) {
      return [];
    }
    const classes = pointCloud.getClasses();
    if (classes === undefined || classes.length === 0) {
      return [];
    }
    const children = [];
    for (const c of classes) {
      const pointClass = new PointClass(c.name, c.code, c.color);
      children.push(new FilterItemCommand(pointClass, pointCloud.modelId, pointCloud.revisionId));
    }
    return children;
  }

  public override get isAllChecked(): boolean {
    const pointCloud = this.getPointCloud();
    if (pointCloud === undefined) {
      return false;
    }
    return isAllClassesVisible(pointCloud);
  }

  public override toggleAllChecked(): void {
    const pointCloud = this.getPointCloud();
    if (pointCloud === undefined) {
      return;
    }
    const isAllChecked = isAllClassesVisible(pointCloud);
    const classes = pointCloud.getClasses();
    if (classes === undefined || classes.length === 0) {
      return;
    }
    for (const c of classes) {
      pointCloud.setClassVisible(c.code, !isAllChecked);
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getPointCloud(): CognitePointCloudModel | undefined {
    if (this._modelId === undefined || this._revisionId === undefined) {
      return undefined;
    }
    for (const pointCloud of this.renderTarget.getPointClouds()) {
      if (this._modelId === pointCloud.modelId && this._revisionId === pointCloud.revisionId) {
        return pointCloud;
      }
    }
    return undefined;
  }
}

// Note: This is not exported, as it is only used internally

class FilterItemCommand extends BaseFilterItemCommand {
  private readonly _modelId: number;
  private readonly _revisionId: number;
  private readonly _pointClass: PointClass;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(pointClass: PointClass, modelId: number, revisionId: number) {
    super();
    this._modelId = modelId;
    this._revisionId = revisionId;
    this._pointClass = pointClass;
  }

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslateKey {
    return { fallback: this._pointClass.displayName };
  }

  public override get isChecked(): boolean {
    const pointCloud = this.getPointCloud();
    if (pointCloud === undefined) {
      return false;
    }
    return pointCloud.isClassVisible(this._pointClass.code);
  }

  public override invokeCore(): boolean {
    const pointCloud = this.getPointCloud();
    if (pointCloud === undefined) {
      return false;
    }
    const isVisible = pointCloud.isClassVisible(this._pointClass.code);
    pointCloud.setClassVisible(this._pointClass.code, !isVisible);
    return true;
  }

  public override get color(): Color | undefined {
    return this._pointClass.color;
  }

  public override setChecked(value: boolean): void {
    const pointCloud = this.getPointCloud();
    if (pointCloud === undefined) {
      return;
    }
    pointCloud.setClassVisible(this._pointClass.code, value);
    CommandsUpdater.update(this._renderTarget);
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getPointCloud(): CognitePointCloudModel | undefined {
    for (const pointCloud of this.renderTarget.getPointClouds()) {
      if (this._modelId === pointCloud.modelId && this._revisionId === pointCloud.revisionId) {
        return pointCloud;
      }
    }
    return undefined;
  }
}

class PointClass {
  name: string;
  code: number | WellKnownAsprsPointClassCodes;
  color: Color;

  constructor(name: string, code: number | WellKnownAsprsPointClassCodes, color: Color) {
    this.name = name;
    this.code = code;
    this.color = color;
  }

  public get displayName(): string {
    const name = this.name;
    const changedName = name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');

    if (!name.startsWith('ReservedOr')) {
      return changedName;
    }
    const betterKey = changedName.slice('ReservedOr'.length);
    return `${betterKey} (legacy)`;
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function getFirstPointCloudWithClasses(
  renderTarget: RevealRenderTarget
): CognitePointCloudModel | undefined {
  for (const pointCloud of renderTarget.getPointClouds()) {
    const classes = pointCloud.getClasses();
    if (classes === undefined || classes.length === 0) {
      continue;
    }
    return pointCloud;
  }
  return undefined;
}

function isAllClassesVisible(pointCloud: CognitePointCloudModel): boolean {
  const classes = pointCloud.getClasses();
  if (classes === undefined || classes.length === 0) {
    return false;
  }
  for (const c of classes) {
    if (!pointCloud.isClassVisible(c.code)) {
      return false;
    }
  }
  return true;
}
