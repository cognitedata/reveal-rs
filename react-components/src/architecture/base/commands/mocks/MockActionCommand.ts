/*!
 * Copyright 2024 Cognite AS
 */

import { type IconName } from '../../utilities/IconName';
import { type TranslationInput } from '../../utilities/TranslateInput';
import { RenderTargetCommand } from '../RenderTargetCommand';

export class MockActionCommand extends RenderTargetCommand {
  // ==================================================
  // OVERRIDES
  // ==================================================

  public override get tooltip(): TranslationInput {
    return { untranslated: 'Action' };
  }

  public override get icon(): IconName {
    return 'Sun';
  }

  protected override get shortCutKey(): string | undefined {
    return 'A';
  }

  protected override get shortCutKeyOnCtrl(): boolean {
    return true;
  }

  protected override invokeCore(): boolean {
    return true;
  }
}
