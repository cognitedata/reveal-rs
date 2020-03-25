/*!
 * Copyright 2020 Cognite AS
 */

import { Subject, Observable } from 'rxjs';
import { bufferTime, flatMap, filter, mergeAll, map, share, tap, first } from 'rxjs/operators';
import { CogniteClient, InternalId, Node3D } from '@cognite/sdk';

type NodeIdRequest = InternalId;

export class NodeIdAndTreeIndexMaps {
  readonly nodeIdToTreeIndexMap: Map<number, number>;
  readonly nodeIdRequestObservable: Subject<NodeIdRequest>;
  readonly nodeIdResponse: Observable<Node3D>;
  constructor(modelId: number, revisionId: number, client: CogniteClient) {
    this.nodeIdToTreeIndexMap = new Map();
    this.nodeIdRequestObservable = new Subject();
    this.nodeIdResponse = this.nodeIdRequestObservable.pipe(
      bufferTime(50),
      filter((requests: NodeIdRequest[]) => requests.length > 0),
      flatMap(async (requests: NodeIdRequest[]) => {
        const responses = await client.revisions3D.retrieve3DNodes(modelId, revisionId, requests);
        return responses;
      }),
      mergeAll(),
      tap((node: Node3D) => this.nodeIdToTreeIndexMap.set(node.id, node.treeIndex)),
      share()
    );
  }

  async getTreeIndex(nodeId: number) {
    const treeIndex = this.nodeIdToTreeIndexMap.get(nodeId);
    if (treeIndex) {
      return treeIndex;
    }

    const result = this.nodeIdResponse
      .pipe(
        first((node: Node3D) => node.id === nodeId),
        map((node: Node3D) => node.treeIndex)
      )
      .toPromise();

    this.nodeIdRequestObservable.next({
      id: nodeId
    });
    return result;
  }
}
