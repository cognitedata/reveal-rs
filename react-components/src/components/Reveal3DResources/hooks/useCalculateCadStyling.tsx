/*!
 * Copyright 2023 Cognite AS
 */
import {
  type HybridFdmAssetStylingGroup,
  type AssetStylingGroup,
  type CadModelOptions,
  type DefaultResourceStyling,
  type FdmAssetStylingGroup
} from '../types';
import { NumericRange, type NodeAppearance, IndexSet } from '@cognite/reveal';
import { type Node3D, type CogniteExternalId, type AssetMapping3D } from '@cognite/sdk';
import { useFdmAssetMappings } from '../../../hooks/cad/useFdmAssetMappings';
import { useMemo } from 'react';
import {
  type NodeId,
  type FdmConnectionWithNode,
  type AssetId,
  type ModelRevisionAssetNodesResult
} from '../../CacheProvider/types';
import {
  type CadStylingGroup,
  type NodeStylingGroup,
  type TreeIndexStylingGroup
} from '../../CadModelContainer/types';
import {
  isClassicAssetMappingStylingGroup,
  isFdmAssetStylingGroup,
  isHybridFdmAssetStylingGroup
} from '../../../utilities/StylingGroupUtils';
import { type ThreeDModelFdmMappings } from '../../../hooks/types';
import { isSameModel } from '../../../utilities/isSameModel';
import {
  useAssetMappedNodesForRevisions,
  useMappedEdgesForRevisions,
  useNodesForAssets
} from '../../../hooks/cad';
import { useHybridAssetMappings } from '../../../hooks/cad/useHybridAssetMappings';
import { createFdmKey } from '../../CacheProvider/idAndKeyTranslation';

type ModelStyleGroup = {
  model: CadModelOptions;
  styleGroup: Array<NodeStylingGroup | TreeIndexStylingGroup>;
};

type ModelStyleGroupWithMappingsFetched = {
  combinedMappedStyleGroups: ModelStyleGroup[];
  isModelMappingsLoading: boolean;
};

type StyledModelWithMappingsFetched = {
  styledModels: StyledModel[];
  isModelMappingsLoading: boolean;
};

export type StyledModel = {
  model: CadModelOptions;
  styleGroups: CadStylingGroup[];
};

export const useCalculateCadStyling = (
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup | HybridFdmAssetStylingGroup>,
  defaultResourceStyling?: DefaultResourceStyling
): StyledModelWithMappingsFetched => {
  const modelsMappedStyleGroups = useCalculateMappedStyling(
    models,
    defaultResourceStyling?.cad?.mapped
  );
  const modelInstanceStyleGroupsAndMappingFetched = useCalculateInstanceStyling(
    models,
    instanceGroups
  );

  const joinedStyleGroups = useJoinStylingGroups(
    models,
    modelsMappedStyleGroups.combinedMappedStyleGroups,
    modelInstanceStyleGroupsAndMappingFetched.combinedMappedStyleGroups
  );

  return {
    styledModels: joinedStyleGroups,
    isModelMappingsLoading:
      modelInstanceStyleGroupsAndMappingFetched.isModelMappingsLoading ||
      modelsMappedStyleGroups.isModelMappingsLoading
  };
};

