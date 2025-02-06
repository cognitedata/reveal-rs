/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslationInput } from '../../utilities/TranslateInput';
import { FractionSliderCommand } from '../../commands/FractionSliderCommand';
import { type Image360Model } from '../../../concrete/reveal/RevealTypes';

export class Set360IconsOpacityCommand extends FractionSliderCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'MARKER TRANSPARENCY' };
  }

  public override get isEnabled(): boolean {
    return this.firstCollection?.getIconsVisibility() ?? false;
  }

  public override get value(): number {
    return this.firstCollection?.getIconsOpacity() ?? 1;
  }

  public override set value(value: number) {
    for (const collection of this.renderTarget.get360ImageCollections()) {
      collection.setIconsOpacity(value);
    }
  }

  private get firstCollection(): Image360Model | undefined {
    return this.renderTarget.get360ImageCollections().next().value;
  }
}
