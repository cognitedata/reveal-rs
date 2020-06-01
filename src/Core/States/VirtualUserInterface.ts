import { IUserInterface } from "@/Core/Interfaces/IUserInterface";
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

export class VirtualUserInterface
{
  //==================================================
  // STATIV PROPERTIES AND FIELDS
  //==================================================

  private static userInterface: IUserInterface | null = null;

  //==================================================
  // STATIC METHODS
  //==================================================

  static install(userInterface: IUserInterface): void
  {
    this.userInterface = userInterface;
  }

  static updateNode(node: BaseNode, args: NodeEventArgs): void
  {
    VirtualUserInterface.userInterface?.updateNode(node, args);
  }

}