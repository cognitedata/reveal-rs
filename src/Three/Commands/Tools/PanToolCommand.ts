
import { ThreeRenderTargetNode } from "@/Three/Nodes/ThreeRenderTargetNode";
import { ToolCommand } from "@/Three/Commands/Tools/ToolCommand";

export class PanToolCommand extends ToolCommand {

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(target: ThreeRenderTargetNode | null = null) {
    super(target);
  }

  //==================================================
  // OVERRIDES of BaseCommand
  //==================================================

  public get name(): string { return "Pan/Rotate/Zoom" }
}


