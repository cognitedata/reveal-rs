/*!
 * Copyright 2024 Cognite AS
 */

import { type WellKnownAsprsPointClassCodes } from '@cognite/reveal';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { type Color } from 'three';
import { BaseFilterCommand, BaseFilterItemCommand } from '../../commands/BaseFilterCommand';
import { type RevealRenderTarget } from '../../renderTarget/RevealRenderTarget';
import { type PointCloud } from '../../../concrete/reveal/RevealTypes';

export class PointCloudFilterCommand extends BaseFilterCommand {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _modelId: number | undefined = undefined;
  private _revisionId: number | undefined = undefined;

  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'POINTS_FILTER' };
  }

  public override get isEnabled(): boolean {
    return this.getPointCloud() !== undefined;
  }

  public override initializeChildrenIfNeeded(): void {
    const pointCloud = getFirstPointCloudWithClasses({ renderTarget: this.renderTarget });
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
    // Override the default implementation to optimize the logic
    const pointCloud = this.getPointCloud();
    if (pointCloud === undefined) {
      return false;
    }
    return isAllClassesVisible(pointCloud);
  }

  protected override toggleAllCheckedCore(): boolean {
    // Override the default implementation to optimize the logic
    const pointCloud = this.getPointCloud();
    if (pointCloud === undefined) {
      return false;
    }
    const isAllChecked = isAllClassesVisible(pointCloud);
    const classes = pointCloud.getClasses();
    if (classes === undefined || classes.length === 0) {
      return false;
    }
    for (const c of classes) {
      pointCloud.setClassVisible(c.code, !isAllChecked);
    }
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getPointCloud(): PointCloud | undefined {
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

export class FilterItemCommand extends BaseFilterItemCommand {
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

  public override get tooltip(): TranslationInput {
    return { untranslated: this._pointClass.displayName };
  }

  public override get isChecked(): boolean {
    const pointCloud = this.getPointCloud();
    if (pointCloud === undefined) {
      return false;
    }
    return pointCloud.isClassVisible(this._pointClass.code);
  }

  public override get color(): Color | undefined {
    return this._pointClass.color;
  }

  protected override setCheckedCore(value: boolean): boolean {
    const pointCloud = this.getPointCloud();
    if (pointCloud === undefined) {
      return false;
    }
    if (pointCloud.isClassVisible(this._pointClass.code) === value) {
      return false;
    }
    pointCloud.setClassVisible(this._pointClass.code, value);
    return true;
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getPointCloud(): PointCloud | undefined {
    for (const pointCloud of this.renderTarget.getPointClouds()) {
      if (this._modelId === pointCloud.modelId && this._revisionId === pointCloud.revisionId) {
        return pointCloud;
      }
    }
    return undefined;
  }
}

export class PointClass {
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

function getFirstPointCloudWithClasses({
  renderTarget
}: {
  renderTarget: RevealRenderTarget;
}): PointCloud | undefined {
  for (const pointCloud of renderTarget.getPointClouds()) {
    const classes = pointCloud.getClasses();
    if (classes === undefined || classes.length === 0) {
      continue;
    }
    return pointCloud;
  }
  return undefined;
}

function isAllClassesVisible(pointCloud: PointCloud): boolean {
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
