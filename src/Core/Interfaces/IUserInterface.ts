
import { BaseNode } from "@/Core/Nodes/BaseNode";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";

export interface IUserInterface
{
  updateNode(node: BaseNode, args: NodeEventArgs): void;
}
