/*!
 * Copyright 2023 Cognite AS
 */

import { useQuery } from '@tanstack/react-query';

import { type PointerEventData, type CogniteCadModel, type CadIntersection } from '@cognite/reveal';
import { type CogniteInternalId, type Node3D } from '@cognite/sdk';
import {
  type EdgeItem,
  type InspectResultList,
  type DmsUniqueIdentifier
} from '../../utilities/FdmSDK';
import { type FdmAssetMappingsConfig } from '../../hooks/types';
import { type NodeDataResult } from './types';
import { useFdmSdk, useSDK } from '../RevealContainer/SDKProvider';
import { useEffect, useState } from 'react';
import { useReveal } from '../..';

import assert from 'assert';

export const useNodeMappedData = (
  clickEvent: PointerEventData | undefined,
  fdmConfig?: FdmAssetMappingsConfig
): NodeDataResult | undefined => {

  const viewer = useReveal();

  const [cadIntersection, setCadIntersection] = useState<CadIntersection | undefined>(undefined);

  useEffect(() => {
    (async () => {

      if (clickEvent === undefined) {
        return;
      }

      const intersection = await viewer.getIntersectionFromPixel(
        clickEvent.offsetX,
        clickEvent.offsetY
      );

      if (intersection === null || intersection.type !== 'cad') {
        return;
      }

      const cadIntersection = intersection;
      setCadIntersection(cadIntersection);
    })();
  }, [clickEvent]);

  const ancestors = useAncestorNodesForTreeIndex(cadIntersection?.model, cadIntersection?.treeIndex);

  const mappings = useNodeMappingEdges(
    fdmConfig,
    cadIntersection?.model,
    ancestors?.map(n => n.id)
  );

  const selectedEdge = mappings !== undefined && mappings.edges.length > 0 ? mappings.edges[0] : undefined;
  const selectedNodeId =
    fdmConfig === undefined ? undefined :
    selectedEdge?.properties[fdmConfig.source.space][
      `${fdmConfig?.source.externalId}/${fdmConfig.source.version}`
    ].revisionNodeId;

  const dataNode = selectedEdge?.startNode;

  const inspectionResult = useInspectNode(dataNode);

  const dataView =
    inspectionResult?.items[0]?.inspectionResults.involvedViewsAndContainers?.views[0];

  const selectedNode = ancestors?.find((n) => n.id === selectedNodeId);

  if (selectedNode === undefined ||
    dataView === undefined ||
    dataNode === undefined ||
    cadIntersection === undefined) {
    return undefined;
  }

  return {
    nodeExternalId: dataNode.externalId,
    view: dataView,
    cadNode: selectedNode,
    intersection: cadIntersection
  };
}

function useAncestorNodesForTreeIndex(
  model: CogniteCadModel | undefined,
  treeIndex: number | undefined
): Node3D[] | undefined {

  const cogniteClient = useSDK();

  const queryResult = useQuery(
    ['cdf', '3d', 'tree-index-to-ancestors', `${model?.modelId}-${model?.revisionId}-${treeIndex}`],
    async () => {
      assert(model !== undefined && treeIndex !== undefined);

      const nodeId = await model.mapTreeIndexToNodeId(treeIndex);

      const ancestorNodes = await cogniteClient.revisions3D.list3DNodeAncestors(
        model.modelId,
        model.revisionId,
        nodeId
      );

      return ancestorNodes.items;
    },
    { enabled: model !== undefined && treeIndex !== undefined });

  return queryResult.data;
}

function useNodeMappingEdges(
  fdmConfig: FdmAssetMappingsConfig | undefined,
  model: CogniteCadModel | undefined,
  ancestorIds: CogniteInternalId[] | undefined
): { edges: Array<EdgeItem<Record<string, any>>> } | undefined {

  const fdmClient = useFdmSdk();

  const queryResult = useQuery(
    ['fdm', '3d', 'node-mapping-edges', ancestorIds],
    async () => {

      assert(fdmConfig !== undefined && model !== undefined && ancestorIds !== undefined && ancestorIds.length !== 0);

      const filter = {
        and: [
          {
            equals: {
              property: ['edge', 'endNode'],
              value: {
                space: fdmConfig.global3dSpace,
                externalId: `model_3d_${model.modelId}`
              }
            }
          },
          {
            equals: {
              property: [
                fdmConfig.source.space,
                `${fdmConfig.source.externalId}/${fdmConfig.source.version}`,
                'revisionId'
              ],
              value: model.revisionId
            }
          },
          {
            in: {
              property: [
                fdmConfig.source.space,
                `${fdmConfig.source.externalId}/${fdmConfig.source.version}`,
                'revisionNodeId'
              ],
              values: ancestorIds
            }
          }
        ]
      };

      return fdmClient.filterAllInstances(filter, 'edge', fdmConfig.source);
    }, {
      enabled: fdmConfig !== undefined && model !== undefined && ancestorIds !== undefined && ancestorIds.length !== 0
    });

  return queryResult.data;
}

function useInspectNode(
  dataNode: DmsUniqueIdentifier | undefined
): InspectResultList | undefined  {

  const fdmClient = useFdmSdk();

  const inspectionResult = useQuery(
    ['fdm', '3d', `inspect-${dataNode?.space}-${dataNode?.externalId}`],
    () => {
      assert(dataNode !== undefined);

      return fdmClient.inspectInstances({
        inspectionOperations: { involvedViewsAndContainers: {} },
        items: [
          {
            instanceType: 'node',
            externalId: dataNode.externalId,
            space: dataNode.space
          }
        ]
      })
    }, {
      enabled: dataNode !== undefined
    });

  return inspectionResult.data;
}
