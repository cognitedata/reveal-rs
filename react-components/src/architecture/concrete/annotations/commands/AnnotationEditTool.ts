/*!
 * Copyright 2024 Cognite AS
 */

import { CDF_TO_VIEWER_TRANSFORMATION, type AnyIntersection } from '@cognite/reveal';
import { type VisualDomainObject } from '../../../base/domainObjects/VisualDomainObject';
import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';
import { BaseEditTool } from '../../../base/commands/BaseEditTool';
import { isDomainObjectIntersection } from '../../../base/domainObjectsHelpers/DomainObjectIntersection';
import { FocusType } from '../../../base/domainObjectsHelpers/FocusType';
import { type DomainObject } from '../../../base/domainObjects/DomainObject';
import { ShowAnnotationsOnTopCommand } from './ShowAnnotationsOnTopCommand';
import { UndoCommand } from '../../../base/concreteCommands/UndoCommand';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { ShowAllAnnotationsCommand } from './ShowAllAnnotationsCommand';
import { CreateAnnotationMockCommand } from './CreateAnnotationMockCommand';
import { PrimitiveType } from '../../primitives/common/PrimitiveType';
import { CommandsUpdater } from '../../../base/reactUpdaters/CommandsUpdater';
import { SetAnnotationEditTypeCommand } from './SetAnnotationEditTypeCommand';
import { type BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { BoxCreator } from '../../primitives/box/BoxCreator';
import { BoxGizmoDomainObject } from '../BoxGizmoDomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { type BaseDragger } from '../../../base/domainObjectsHelpers/BaseDragger';
import { PrimitiveEditTool } from '../../primitives/tools/PrimitiveEditTool';
import { type PrimitivePickInfo } from '../../primitives/common/PrimitivePickInfo';
import { type SingleAnnotation } from '../helpers/SingleAnnotation';
import { DeleteSelectedAnnotationCommand } from './DeleteSelectedAnnotationCommand';
import { AlignSelectedAnnotationCommand } from './AlignSelectedAnnotationCommand';
import { CylinderGizmoDomainObject } from '../CylinderGizmoDomainObject';
import { AnnotationChangedDescription } from '../helpers/AnnotationChangedDescription';
import { CylinderCreator } from '../../primitives/cylinder/CylinderCreator';

export const ANNOTATION_RADIUS_FACTOR = 0.2;

export class AnnotationEditTool extends BaseEditTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _creator: BaseCreator | undefined = undefined;
  public primitiveType: PrimitiveType;
  public readonly defaultPrimitiveType: PrimitiveType;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor(primitiveType: PrimitiveType = PrimitiveType.None) {
    super();
    this.primitiveType = primitiveType;
    this.defaultPrimitiveType = primitiveType;
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): string {
    return 'Shapes';
  }

  public override get tooltip(): TranslateKey {
    return { key: 'ANNOTATIONS_EDIT', fallback: 'Create or edit annotations' };
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onDeactivate(): void {
    this.handleEscape();
    super.onDeactivate();

    for (const domainObject of this.rootDomainObject.getDescendantsByType(
      AnnotationsDomainObject
    )) {
      domainObject.removeGizmoInteractive();
    }
  }

  public override clearDragging(): void {
    super.clearDragging();
    this._creator = undefined;
  }

  public override onKey(event: KeyboardEvent, down: boolean): void {
    if (down && (event.key === 'Delete' || event.key === 'Backspace')) {
      const domainObject = this.getSelectedAnnotationsDomainObject();
      if (domainObject !== undefined) {
        // this.addTransaction(domainObject.createTransaction(Changes.deleted));
        domainObject.removeSelectedAnnotationInteractive();
      }
      this._creator = undefined;
      return;
    }
    if (down && event.key === 'Escape') {
      this.handleEscape();
      this.deselectedAnnotationInteractive();
    }
    super.onKey(event, down);
  }

  public override async onHover(event: PointerEvent): Promise<void> {
    const ray = this.getRay(event);
    if (this.primitiveType !== PrimitiveType.None) {
      const { _creator: creator } = this;
      if (creator !== undefined) {
        // Hover in the "air"
        if (creator.addPoint(ray, undefined, true)) {
          this.setDefaultCursor();
          return;
        }
        const intersection = await this.getIntersection(event);
        if (intersection === undefined) {
          if (creator !== undefined && creator.preferIntersection) {
            // Hover in the "air"
            const ray = this.getRay(event);
            if (creator.addPoint(ray, undefined, true)) {
              this.setDefaultCursor();
              return;
            }
          }
          this.renderTarget.setNavigateCursor();
          return;
        }
        if (getIntersectedAnnotationsDomainObject(intersection) !== undefined) {
          this.renderTarget.setNavigateCursor();
          return;
        }
        if (creator.addPoint(ray, intersection, true)) {
          this.setDefaultCursor();
          return;
        }
        this.renderTarget.setNavigateCursor();
      } else {
        const intersection = await this.getIntersection(event);
        if (intersection !== undefined) {
          this.renderTarget.setCrosshairCursor();
        } else {
          this.renderTarget.setNavigateCursor();
        }
      }
    } else {
      const intersection = await this.getIntersection(event);
      const domainObject = getIntersectedAnnotationsDomainObject(intersection);
      const annotation = getIntersectedAnnotation(intersection);
      const gizmo = getIntersectedAnnotationGizmo(intersection);

      if (domainObject !== undefined && annotation !== undefined) {
        this.renderTarget.setDefaultCursor();
        if (annotation.equals(domainObject.selectedAnnotation)) {
          domainObject.setFocusAnnotationInteractive(FocusType.None);
        } else {
          domainObject.setFocusAnnotationInteractive(FocusType.Focus, annotation);
        }
      } else if (gizmo === undefined) {
        this.renderTarget.setNavigateCursor();
        this.defocusAll();
      } else if (gizmo !== undefined && isDomainObjectIntersection(intersection)) {
        const pickInfo = intersection.userData as PrimitivePickInfo;
        gizmo.setFocusInteractive(pickInfo.focusType, pickInfo.face);
        PrimitiveEditTool.setCursor(this, gizmo, intersection.point, pickInfo);
      }
    }
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;

    if (this.primitiveType !== PrimitiveType.None) {
      let creator = this._creator;

      // Click in the "air"
      if (creator !== undefined) {
        const ray = this.getRay(event);
        if (creator.addPoint(ray, undefined)) {
          this.endCreatorIfFinished(creator);
          return;
        }
      }
      const intersection = await this.getIntersection(event);
      if (intersection === undefined) {
        // Click in the "air"
        return;
      }
      if (creator !== undefined) {
        const ray = this.getRay(event);
        if (creator.addPoint(ray, intersection)) {
          this.endCreatorIfFinished(creator);
        }
        return;
      }
      if (creator === undefined) {
        this.deselectedAnnotationInteractive();
        creator = this._creator = this.createCreator();
        if (creator === undefined) {
          return;
        }
        const ray = this.getRay(event);
        if (creator.addPoint(ray, intersection)) {
          const gizmo = creator.domainObject;
          gizmo.setSelectedInteractive(true);
          gizmo.setVisibleInteractive(true, renderTarget);
          gizmo.notify(Changes.geometry);
          // .addTransaction(domainObject.createTransaction(Changes.added));
        } else {
          this._creator = undefined;
          return;
        }
        this.endCreatorIfFinished(creator);
        return;
      }
      this.renderTarget.setMoveCursor();
    } else {
      const intersection = await this.getIntersection(event);
      const domainObject = getIntersectedAnnotationsDomainObject(intersection);
      const annotation = getIntersectedAnnotation(intersection);
      const gizmo = getIntersectedAnnotationGizmo(intersection);

      if (domainObject !== undefined && annotation !== undefined) {
        // Click at an annotation
        domainObject.setSelectedAnnotationInteractive(annotation);
        return;
      } else if (domainObject !== undefined) {
        // This will rather ont happen
        domainObject.setSelectedAnnotationInteractive(undefined);
      } else if (gizmo === undefined) {
        // Click in the "air"
        this.deselectedAnnotationInteractive();
      }
      await super.onClick(event);
    }
  }

  public override async onLeftPointerDown(event: PointerEvent): Promise<void> {
    if (this._creator !== undefined) {
      return; // Prevent dragging while creating the new
    }
    await super.onLeftPointerDown(event);
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new SetAnnotationEditTypeCommand(PrimitiveType.None),
      new SetAnnotationEditTypeCommand(PrimitiveType.Box),
      new SetAnnotationEditTypeCommand(PrimitiveType.HorizontalCylinder),
      new SetAnnotationEditTypeCommand(PrimitiveType.VerticalCylinder),
      undefined,
      new UndoCommand(),
      new DeleteSelectedAnnotationCommand(),
      new AlignSelectedAnnotationCommand(true),
      new AlignSelectedAnnotationCommand(false),
      undefined,
      new CreateAnnotationMockCommand(),
      new ShowAllAnnotationsCommand(),
      new ShowAnnotationsOnTopCommand()
    ];
  }

  protected override async createDragger(event: PointerEvent): Promise<BaseDragger | undefined> {
    function isAnnotationGizmo(domainObject: DomainObject): boolean {
      return (
        domainObject instanceof BoxGizmoDomainObject ||
        domainObject instanceof CylinderGizmoDomainObject
      );
    }
    const intersection = await this.getIntersection(event, isAnnotationGizmo);
    if (intersection === undefined) {
      return undefined;
    }
    if (!isDomainObjectIntersection(intersection)) {
      return undefined;
    }
    const gizmo = intersection.domainObject as VisualDomainObject;
    if (gizmo === undefined) {
      return undefined;
    }
    const ray = this.getRay(event);
    const matrix = CDF_TO_VIEWER_TRANSFORMATION.clone().invert();
    const point = intersection.point.clone();
    point.applyMatrix4(matrix);
    ray.applyMatrix4(matrix);
    return gizmo.createDragger({ intersection, point, ray });
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override deselectAll(_except?: VisualDomainObject | undefined): void {
    // Don't want this to ado anything
  }

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof AnnotationsDomainObject;
  }

  private createCreator(): BaseCreator | undefined {
    const domainObject = this.getSelectedAnnotationsDomainObject();
    if (domainObject === undefined) {
      return undefined;
    }
    const gizmo = domainObject.getOrCreateGizmoForPending(this.primitiveType);

    switch (this.primitiveType) {
      case PrimitiveType.Box: {
        if (!(gizmo instanceof BoxGizmoDomainObject)) {
          return undefined;
        }
        return new BoxCreator(this, gizmo);
      }
      case PrimitiveType.HorizontalCylinder:
      case PrimitiveType.VerticalCylinder: {
        if (!(gizmo instanceof CylinderGizmoDomainObject)) {
          return undefined;
        }
        const isHorizontal = this.primitiveType === PrimitiveType.HorizontalCylinder;
        return new CylinderCreator(this, gizmo, isHorizontal);
      }
      default:
        return undefined;
    }
  }

  // ==================================================
  // INSTANCE METHODS
  // ==================================================

  private getSelectedAnnotationsDomainObject(): AnnotationsDomainObject | undefined {
    return this.getSelected() as AnnotationsDomainObject;
  }

  public handleEscape(): void {
    if (this._creator !== undefined && this._creator.handleEscape()) {
      this.endCreatorIfFinished(this._creator, true);
    } else {
      this.setDefaultPrimitiveType();
      this._creator = undefined;
    }
  }

  private defocusAll(except?: DomainObject | undefined): void {
    for (const domainObject of this.getSelectable()) {
      if (except !== undefined && domainObject === except) {
        continue;
      }
      if (domainObject instanceof AnnotationsDomainObject) {
        domainObject.setFocusAnnotationInteractive(FocusType.None);
      }
    }
  }

  private setDefaultPrimitiveType(): void {
    if (this.primitiveType === this.defaultPrimitiveType) {
      return;
    }
    this.primitiveType = this.defaultPrimitiveType;
    CommandsUpdater.update(this.renderTarget);
  }

  private endCreatorIfFinished(creator: BaseCreator, force = false): void {
    if (!creator.isFinished && !force) {
      return;
    }
    this.setDefaultPrimitiveType();
    this._creator = undefined;

    const domainObject = this.getSelectedAnnotationsDomainObject();
    if (domainObject === undefined) {
      return;
    }
    const gizmo = creator.domainObject;

    let newAnnotation: SingleAnnotation | undefined;
    if (gizmo instanceof BoxGizmoDomainObject || gizmo instanceof CylinderGizmoDomainObject) {
      newAnnotation = gizmo.createAnnotation();
    } else {
      return;
    }
    const usePending = true;
    if (usePending) {
      domainObject.pendingAnnotation = newAnnotation;
      domainObject.notify(Changes.newPending);
    } else {
      // See applyAnnotationInteractive
      domainObject.annotations.push(newAnnotation.annotation);
      const change = new AnnotationChangedDescription(Changes.addedPart, newAnnotation);
      domainObject.notify(change);
      domainObject.setSelectedAnnotationInteractive(newAnnotation);
    }
  }

  private deselectedAnnotationInteractive(): void {
    const annotationsDomainObject = this.getSelectedAnnotationsDomainObject();
    if (annotationsDomainObject !== undefined) {
      annotationsDomainObject.setSelectedAnnotationInteractive(undefined);
    }
  }
}

