/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { Reveal3DResources, RevealContainer } from '../src';
import { Color, Matrix4 } from 'three';
import { CameraController } from '../src/';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';

const model = {
  modelId: 2231774635735416,
  revisionId: 912809199849811,
  transform: new Matrix4().makeTranslation(-340, -480, 80)
};

const meta = {
  title: 'Example/ModelsStyling',
  component: Reveal3DResources,
  tags: ['autodocs'],
  argTypes: {
    resources: {
      description: 'Styling of all models',
      options: ['RedDefaultGreenMapped', 'GreenDefaultRedMapped', 'None'],
      control: {
        type: 'radio'
      },
      label: 'Styling of models',
      mapping: {
        RedDefaultGreenMapped: [
          {
            ...model,
            styling: { default: { color: new Color('red') }, mapped: { color: new Color('green') } }
          }
        ],
        GreenDefaultRedMapped: [
          {
            ...model,
            styling: {
              default: { color: new Color('green') },
              mapped: { color: new Color('red') }
            }
          }
        ],
        None: [
          {
            ...model
          }
        ]
      }
    }
  }
} satisfies Meta<typeof Reveal3DResources>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  args: {
    resources: [
      {
        ...model
      }
    ],
    defaultResourceStyling: {
      cad: {
        default: { color: new Color('#efefef') },
        mapped: { color: new Color('#c5cbff') }
      }
    }
  },
  render: ({ resources, defaultResourceStyling }) => {
    return (
      <RevealContainer
        sdk={sdk}
        color={new Color(0x4a4a4a)}
        viewerOptions={{
          loadingIndicatorStyle: {
            opacity: 1,
            placement: 'topRight'
          }
        }}>
        <Reveal3DResources resources={resources} defaultResourceStyling={defaultResourceStyling} />
        <CameraController
          initialFitCamera={{
            to: 'allModels'
          }}
          cameraControlsOptions={{
            changeCameraTargetOnClick: true,
            mouseWheelAction: 'zoomToCursor'
          }}
        />
      </RevealContainer>
    );
  }
};
