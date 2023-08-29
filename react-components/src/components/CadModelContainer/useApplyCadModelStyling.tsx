/*!
 * Copyright 2023 Cognite AS
 */
import {
  type CogniteCadModel,
  DefaultNodeAppearance,
  type NodeAppearance,
  type NodeCollection,
  NodeIdNodeCollection,
  TreeIndexNodeCollection,
  type Cognite3DViewer
} from '@cognite/reveal';
import { useEffect } from 'react';
import { useSDK } from '../RevealContainer/SDKProvider';
import { type CogniteClient } from '@cognite/sdk';
import { isEqual } from 'lodash';
import { useReveal } from '../RevealContainer/RevealContext';

export type NodeStylingGroup = {
  nodeIds: number[];
  style?: NodeAppearance;
};

export type TreeIndexStylingGroup = {
  treeIndices: number[];
  style?: NodeAppearance;
};

export type CadModelStyling = {
  defaultStyle?: NodeAppearance;
  groups?: Array<NodeStylingGroup | TreeIndexStylingGroup>;
};

export const useApplyCadModelStyling = (
  model?: CogniteCadModel,
  modelStyling?: CadModelStyling
): void => {
  const viewer = useReveal();
  const sdk = useSDK();

  const defaultStyle = modelStyling?.defaultStyle ?? DefaultNodeAppearance.Default;
  const styleGroups = modelStyling?.groups;

  useEffect(() => {
    if (!modelExists(model, viewer) || styleGroups === undefined) return;

    void applyStyling(sdk, model, styleGroups);
  }, [styleGroups, model]);

  useEffect(() => {
    if (!modelExists(model, viewer)) return;

    model.setDefaultNodeAppearance(defaultStyle);
  }, [defaultStyle, model]);
};

async function applyStyling(
  sdk: CogniteClient,
  model: CogniteCadModel,
  stylingGroups: Array<NodeStylingGroup | TreeIndexStylingGroup>
): Promise<void> {
  const firstChangeIndex = await getFirstChangeIndex();

  for (let i = firstChangeIndex; i < model.styledNodeCollections.length; i++) {
    const viewerStyledNodeCollection = model.styledNodeCollections[i];
    model.unassignStyledNodeCollection(viewerStyledNodeCollection.nodeCollection);
  }

  for (let i = firstChangeIndex; i < stylingGroups.length; i++) {
    const stylingGroup = stylingGroups[i];

    if (stylingGroup.style === undefined) continue;

    if ('treeIndices' in stylingGroup) {
      const nodes = new TreeIndexNodeCollection(stylingGroup.treeIndices);
      model.assignStyledNodeCollection(nodes, stylingGroup.style);
    }

    if ('nodeIds' in stylingGroup) {
      const nodes = new NodeIdNodeCollection(sdk, model);
      await nodes.executeFilter(stylingGroup.nodeIds);
      model.assignStyledNodeCollection(nodes, stylingGroup.style);
    }
  }

  async function getFirstChangeIndex(): Promise<number> {
    for (let i = 0; i < model.styledNodeCollections.length; i++) {
      const stylingGroup = stylingGroups[i];
      const viewerStyledNodeCollection = model.styledNodeCollections[i];

      const updated = await tryUpdateStylingGroup(stylingGroup, viewerStyledNodeCollection);

      if (!updated) {
        return i;
      }
    }

    return model.styledNodeCollections.length;
  }
}

async function tryUpdateStylingGroup(
  group: NodeStylingGroup | TreeIndexStylingGroup,
  collection: {
    nodeCollection: NodeCollection;
    appearance: NodeAppearance;
  }
): Promise<boolean> {
  if (group?.style === undefined) return false;

  const isEqualGroupStyle = isEqualStyle(collection.appearance, group.style);

  if (!isEqualGroupStyle) return false;

  updateIfTreeIndexCollection();

  await updateIfNodeIdCollection();

  return true;

  async function updateIfNodeIdCollection(): Promise<void> {
    if (!(collection.nodeCollection instanceof NodeIdNodeCollection) || !('nodeIds' in group)) {
      return;
    }
    const collectionNodeIds = collection.nodeCollection.serialize().state.nodeIds as number[];
    const isEqualContent = isEqual(collectionNodeIds, group.nodeIds);

    if (!isEqualContent) {
      return;
    }

    await collection.nodeCollection.executeFilter(group.nodeIds);
  }

  function updateIfTreeIndexCollection(): void {
    if (
      !(collection.nodeCollection instanceof TreeIndexNodeCollection) ||
      !('treeIndices' in group)
    ) {
      return;
    }
    const compareCollection = new TreeIndexNodeCollection(group.treeIndices);
    const isEqualContent = isEqualTreeIndex(collection.nodeCollection, compareCollection);

    if (isEqualContent) {
      return;
    }
    collection.nodeCollection.updateSet(group.treeIndices);
  }
}

function isEqualTreeIndex(
  collectionA: TreeIndexNodeCollection,
  collectionB: TreeIndexNodeCollection
): boolean {
  const setA = collectionA.getIndexSet();
  const setB = collectionB.getIndexSet();

  const setBContainsSetA = setA.clone().differenceWith(setB).count === 0;
  return setBContainsSetA && setA.count === setB.count;
}

function isEqualStyle(styleA: NodeAppearance, styleB: NodeAppearance): boolean {
  const { color: colorA, ...restA } = styleA;
  const { color: colorB, ...restB } = styleB;

  const color =
    colorA === undefined || colorB === undefined
      ? Boolean(colorA ?? colorB)
      : colorA.equals(colorB);

  return color && isEqual(restA, restB);
}

export function modelExists(
  model: CogniteCadModel | undefined,
  viewer: Cognite3DViewer
): model is CogniteCadModel {
  return model !== undefined && viewer.models.includes(model);
}
