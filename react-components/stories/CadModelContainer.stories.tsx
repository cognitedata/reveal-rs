/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { CadModelContainer, RevealContainer } from '../src';
import { CogniteClient } from '@cognite/sdk';
import { Color, Matrix4 } from 'three';
import { NumericRange } from '@cognite/reveal';

const meta = {
  title: 'Example/PrimitiveWrappers/CadModelContainer',
  component: CadModelContainer,
  argTypes: {
    styling: {
      description: 'Styling of the first model',
      options: ['FullRed', 'HalfGreen', 'SomeBlue', 'None'],
      label: 'Styling of the first model',
      mapping: {
        FullRed: {
          defaultStyle: { color: new Color('red') }
        },
        HalfGreen: {
          groups: [
            {
              treeIndices: new NumericRange(0, 40),
              style: { color: new Color('green') }
            }
          ]
        },
        SomeBlue: {
          groups: [
            {
              nodeIds: [8757509474262596, 2712303310330098, 1903632131225149, 8923105504012177, 3709428615074138],
              style: { color: new Color('blue') }
            }
          ]
        },
        None: {}
      }
    }
  },
  tags: ['autodocs']
} satisfies Meta<typeof CadModelContainer>;

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
    },
    styling: {
    },
    transform: new Matrix4().makeTranslation(0, 10, 0)
  },
  render: ({ addModelOptions, transform, styling}) => (
    <RevealContainer sdk={sdk} color={new Color(0x4a4a4a)}>
      <CadModelContainer addModelOptions={addModelOptions} styling={styling}/>
      <CadModelContainer addModelOptions={addModelOptions} transform={transform} />
    </RevealContainer>
  )
};
