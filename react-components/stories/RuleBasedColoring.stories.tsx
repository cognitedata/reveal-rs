/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResources, RevealTopbar, RevealCanvas } from '../src';
import { Color } from 'three';
import { useState } from 'react';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';

import { RuleBasedOutputsContainer } from '../src/components/RevealTopbar/RuleBasedOutputsContainer';
import { RevealStoryContext } from './utilities/RevealStoryContainer';

const meta = {
  title: 'Example/RuleBasedColoring',
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
        modelId: 4319392643513894,
        revisionId: 91463736617758,
        styling: {
          default: {
            color: new Color('#efefef')
          }
        }
      }
    ]
  },
  render: ({ resources }) => {
    const [resourceIsLoaded, setResourceIsLoaded] = useState<boolean>(false);

    const onLoaded = (): void => {
      setResourceIsLoaded(true);
    };

    return (
      <RevealStoryContext color={new Color(0x4a4a4a)}>
        {resourceIsLoaded && <RevealTopbar topbarContent={<RuleBasedOutputsContainer />} />}
        <RevealCanvas />
        <RevealResourcesFitCameraOnLoad onResourcesAdded={onLoaded} resources={resources} />
      </RevealStoryContext>
    );
  }
};
