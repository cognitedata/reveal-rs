/*!
 * Copyright 2024 Cognite AS
 */

import { RenderTargetCommand } from '../../commands/RenderTargetCommand';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { type Image360Model } from '../../../concrete/reveal/RevealTypes';

export class Set360IconsOccludedVisibleCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'X_RAY' };
  }

  public override get isEnabled(): boolean {
    return this.firstCollection?.getIconsVisibility() ?? false;
  }

  public override get isToggle(): boolean {
    return true;
  }

  public override get isChecked(): boolean {
    return this.firstCollection?.isOccludedIconsVisible() ?? true;
  }

  protected override invokeCore(): boolean {
    const visible = !this.isChecked;
    for (const collection of this.renderTarget.get360ImageCollections()) {
      collection.setOccludedIconsVisible(visible);
    }
    return true;
  }

  private get firstCollection(): Image360Model | undefined {
    return this.renderTarget.get360ImageCollections().next().value;
  }
}
