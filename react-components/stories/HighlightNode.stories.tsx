/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  RevealContainer,
  RevealToolbar,
  Reveal3DResources,
  type NodeDataResult,
  type AddResourceOptions,
  type FdmAssetStylingGroup,
  useCameraNavigation
} from '../src';
import { Color } from 'three';
import { type ReactElement, useState, useCallback } from 'react';
import { DefaultNodeAppearance } from '@cognite/reveal';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';

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
        modelId: 2231774635735416,
        revisionId: 912809199849811,
        styling: {
          default: {
            color: new Color('#efefef')
          },
          mapped: {
            color: new Color('#c5cbff')
          }
        }
      }
    ]
  },
  render: ({ resources }) => {
    return (
      <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
        <StoryContent resources={resources} />
        <ReactQueryDevtools />
      </RevealContainer>
    );
  }
};

const StoryContent = ({ resources }: { resources: AddResourceOptions[] }): ReactElement => {
  const [stylingGroups, setStylingGroups] = useState<FdmAssetStylingGroup[]>([]);
  const cameraNavigation = useCameraNavigation();
  const [state, setState] = useState(false);

  const onClick = useCallback(
    async (nodeData: Promise<NodeDataResult | undefined>): Promise<void> => {
      const nodeDataResult = await nodeData;

      if (nodeDataResult === undefined) return;

      await cameraNavigation.fitCameraToInstance(nodeDataResult.nodeExternalId, 'pdms-mapping');

      setStylingGroups([
        {
          fdmAssetExternalIds: [
            { externalId: nodeDataResult.nodeExternalId, space: 'pdms-mapping' }
          ],
          style: { cad: DefaultNodeAppearance.Highlighted }
        }
      ]);
    },
    []
  );

  return (
    <>
      <RevealResourcesFitCameraOnLoad
        resources={resources}
        instanceStyling={stylingGroups}
        onNodeClick={onClick}
      />
      <RevealToolbar />
      <button
        onClick={() => {
          setState(!state);
        }}>
        Re-render resources
      </button>
    </>
  );
};
