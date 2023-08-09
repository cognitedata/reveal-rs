/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  type FdmAssetMappingsConfig,
  RevealContainer,
  RevealToolbar,
  Reveal3DResources,
  type AddResourceOptions,
  useClickedNode
} from '../src';
import { Color, Matrix4 } from 'three';
import { type ReactElement, useState, useEffect } from 'react';
import { DefaultNodeAppearance } from '@cognite/reveal';
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
  const [highlightedId, setHighlightedId] = useState<string | undefined>(undefined);

  const nodeData = useClickedNode(fdmAssetMappingConfig);

  useEffect(() => {
    setHighlightedId(nodeData?.nodeExternalId);
  }, [nodeData?.nodeExternalId]);

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
      />
      <RevealToolbar />
      NodeData is: {JSON.stringify(nodeData)}
    </>
  );
};
