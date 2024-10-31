/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateKey } from '../../../base/utilities/TranslateKey';
import { AnnotationsDomainObject } from '../AnnotationsDomainObject';
import { UndoCommand } from '../../../base/concreteCommands/UndoCommand';
import { type BaseCommand } from '../../../base/commands/BaseCommand';
import { PrimitiveType } from '../../../base/utilities/primitives/PrimitiveType';
import { CommandsUpdater } from '../../../base/reactUpdaters/CommandsUpdater';
import { AnnotationsSetCreateTypeCommand } from './AnnotationsSetCreateTypeCommand';
import { type BaseCreator } from '../../../base/domainObjectsHelpers/BaseCreator';
import { BoxCreator } from '../../primitives/box/BoxCreator';
import { BoxGizmoDomainObject } from '../BoxGizmoDomainObject';
import { Changes } from '../../../base/domainObjectsHelpers/Changes';
import { CylinderGizmoDomainObject } from '../CylinderGizmoDomainObject';
import { CylinderCreator } from '../../primitives/cylinder/CylinderCreator';
import { NavigationTool } from '../../../base/concreteCommands/NavigationTool';
import { AnnotationsSelectTool } from './AnnotationsSelectTool';
import { type Annotation } from '../helpers/Annotation';
import { type IconName } from '../../../base/utilities/IconName';

export const ANNOTATION_RADIUS_FACTOR = 0.2;

export class AnnotationsCreateTool extends NavigationTool {
  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private _creator: BaseCreator | undefined = undefined;
  public primitiveType: PrimitiveType;

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    super();
    this.primitiveType = PrimitiveType.Box;
  }

  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): IconName {
    return 'Shapes';
  }

  public override get tooltip(): TranslateKey {
    return {
      key: 'ANNOTATIONS_CREATE',
      fallback: 'Create new annotation. Select type of annotation in the toolbar below.'
    };
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onActivate(): void {
    super.onActivate();
    const domainObject = this.getSelectedAnnotationsDomainObject();
    if (domainObject === undefined) {
      return undefined;
    }
    domainObject.setVisibleInteractive(true, this.renderTarget);
  }

  public override onDeactivate(): void {
    super.onDeactivate();
    this.onEscapeKey();
  }

  public override clearDragging(): void {
    super.clearDragging();
    this._creator = undefined;
  }

  public override onEscapeKey(): void {
    if (this._creator !== undefined && this._creator.onEscapeKey()) {
      this.endCreatorIfFinished(this._creator, true);
      this.setSelectTool();
      this.deselectedAnnotationInteractive();
    } else {
      this._creator = undefined;
    }
  }

  public override async onHover(event: PointerEvent): Promise<void> {
    const { _creator: creator } = this;
    if (creator !== undefined) {
      const ray = this.getRay(event);
      // Hover in the "air"
      if (creator.addPoint(ray, undefined, true)) {
        this.setDefaultCursor();
        return;
      }
      const intersection = await this.getIntersection(event);
      if (intersection === undefined) {
        if (creator !== undefined && creator.preferIntersection) {
          // Hover in the "air"
          if (creator.addPoint(ray, undefined, true)) {
            this.setDefaultCursor();
            return;
          }
        }
        this.renderTarget.setNavigateCursor();
        return;
      }
      if (AnnotationsSelectTool.getIntersectedAnnotationsDomainObject(intersection) !== undefined) {
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
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const { renderTarget } = this;

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
        await super.onClick(event);
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
    this.renderTarget.cursor = 'move';
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new AnnotationsSelectTool(),
      new AnnotationsSetCreateTypeCommand(PrimitiveType.Box),
      new AnnotationsSetCreateTypeCommand(PrimitiveType.HorizontalCylinder),
      new AnnotationsSetCreateTypeCommand(PrimitiveType.VerticalCylinder),
      undefined,
      new UndoCommand()
    ];
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  private createCreator(): BaseCreator | undefined {
    const domainObject = this.getSelectedAnnotationsDomainObjectByForce();
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
    return this.rootDomainObject.getSelectedDescendantByType(AnnotationsDomainObject);
  }

  private getSelectedAnnotationsDomainObjectByForce(): AnnotationsDomainObject {
    const domainObject = this.getSelectedAnnotationsDomainObject();
    if (domainObject !== undefined) {
      return domainObject;
    }
    const newDomainObject = new AnnotationsDomainObject();
    newDomainObject.applyPendingWhenCreated = true;
    this.rootDomainObject.addChildInteractive(newDomainObject);
    newDomainObject.setSelectedInteractive(true);
    newDomainObject.setVisibleInteractive(true);
    return newDomainObject;
  }

  private setSelectTool(): void {
    if (this.renderTarget.commandsController.setActiveToolByType(AnnotationsSelectTool)) {
      CommandsUpdater.update(this.renderTarget);
    }
  }

  private endCreatorIfFinished(creator: BaseCreator, force = false): void {
    if (!creator.isFinished && !force) {
      return;
    }
    this._creator = undefined;
    const domainObject = this.getSelectedAnnotationsDomainObject();
    if (domainObject === undefined) {
      return;
    }
    const gizmo = creator.domainObject;
    let pendingAnnotation: Annotation | undefined;
    if (gizmo instanceof BoxGizmoDomainObject || gizmo instanceof CylinderGizmoDomainObject) {
      pendingAnnotation = gizmo.createAnnotation();
    } else {
      return;
    }
    domainObject.pendingAnnotation = pendingAnnotation;
    if (domainObject.applyPendingWhenCreated) {
      domainObject.applyPendingAnnotationInteractive();
    } else {
      domainObject.notify(Changes.newPending);
    }
    this.setSelectTool();
  }

  private deselectedAnnotationInteractive(): void {
    const annotationsDomainObject = this.getSelectedAnnotationsDomainObject();
    if (annotationsDomainObject !== undefined) {
      annotationsDomainObject.setSelectedAnnotationInteractive(undefined);
    }
  }
}
