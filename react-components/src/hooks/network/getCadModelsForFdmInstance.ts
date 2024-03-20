/*!
 * Copyright 2024 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import { type DmsUniqueIdentifier, type EdgeItem, type FdmSDK } from '../../utilities/FdmSDK';
import {
  type InModel3dEdgeProperties,
  SYSTEM_3D_EDGE_SOURCE
} from '../../utilities/globalDataModels';
import { isDefined } from '../../utilities/isDefined';

type ModelForInstancesResponse = {
  model_edges: Array<EdgeItem<Record<string, Record<string, InModel3dEdgeProperties>>>>;
};

export async function getCadModelsForFdmInstance(
  instance: DmsUniqueIdentifier,
  sdk: FdmSDK
): Promise<AddModelOptions[]> {
  const result = (
    await sdk.queryNodesAndEdges({
      ...modelsForInstanceQuery,
      parameters: { instanceExternalId: instance.externalId, instanceSpace: instance.space }
    })
  ).items as ModelForInstancesResponse;

  const modelAndRevisionIds = result.model_edges
    .map((edge) => {
      const properties = Object.values(Object.values(edge.properties)[0])[0];

      const modelIdString = edge.instanceType;
      const modelId = Number(modelIdString);

      if (isNaN(modelId)) {
        return undefined;
      }

      return { modelId, revisionId: properties.revisionId };
    })
    .filter(isDefined);

  return modelAndRevisionIds;
}

const modelsForInstanceQuery = {
  with: {
    start_instance: {
      nodes: {
        filter: {
          and: [
            {
              equals: {
                property: ['node', 'externalId'],
                value: { parameter: 'instanceExternalId' }
              }
            },
            {
              equals: {
                property: ['node', 'space'],
                value: { parameter: 'instanceSpace' }
              }
            }
          ]
        }
      },
      limit: 1
    },
    model_edges: {
      edges: {
        from: 'start_instance',
        maxDistance: 1,
        direction: 'outwards',
        filter: {
          and: [
            {
              hasData: [SYSTEM_3D_EDGE_SOURCE]
            }
          ]
        }
      },
      limit: 1000
    }
  },
  select: {
    model_edges: {
      sources: [{ source: SYSTEM_3D_EDGE_SOURCE, properties: [] }]
    }
  }
} as const;
