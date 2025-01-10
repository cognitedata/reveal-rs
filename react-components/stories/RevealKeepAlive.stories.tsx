/*!
 * Copyright 2023 Cognite AS
 */
import type { Meta, StoryObj } from '@storybook/react';
import { RevealCanvas, RevealContext, RevealKeepAlive } from '../src';
import { Color, Matrix4 } from 'three';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { useState, type ReactElement } from 'react';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';

const meta = {
  title: 'Example/RevealKeepAlive',
  component: RevealKeepAlive,
  tags: ['autodocs']
} satisfies Meta<typeof RevealKeepAlive>;

export default meta;
type Story = StoryObj<typeof meta>;

const sdk = createSdkByUrlToken();

export const Main: Story = {
  render: () => <KeepAliveMockScenario />
};

const KeepAliveMockScenario = (): ReactElement => {
  const [isKeepAliveMounted, setIsKeepAliveMounted] = useState(true);
  const [isRevealContainerMounted, setIsRevealContainerMounted] = useState(true);
  const [isResourcesMounted, setIsResourcesMounted] = useState(true);
  return (
    <>
      <button
        onClick={() => {
          setIsKeepAliveMounted((prev) => !prev);
        }}>
        Toggle Mounting of RevealKeepAlive
      </button>
      <button
        onClick={() => {
          setIsRevealContainerMounted((prev) => !prev);
        }}>
        Toggle Mounting of RevealContainer
      </button>
      <button
        onClick={() => {
          setIsResourcesMounted((prev) => !prev);
        }}>
        Toggle Mounting of 3DResources
      </button>
      {isKeepAliveMounted && (
        <RevealKeepAlive>
          {isRevealContainerMounted && (
            <RevealContext sdk={sdk} color={new Color(0x4a4a4a)}>
              <RevealCanvas>
                {isResourcesMounted && (
                  <RevealResourcesFitCameraOnLoad
                    resources={[
                      {
                        modelId: 8697040515478028,
                        revisionId: 8461579143311086,
                        transform: new Matrix4().makeTranslation(40, 0, 0)
                      },
                      {
                        modelId: 8697040515478028,
                        revisionId: 8461579143311086,
                        transform: new Matrix4().makeTranslation(40, 10, 0)
                      },
                      {
                        source: 'events',
                        siteId: 'c_RC_2'
                      },
                      {
                        modelId: 3865289545346058,
                        revisionId: 4160448151596909
                      }
                    ]}
                  />
                )}
              </RevealCanvas>
            </RevealContext>
          )}
        </RevealKeepAlive>
      )}
    </>
  );
};
