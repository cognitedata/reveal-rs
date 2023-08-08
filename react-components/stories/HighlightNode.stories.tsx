/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  type FdmAssetMappingsConfig,
  RevealContainer,
  RevealToolbar,
  Reveal3DResources,
  type NodeDataResult,
  type AddResourceOptions
} from '../src';
import { Color, Matrix4 } from 'three';
import { type ReactElement, useState } from 'react';
import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@cognite/reveal';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { DefaultFdmConfig } from './utilities/fdmConfig';

const meta = {
  title: 'Example/HighlightNode',
  component: Reveal3DResources,
  tags: ['autodocs']
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    resources: [
      {
        modelId: 2551525377383868,
        revisionId: 2143672450453400,
        transform: new Matrix4().makeTranslation(-340, -480, 80)
      }
    ],
    styling: {},
    fdmAssetMappingConfig: DefaultFdmConfig
  },
  render: ({ resources, fdmAssetMappingConfig }) => {
    return (
      <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
        <StoryContent resources={resources} fdmAssetMappingConfig={fdmAssetMappingConfig} />
      </RevealContainer>
    );
  }
};

const StoryContent = ({
  resources,
  fdmAssetMappingConfig
}: {
  resources: AddResourceOptions[];
  fdmAssetMappingConfig?: FdmAssetMappingsConfig;
}): ReactElement => {
  const [nodeData, setNodeData] = useState<any>(undefined);

  const [highlightedId, setHighlightedId] = useState<string | undefined>(undefined);

  const callback = async (nodeData: Promise<NodeDataResult | undefined>): Promise<void> => {
    const nodeDataResult = await nodeData;
    setNodeData(nodeDataResult);
    setHighlightedId(nodeDataResult?.nodeExternalId);

    if (nodeDataResult === undefined) return;

    nodeDataResult.intersection.model.assignStyledNodeCollection(
      new TreeIndexNodeCollection([nodeDataResult.cadNode.treeIndex]),
      DefaultNodeAppearance.Highlighted
    );
  };

  return (
    <>
      <Reveal3DResources
        resources={resources}
        styling={{
          groups:
            highlightedId === undefined
              ? undefined
              : [
                  {
                    fdmAssetExternalIds: [highlightedId],
                    style: { cad: DefaultNodeAppearance.Highlighted }
                  }
                ]
        }}
        fdmAssetMappingConfig={fdmAssetMappingConfig}
        onNodeClick={(nodeData) => {
          void callback(nodeData);
        }}
      />
      <RevealToolbar />
      NodeData is: {JSON.stringify(nodeData)}
    </>
  );
};
