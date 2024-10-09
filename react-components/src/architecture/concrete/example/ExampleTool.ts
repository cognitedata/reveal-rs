/*!
 * Copyright 2024 Cognite AS
 */

import { ExampleDomainObject } from './ExampleDomainObject';
import { type BaseCommand } from '../../base/commands/BaseCommand';
import { BaseEditTool } from '../../base/commands/BaseEditTool';
import { Changes } from '../../base/domainObjectsHelpers/Changes';
import { ResetAllExamplesCommand } from './commands/ResetAllExamplesCommand';
import { DeleteAllExamplesCommand } from './commands/DeleteAllExamplesCommand';
import { ShowAllExamplesCommand } from './commands/ShowAllExamplesCommand';
import { clamp } from 'lodash';
import { type HSL } from 'three';
import { type TranslateKey } from '../../base/utilities/TranslateKey';
import { ShowExamplesOnTopCommand } from './commands/ShowExamplesOnTopCommand';
import { DomainObjectChange } from '../../base/domainObjectsHelpers/DomainObjectChange';
import { type VisualDomainObject } from '../../base/domainObjects/VisualDomainObject';
import { UndoCommand } from '../../base/concreteCommands/UndoCommand';
import { type IconName } from '../../base/utilities/IconName';

export class ExampleTool extends BaseEditTool {
  // ==================================================
  // OVERRIDES of BaseCommand
  // ==================================================

  public override get icon(): IconName {
    return 'Circle';
  }

  public override get tooltip(): TranslateKey {
    return { fallback: 'Create or edit a single point' };
  }

  // ==================================================
  // OVERRIDES of BaseTool
  // ==================================================

  public override onDeleteKey(): void {
    const domainObject = this.getSelected();
    if (domainObject instanceof ExampleDomainObject) {
      this.addTransaction(domainObject.createTransaction(Changes.deleted));
      domainObject.removeInteractive();
    }
  }

  public override async onWheel(event: WheelEvent, delta: number): Promise<void> {
    const intersection = await this.getIntersection(event);
    const domainObject = this.getIntersectedSelectableDomainObject(
      intersection
    ) as ExampleDomainObject;
    if (domainObject === undefined || !domainObject.isSelected) {
      await super.onWheel(event, delta);
      return;
    }
    if (event.shiftKey) {
      // Change color
      this.addTransaction(domainObject.createTransaction(Changes.color));

      let hsl: HSL = { h: 0, s: 0, l: 0 };
      hsl = domainObject.color.getHSL(hsl);
      hsl.h = (hsl.h + Math.sign(delta) * 0.02) % 1;
      domainObject.color.setHSL(hsl.h, hsl.s, hsl.l);
      domainObject.notify(Changes.color);
    } else if (event.ctrlKey || event.metaKey) {
      // Change opacity
      this.addTransaction(domainObject.createTransaction(Changes.renderStyle));

      const opacity = domainObject.renderStyle.opacity + Math.sign(delta) * 0.05;
      domainObject.renderStyle.opacity = clamp(opacity, 0.2, 1);
      domainObject.notify(new DomainObjectChange(Changes.renderStyle, 'opacity'));
    } else {
      // Change radius
      this.addTransaction(domainObject.createTransaction(Changes.renderStyle));

      const factor = 1 - Math.sign(delta) * 0.1;
      domainObject.renderStyle.radius *= factor;
      domainObject.notify(new DomainObjectChange(Changes.renderStyle, 'radius'));
    }
  }

  public override async onHover(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    // Just set the cursor
    const domainObject = this.getIntersectedSelectableDomainObject(intersection);
    if (domainObject !== undefined) {
      this.renderTarget.cursor = domainObject.getEditToolCursor(this.renderTarget);
    } else if (intersection !== undefined) {
      this.renderTarget.setCrosshairCursor();
    } else {
      this.renderTarget.setNavigateCursor();
    }
  }

  public override async onClick(event: PointerEvent): Promise<void> {
    const intersection = await this.getIntersection(event);
    if (intersection === undefined) {
      await super.onClick(event);
      return;
    }
    {
      const domainObject = this.getIntersectedSelectableDomainObject(intersection);
      if (domainObject !== undefined) {
        this.deselectAll(domainObject);
        domainObject.setSelectedInteractive(true);
        return;
      }
    }
    const center = this.renderTarget.convertFromViewerCoordinates(intersection.point);
    const domainObject = new ExampleDomainObject();
    domainObject.center.copy(center);

    this.deselectAll();
    this.rootDomainObject.addChildInteractive(domainObject);
    domainObject.setVisibleInteractive(true, this.renderTarget);
    domainObject.setSelectedInteractive(true);

    this.addTransaction(domainObject.createTransaction(Changes.added));
    this.renderTarget.cursor = domainObject.getEditToolCursor(this.renderTarget);
  }

  public override getToolbar(): Array<BaseCommand | undefined> {
    return [
      new UndoCommand(),
      new ResetAllExamplesCommand(),
      new ShowAllExamplesCommand(),
      new DeleteAllExamplesCommand(),
      new ShowExamplesOnTopCommand()
    ];
  }

  // ==================================================
  // OVERRIDES of BaseEditTool
  // ==================================================

  protected override canBeSelected(domainObject: VisualDomainObject): boolean {
    return domainObject instanceof ExampleDomainObject;
  }
}
