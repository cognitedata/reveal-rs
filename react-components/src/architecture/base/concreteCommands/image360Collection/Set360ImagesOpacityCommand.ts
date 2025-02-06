/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslationInput } from '../../utilities/TranslateInput';
import { FractionSliderCommand } from '../../commands/FractionSliderCommand';
import { type Image360Model } from '../../../concrete/reveal/RevealTypes';

export class Set360ImagesOpacityCommand extends FractionSliderCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { key: 'IMAGE_TRANSPARENCY' };
  }

  public override get isEnabled(): boolean {
    return this.firstCollection !== undefined;
  }

  public override get value(): number {
    return this.firstCollection?.getImagesOpacity() ?? 1;
  }

  public override set value(value: number) {
    for (const collection of this.renderTarget.get360ImageCollections()) {
      collection.setImagesOpacity(value);
    }
  }

  private get firstCollection(): Image360Model | undefined {
    return this.renderTarget.get360ImageCollections().next().value;
  }
}