function useCalculateMappedStyling(
  models: CadModelOptions[],
  defaultMappedNodeAppearance?: NodeAppearance
): ModelStyleGroupWithMappingsFetched {
  const modelsRevisionsWithMappedEquipment = useMemo(
    () => getMappedCadModelsOptions(),
    [models, defaultMappedNodeAppearance]
  );
  const {
    data: mappedEquipmentEdges,
    isLoading: isFDMEquipmentMappingsLoading,
    isFetched: isFDMEquipmentMappingsFetched,
    isError: isFDMEquipmentMappingsError
  } = useMappedEdgesForRevisions(modelsRevisionsWithMappedEquipment);

  const {
    data: assetMappingData,
    isLoading: isAssetMappingsLoading,
    isFetched: isAssetMappingsFetched,
    isError: isAssetMappingsError
  } = useAssetMappedNodesForRevisions(modelsRevisionsWithMappedEquipment);

  const modelsMappedFdmStyleGroups = useMemo(() => {
    const isFdmMappingUnavailableOrLoading =
      models.length === 0 ||
      mappedEquipmentEdges === undefined ||
      mappedEquipmentEdges.size === 0 ||
      isFDMEquipmentMappingsLoading;

    if (isFdmMappingUnavailableOrLoading) {
      return [];
    }

    return modelsRevisionsWithMappedEquipment.map((model) => {
      const fdmData = mappedEquipmentEdges?.get(`${model.modelId}/${model.revisionId}`) ?? [];
      const modelStyle = model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroup =
        modelStyle !== undefined ? [getMappedStyleGroupFromFdm(fdmData, modelStyle)] : [];
      return { model, styleGroup };
    });
  }, [
    modelsRevisionsWithMappedEquipment,
    mappedEquipmentEdges,
    defaultMappedNodeAppearance,
    isFDMEquipmentMappingsLoading
  ]);

  const modelsMappedAssetStyleGroups = useMemo(() => {
    const isAssetMappingUnavailableOrLoading =
      models.length === 0 ||
      assetMappingData === undefined ||
      assetMappingData.length === 0 ||
      isAssetMappingsLoading;

    if (isAssetMappingUnavailableOrLoading) {
      return [];
    }

    return assetMappingData.map((assetMappedModel) => {
      const modelStyle = assetMappedModel.model.styling?.mapped ?? defaultMappedNodeAppearance;

      const styleGroup =
        modelStyle !== undefined
          ? [getMappedStyleGroupFromAssetMappings(assetMappedModel.assetMappings, modelStyle)]
          : [];
      return { model: assetMappedModel.model, styleGroup };
    });
  }, [
    modelsRevisionsWithMappedEquipment,
    assetMappingData,
    defaultMappedNodeAppearance,
    isAssetMappingsLoading
  ]);

  const combinedMappedStyleGroups = useMemo(
    () =>
      groupStyleGroupByModel(models, [
        ...modelsMappedAssetStyleGroups,
        ...modelsMappedFdmStyleGroups
      ]),
    [modelsMappedAssetStyleGroups, modelsMappedFdmStyleGroups]
  );

  return {
    combinedMappedStyleGroups,
    isModelMappingsLoading:
      (!isFDMEquipmentMappingsError &&
        isFDMEquipmentMappingsLoading &&
        !isFDMEquipmentMappingsFetched) ||
      (!isAssetMappingsError && isAssetMappingsLoading && !isAssetMappingsFetched)
  };

  function getMappedCadModelsOptions(): CadModelOptions[] {
    if (defaultMappedNodeAppearance !== undefined) {
      return models;
    }

    return models.filter((model) => model.styling?.mapped !== undefined);
  }
}

function useCalculateInstanceStyling(
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup | HybridFdmAssetStylingGroup>
): ModelStyleGroupWithMappingsFetched {
  const { data: fdmAssetMappings } = useFdmAssetMappings(
    instanceGroups
      .filter(isFdmAssetStylingGroup)
      .flatMap((instanceGroup) => instanceGroup.fdmAssetExternalIds),
    models
  );

  const assetIdsFromInstanceGroups = instanceGroups
    .filter(isClassicAssetMappingStylingGroup)
    .flatMap((instanceGroup) => instanceGroup.assetIds);

  const hybridFdmAssetFromInstanceGroups = instanceGroups
    .filter(isHybridFdmAssetStylingGroup)
    .flatMap((instanceGroup) => instanceGroup.hybridFdmAssetExternalIds);

  const {
    data: modelAssetMappings,
    isLoading: isModelMappingsLoading,
    isFetched: isModelMappingsFetched,
    isError
  } = useNodesForAssets(models, assetIdsFromInstanceGroups);

  const { data: modelHybridAssetMappings } = useHybridAssetMappings(
    hybridFdmAssetFromInstanceGroups,
    models
  );

  const fdmModelInstanceStyleGroups = useFdmInstanceStyleGroups(
    models,
    instanceGroups,
    fdmAssetMappings
  );

  const assetMappingInstanceStyleGroups = useAssetMappingInstanceStyleGroups(
    models,
    instanceGroups,
    modelAssetMappings
  );

  const hybridAssetMappingInstanceStyleGroups = useHybridFdmInstanceStyleGroups(
    models,
    instanceGroups,
    modelHybridAssetMappings
  );

  const combinedMappedStyleGroups = useMemo(
    () =>
      groupStyleGroupByModel(models, [
        ...fdmModelInstanceStyleGroups,
        ...assetMappingInstanceStyleGroups,
        ...hybridAssetMappingInstanceStyleGroups
      ]),
    [
      fdmModelInstanceStyleGroups,
      assetMappingInstanceStyleGroups,
      hybridAssetMappingInstanceStyleGroups
    ]
  );

  return {
    combinedMappedStyleGroups,
    isModelMappingsLoading: !isError && isModelMappingsLoading && !isModelMappingsFetched
  };
}

