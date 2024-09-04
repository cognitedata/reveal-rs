/*!
 * Copyright 2024 Cognite AS
 */

import { VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { type RenderStyle } from '../../base/renderStyles/RenderStyle';
import { type ThreeView } from '../../base/views/ThreeView';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { type PointCloudAnnotation } from './utils/types';
import { AnnotationsView } from './AnnotationsView';
import { AnnotationsRenderStyle } from './AnnotationsRenderStyle';
import { FocusType } from '../../base/domainObjectsHelpers/FocusType';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { remove } from '../../base/utilities/extensions/arrayExtensions';
import { BoxGizmoDomainObject } from './BoxGizmoDomainObject';
import { SingleAnnotation } from './helpers/SingleAnnotation';
import { SolidDomainObject } from '../primitives/base/SolidDomainObject';
import { PrimitiveType } from '../primitives/PrimitiveType';
import { CylinderGizmoDomainObject } from './CylinderGizmoDomainObject';
import { getStatusByAnnotation } from './utils/getStatusByAnnotation';

export class AnnotationsDomainObject extends VisualDomainObject {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  public annotations: PointCloudAnnotation[] = [];
  public selectedAnnotation: SingleAnnotation | undefined = undefined;
  public focusAnnotation?: SingleAnnotation | undefined = undefined;
  public focusType = FocusType.None;

  // ==================================================
  // INSTANCE PROPERTIES
  // ==================================================

  public get style(): AnnotationsRenderStyle {
    return super.getRenderStyle() as AnnotationsRenderStyle;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
  }

  // ==================================================
  // OVERRIDES of DomainObject
  // ==================================================

  public override get icon(): string {
    return 'Cube';
  }

  public override get typeName(): TranslateKey {
    return { fallback: 'Annotations' };
  }

  public override createRenderStyle(): RenderStyle | undefined {
    return new AnnotationsRenderStyle();
  }

  // ==================================================
  // OVERRIDES of VisualDomainObject
  // ==================================================

  protected override createThreeView(): ThreeView | undefined {
    return new AnnotationsView();
  }

  // ==================================================
  // INSTANCE METHODS: Interactive operations
  // ==================================================

  public removeSelectedAnnotationInteractive(): boolean {
    if (this.selectedAnnotation === undefined) {
      return false;
    }
    if (this.annotations === undefined) {
      return false;
    }
    let isChanged: boolean;
    if (!this.selectedAnnotation.isSingle) {
      isChanged = this.selectedAnnotation.removeGeometry();
    } else {
      isChanged = remove(this.annotations, this.selectedAnnotation.annotation);
    }
    this.selectedAnnotation = undefined;
    if (isChanged) {
      this.notify(Changes.geometry);
      const gizmo = this.getGizmo();
      if (gizmo !== undefined) {
        gizmo.removeInteractive();
      }
    }
    return isChanged;
  }

  public override setSelectedInteractive(value: boolean): boolean {
    if (this.isSelected === value) {
      return false; // no change
    }
    this.isSelected = value;
    this.notify(Changes.selected);
    return true;
  }

  public setSelectedAnnotationInteractive(annotation: SingleAnnotation | undefined): boolean {
    if (SingleAnnotation.areEqual(this.selectedAnnotation, annotation)) {
      return false;
    }
    this.selectedAnnotation = annotation;
    if (this.selectedAnnotation !== undefined) {
      this.setSelectedInteractive(true);
    }
    this.setFocusAnnotationInteractive(FocusType.None);
    this.notify(Changes.selected);
    return true;
  }

  public setFocusAnnotationInteractive(
    focusType: FocusType,
    annotation?: SingleAnnotation
  ): boolean {
    if (
      SingleAnnotation.areEqual(this.focusAnnotation, annotation) &&
      this.focusType === focusType
    ) {
      return false; // No change
    }
    this.focusType = focusType;
    this.focusAnnotation = annotation;
    this.notify(Changes.focus);
    return true;
  }

  // ==================================================
  // INSTANCE METHODS: Get or create the gizmo
  // ==================================================

  public getGizmo(): SolidDomainObject | undefined {
    return this.getDescendantByType(SolidDomainObject);
  }

  public getOrCreateGizmo(primitiveType: PrimitiveType): SolidDomainObject | undefined {
    let gizmo = this.getGizmo();
    if (gizmo !== undefined && gizmo.primitiveType === primitiveType) {
      return gizmo;
    }
    if (gizmo !== undefined) {
      gizmo.removeInteractive();
      gizmo = undefined;
    }
    gizmo = createGizmo(primitiveType);
    if (gizmo !== undefined) {
      this.addChildInteractive(gizmo);
    }
    return gizmo;
  }

  public getOrCreateGizmoByAnnotation(annotation: SingleAnnotation): SolidDomainObject | undefined {
    const gizmo = this.getOrCreateGizmo(annotation.primitiveType);
    if (gizmo === undefined) {
      return gizmo;
    }
    if (gizmo instanceof BoxGizmoDomainObject || gizmo instanceof CylinderGizmoDomainObject) {
      if (!gizmo.updateThisFromAnnotation(annotation)) {
        return;
      }
    }
    gizmo.color.set(this.style.getColorByStatus(getStatusByAnnotation(annotation.annotation)));
    return gizmo;
  }
}

// ==================================================
// PRIVATE FUNCTIONS
// ==================================================

function createGizmo(primitiveType: PrimitiveType): SolidDomainObject | undefined {
  switch (primitiveType) {
    case PrimitiveType.Box:
      return new BoxGizmoDomainObject();
    case PrimitiveType.Cylinder:
      return new CylinderGizmoDomainObject();
    default:
      return undefined;
  }
}