// ==================================================
// PRIVATE FUNCTIONS: Getters for selected objects
// ==================================================

function getIntersectedAnnotation(
  intersection: AnyIntersection | undefined
): SingleAnnotation | undefined {
  if (intersection === undefined) {
    return undefined;
  }
  if (!isDomainObjectIntersection(intersection)) {
    return undefined;
  }
  return intersection.userData as SingleAnnotation;
}

function getIntersectedAnnotationsDomainObject(
  intersection: AnyIntersection | undefined
): AnnotationsDomainObject | undefined {
  if (intersection === undefined) {
    return undefined;
  }
  if (!isDomainObjectIntersection(intersection)) {
    return undefined;
  }
  const { domainObject } = intersection;
  if (!(domainObject instanceof AnnotationsDomainObject)) {
    return undefined;
  }
  return domainObject;
}

function getIntersectedAnnotationGizmo(
  intersection: AnyIntersection | undefined
): BoxGizmoDomainObject | CylinderGizmoDomainObject | undefined {
  if (intersection === undefined) {
    return undefined;
  }
  if (!isDomainObjectIntersection(intersection)) {
    return undefined;
  }
  const { domainObject } = intersection;
  if (domainObject instanceof BoxGizmoDomainObject) {
    return domainObject;
  }
  if (domainObject instanceof CylinderGizmoDomainObject) {
    return domainObject;
  }
  return undefined;
}
