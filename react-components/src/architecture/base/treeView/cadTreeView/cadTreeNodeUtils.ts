/*!
 * Copyright 2024 Cognite AS
 */

import type { List3DNodesQuery, CogniteClient, ListResponse, Node3D } from '@cognite/sdk';
import { CadTreeNode } from './CadTreeNode';

export type RevisionId = {
  modelId: number;
  revisionId: number;
};

type FetchNodesArgs = {
  sdk: CogniteClient;
  id: RevisionId;
  node: CadTreeNode;
  loadChildren: boolean;
};

export async function fetchTreeNodeRoot(sdk: CogniteClient, id: RevisionId): Promise<CadTreeNode> {
  const rootNodeObjResponse = await sdk.revisions3D.list3DNodes(id.modelId, id.revisionId, {
    depth: 0,
    limit: 1
  });
  const rootNode = rootNodeObjResponse.items[0];
  const cadTreeNode = new CadTreeNode(rootNode);
  cadTreeNode.needLoadChildren = true;
  cadTreeNode.isExpanded = true;
  return cadTreeNode;
}

export async function fetchTreeNodeArray(args: FetchNodesArgs): Promise<CadTreeNode[]> {
  const data = await loadNode3DArray(args);

  const cadTreeNodes: CadTreeNode[] = data.items.map((node) => {
    const cadTreeNode = new CadTreeNode(node);
    cadTreeNode.needLoadChildren = node.subtreeSize > 1;
    return cadTreeNode;
  });

  if (data.nextCursor !== undefined) {
    const lastNode = cadTreeNodes[cadTreeNodes.length - 1];
    lastNode.loadSiblingCursor = data.nextCursor;
  }
  return cadTreeNodes;
}

const LIST_NODES_PARAMS: List3DNodesQuery = { depth: 1, limit: 100 } as const;

async function loadNode3DArray(args: FetchNodesArgs): Promise<ListResponse<Node3D[]>> {
  const { sdk, id, node, loadChildren } = args;
  if (loadChildren) {
    const response = await sdk.revisions3D.list3DNodes(id.modelId, id.revisionId, {
      ...LIST_NODES_PARAMS,
      nodeId: node.id
    });
    response.items = response.items.filter((responseNode) => responseNode.id !== node.id);
    return response;
  }
  if (!(node.parent instanceof CadTreeNode)) {
    throw new Error('Parent node id is undefined');
  }
  return await sdk.revisions3D.list3DNodes(id.modelId, id.revisionId, {
    ...LIST_NODES_PARAMS,
    nodeId: node.parent?.id,
    cursor: node.loadSiblingCursor
  });
}
