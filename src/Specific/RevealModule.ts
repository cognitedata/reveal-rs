import { PolylinesView3 } from "./PolylinesView3";
import { PolylinesNode } from "./PolylinesNode";
import { BaseModule } from "../Architecture/BaseModule";
import { ViewFactory } from "../Architecture/ViewFactory";
import { Render3DTargetNode } from "../Nodes/Render3DTargetNode";

export class RevealModule extends BaseModule
{
  protected RegisterViewsCore() : void
  {
    let factory = ViewFactory.instance;

    factory.register(PolylinesNode.staticClassName, PolylinesView3, Render3DTargetNode.staticClassName);

    let node = new PolylinesNode();
    let view = factory.create(node, Render3DTargetNode.staticClassName);

    console.log("create: " + (view != null));
    
    let canCreate = factory.canCreate(node, Render3DTargetNode.staticClassName);
    console.log("canCreate: " + canCreate);
  }
}