function useAssetMappingInstanceStyleGroups(
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup | HybridFdmAssetStylingGroup>,
  modelAssetMappings: ModelRevisionAssetNodesResult[] | undefined
): ModelStyleGroup[] {
  return useMemo(() => {
    if (modelAssetMappings === undefined || modelAssetMappings.length === 0) {
      return [];
    }

    return models.map((model, index) => {
      return calculateAssetMappingCadModelStyling(
        instanceGroups.filter(isClassicAssetMappingStylingGroup),
        modelAssetMappings[index].assetToNodeMap,
        model
      );
    });
  }, [models, instanceGroups, modelAssetMappings]);
}

function useFdmInstanceStyleGroups(
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup | HybridFdmAssetStylingGroup>,
  fdmAssetMappings: ThreeDModelFdmMappings[] | undefined
): ModelStyleGroup[] {
  return useMemo(() => {
    if (models.length === 0 || fdmAssetMappings === undefined) {
      return [];
    }

    return models.map((model) => {
      const styleGroup =
        fdmAssetMappings !== undefined
          ? calculateFdmCadModelStyling(
              instanceGroups.filter(isFdmAssetStylingGroup),
              fdmAssetMappings,
              model
            )
          : [];
      return { model, styleGroup };
    });
  }, [models, instanceGroups, fdmAssetMappings]);
}

function useHybridFdmInstanceStyleGroups(
  models: CadModelOptions[],
  instanceGroups: Array<FdmAssetStylingGroup | AssetStylingGroup | HybridFdmAssetStylingGroup>,
  fdmAssetMappings: ThreeDModelFdmMappings[] | undefined
): ModelStyleGroup[] {
  return useMemo(() => {
    if (models.length === 0 || fdmAssetMappings === undefined) {
      return [];
    }
    return models.map((model) => {
      const styleGroup =
        fdmAssetMappings !== undefined
          ? calculateHybridAssetMappingCadModelStyling(
              instanceGroups.filter(isHybridFdmAssetStylingGroup),
              fdmAssetMappings,
              model
            )
          : [];
      return { model, styleGroup };
    });
  }, [models, instanceGroups, fdmAssetMappings]);
}

function useJoinStylingGroups(
  models: CadModelOptions[],
  modelsMappedStyleGroups: ModelStyleGroup[],
  modelInstanceStyleGroups: ModelStyleGroup[]
): StyledModel[] {
  const modelsStyling = useMemo(() => {
    if (modelInstanceStyleGroups.length === 0 && modelsMappedStyleGroups.length === 0) {
      return extractDefaultStyles(models);
    }
    return models.map((model) => {
      const mappedStyleGroup =
        modelsMappedStyleGroups.find((typedModel) => isSameModel(typedModel.model, model))
          ?.styleGroup ?? [];
      const instanceStyleGroups = modelInstanceStyleGroups
        .filter((typedModel) => isSameModel(typedModel.model, model))
        .flatMap((typedModel) => typedModel.styleGroup);

      if (model.styling?.nodeGroups !== undefined) {
        instanceStyleGroups.push(...model.styling.nodeGroups);
      }

      return {
        model,
        styleGroups: [...mappedStyleGroup, ...instanceStyleGroups]
      };
    });
  }, [models, modelInstanceStyleGroups, modelsMappedStyleGroups]);

  return modelsStyling;
}

function groupStyleGroupByModel(
  models: CadModelOptions[],
  styleGroup: ModelStyleGroup[]
): ModelStyleGroup[] {
  const initialStyleGroups = models.map((model) => ({ model, styleGroup: [] }));
  return styleGroup.reduce<ModelStyleGroup[]>((accumulatedGroups, currentGroup) => {
    const existingGroupWithModel = accumulatedGroups.find((group) =>
      isSameModel(group.model, currentGroup.model)
    );
    existingGroupWithModel?.styleGroup.push(...currentGroup.styleGroup);
    return accumulatedGroups;
  }, initialStyleGroups);
}

function extractDefaultStyles(typedModels: CadModelOptions[]): StyledModel[] {
  return typedModels.map((model) => {
    return {
      model,
      styleGroups: []
    };
  });
}

function getMappedStyleGroupFromFdm(
  edges: FdmConnectionWithNode[],
  mapped: NodeAppearance
): TreeIndexStylingGroup {
  const indexSet = new IndexSet();
  edges.forEach((edge) => {
    const treeIndexRange = getNodeSubtreeNumericRange(edge.cadNode);
    indexSet.addRange(treeIndexRange);
  });

  return { treeIndexSet: indexSet, style: mapped };
}

function getMappedStyleGroupFromAssetMappings(
  assetMappings: AssetMapping3D[],
  nodeAppearance: NodeAppearance
): TreeIndexStylingGroup {
  const indexSet = new IndexSet();
  assetMappings.forEach((assetMapping) => {
    const range = new NumericRange(assetMapping.treeIndex, assetMapping.subtreeSize);
    indexSet.addRange(range);
  });

  return { treeIndexSet: indexSet, style: nodeAppearance };
}

