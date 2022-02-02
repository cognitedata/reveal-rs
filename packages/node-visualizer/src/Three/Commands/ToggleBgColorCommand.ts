import ToggleBgColorCommandBlackIcon from '../../images/Commands/ToggleBgColorCommandBlack.png';
import ToggleBgColorCommandWhiteIcon from '../../images/Commands/ToggleBgColorCommandWhite.png';
import { ThreeRenderTargetCommand } from '../Commands/ThreeRenderTargetCommand';
import { ThreeRenderTargetNode } from '../Nodes/ThreeRenderTargetNode';

export class ToggleBgColorCommand extends ThreeRenderTargetCommand {
  //= =================================================
  // CONSTRUCTOR
  //= =================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //= =================================================
  // OVERRIDES of BaseCommand
  //= =================================================

  public /* override */ getName(): string {
    return 'Toggle between black and white backgroud';
  }

  public /* override */ getIcon(): string {
    return this.isChecked
      ? ToggleBgColorCommandWhiteIcon
      : ToggleBgColorCommandBlackIcon;
  }

  public get /* override */ isCheckable(): boolean {
    return true;
  }

  public get /* override */ isChecked(): boolean {
    return this.target ? this.target.isLightBackground : false;
  }

  protected /* override */ invokeCore(): boolean {
    if (!this.target) return false;

    this.target.isLightBackground = !this.target.isLightBackground;
    this.target.invalidate();
    return true;
  }
}
