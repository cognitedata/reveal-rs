/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import { CogniteCadModelContainer, RevealContainer, Toolbar, ToolbarButton } from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color } from 'three';

const meta = {
  title: 'Example/Toolbar',
  component: CogniteCadModelContainer,
  tags: ['autodocs']
} satisfies Meta<typeof CogniteCadModelContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const token = new URLSearchParams(window.location.search).get('token') ?? '';
const sdk = new CogniteClient({
  appId: 'reveal.example',
  baseUrl: 'https://greenfield.cognitedata.com',
  project: '3d-test',
  getToken: async () => await Promise.resolve(token)
});

export const Main: Story = {
  args: {
    addModelOptions: {
      modelId: 1791160622840317,
      revisionId: 498427137020189
    }
  },
  render: ({ addModelOptions }) => (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
      <CogniteCadModelContainer addModelOptions={addModelOptions} />
      <Toolbar />
    </RevealContainer>
  )
};