function calculateFdmCadModelStyling(
  stylingGroups: FdmAssetStylingGroup[],
  mappings: ThreeDModelFdmMappings[],
  model: CadModelOptions
): TreeIndexStylingGroup[] {
  const modelMappings = getModelMappings(mappings, model);

  return stylingGroups
    .map((resourcesGroup) => {
      const modelMappedNodeLists = resourcesGroup.fdmAssetExternalIds
        .map((uniqueId) => modelMappings.get(uniqueId.externalId))
        .filter((nodeMap): nodeMap is Map<NodeId, Node3D> => nodeMap !== undefined)
        .map((nodeMap) => [...nodeMap.values()]);

      const indexSet = new IndexSet();
      modelMappedNodeLists.forEach((nodes) => {
        nodes.forEach((n) => {
          indexSet.addRange(getNodeSubtreeNumericRange(n));
        });
      });

      return {
        style: resourcesGroup.style.cad,
        treeIndexSet: indexSet
      };
    })
    .filter((group) => group.treeIndexSet.count > 0);
}

function calculateHybridAssetMappingCadModelStyling(
  stylingGroups: HybridFdmAssetStylingGroup[],
  mappings: ThreeDModelFdmMappings[],
  model: CadModelOptions
): TreeIndexStylingGroup[] {
  const modelMappings = getModelMappings(mappings, model);

  return stylingGroups
    .map((resourcesGroup) => {
      const modelMappedNodeLists = resourcesGroup.hybridFdmAssetExternalIds
        .map((uniqueId) => modelMappings.get(createFdmKey(uniqueId)))
        .filter((nodeMap): nodeMap is Map<NodeId, Node3D> => nodeMap !== undefined)
        .map((nodeMap) => [...nodeMap.values()]);

      const indexSet = new IndexSet();
      modelMappedNodeLists.forEach((nodes) => {
        nodes.forEach((n) => {
          indexSet.addRange(getNodeSubtreeNumericRange(n));
        });
      });

      return {
        style: resourcesGroup.style.cad,
        treeIndexSet: indexSet
      };
    })
    .filter((group) => group.treeIndexSet.count > 0);
}

function calculateAssetMappingCadModelStyling(
  stylingGroups: AssetStylingGroup[],
  nodeMap: Map<AssetId, Node3D[]>,
  model: CadModelOptions
): ModelStyleGroup {
  const treeIndexSetsWithStyle = stylingGroups
    .map((group) => {
      const indexSet = new IndexSet();
      group.assetIds
        .map((assetId) => nodeMap.get(assetId))
        .forEach((nodeList) =>
          nodeList
            ?.filter((node): node is Node3D => node !== undefined)
            .forEach((node) => {
              indexSet.addRange(new NumericRange(node.treeIndex, node.subtreeSize));
            })
        );

      return {
        treeIndexSet: indexSet,
        style: group.style.cad
      };
    })
    .filter((setWithStyle) => setWithStyle.treeIndexSet.count > 0);

  return {
    model,
    styleGroup: treeIndexSetsWithStyle
  };
}

function getNodeSubtreeNumericRange(node: Node3D): NumericRange {
  return new NumericRange(node.treeIndex, node.subtreeSize);
}

function getModelMappings(
  mappings: ThreeDModelFdmMappings[],
  model: CadModelOptions
): Map<CogniteExternalId, Map<NodeId, Node3D>> {
  return mappings
    .filter(
      (mapping) => mapping.modelId === model.modelId && mapping.revisionId === model.revisionId
    )
    .reduce(
      // reduce is added to avoid duplication of a models that span several pages.
      (acc, mapping) => {
        mergeMapsWithDeduplicatedNodes(acc.mappings, mapping.mappings);
        return acc;
      },
      {
        modelId: model.modelId,
        revisionId: model.revisionId,
        mappings: new Map<string, Map<NodeId, Node3D>>()
      }
    ).mappings;
}

function mergeMapsWithDeduplicatedNodes(
  targetMap: Map<string, Map<NodeId, Node3D>>,
  addedMap: Map<string, Node3D[]>
): Map<string, Map<NodeId, Node3D>> {
  return [...addedMap.entries()].reduce((map, [fdmKey, nodesToAdd]) => {
    const targetSet = map.get(fdmKey);

    if (targetSet !== undefined) {
      nodesToAdd.forEach((node) => targetSet.set(node.id, node));
    } else {
      map.set(fdmKey, new Map(nodesToAdd.map((node) => [node.id, node])));
    }

    return map;
  }, targetMap);
}
