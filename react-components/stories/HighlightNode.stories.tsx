/*!
 * Copyright 2023 Cognite AS
 */

import type { Meta, StoryObj } from '@storybook/react';
import {
  RevealCanvas,
  RevealToolbar,
  Reveal3DResources,
  useClickedNodeData,
  useCameraNavigation,
  type AddResourceOptions,
  RevealContext
} from '../src';
import { Color } from 'three';
import { type ReactElement, useState, useEffect } from 'react';
import { type CadIntersection, DefaultNodeAppearance } from '@cognite/reveal';
import { createSdkByUrlToken } from './utilities/createSdkByUrlToken';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RevealResourcesFitCameraOnLoad } from './utilities/with3dResoursesFitCameraOnLoad';
import { type InstanceStylingGroup } from '../src/components/Reveal3DResources/types';
import { getInstanceReferenceFromImage360Annotation } from '../src/components/CacheProvider/utils';
import { isInternalId } from '../src/utilities/instanceIds';

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
      },
      {
        modelId: 1350257070750400,
        revisionId: 5110855034466831,
        styling: {
          default: {
            color: new Color('#efefef')
          },
          mapped: {
            color: new Color('#c5cbff')
          }
        }
      },
      {
        source: 'events',
        siteId: 'celanese1'
      }
    ]
  },
  render: ({ resources }: { resources: AddResourceOptions[] }) => {
    return (
      <RevealContext sdk={sdk} color={new Color(0x4a4a4a)} useCoreDm={true}>
        <RevealCanvas>
          <StoryContent resources={resources} />
          <ReactQueryDevtools />
        </RevealCanvas>
      </RevealContext>
    );
  }
};

const StoryContent = ({ resources }: { resources: AddResourceOptions[] }): ReactElement => {
  const [stylingGroups, setStylingGroups] = useState<InstanceStylingGroup[]>([]);
  const cameraNavigation = useCameraNavigation();
  const nodeData = useClickedNodeData();

  useEffect(() => {
    if (nodeData?.fdmResult !== undefined && nodeData?.fdmResult !== null) {
      setStylingGroups([
        {
          fdmAssetExternalIds: [
            {
              externalId: nodeData.fdmResult.fdmNodes[0].externalId,
              space: nodeData.fdmResult.fdmNodes[0].space
            }
          ],
          style: { cad: DefaultNodeAppearance.Highlighted }
        }
      ]);

      void cameraNavigation.fitCameraToInstance(
        nodeData.fdmResult.fdmNodes[0].externalId,
        nodeData.fdmResult.fdmNodes[0].space
      );
    } else if (
      nodeData?.assetMappingResult !== undefined &&
      nodeData?.assetMappingResult !== null
    ) {
      setStylingGroups([
        {
          assetIds: nodeData.assetMappingResult.assetIds,
          style: { cad: DefaultNodeAppearance.Highlighted }
        }
      ]);

      void cameraNavigation.fitCameraToModelNode(
        (nodeData.intersection as CadIntersection).model.revisionId,
        nodeData.assetMappingResult.cadNode.id
      );
    } else if (
      nodeData?.pointCloudAnnotationMappingResult !== undefined &&
      nodeData.pointCloudAnnotationMappingResult !== null
    ) {
      setStylingGroups([
        {
          assetIds: [nodeData.pointCloudAnnotationMappingResult[0].asset.id],
          style: { pointcloud: DefaultNodeAppearance.Highlighted }
        }
      ]);
    } else if (nodeData?.intersection !== undefined && 'annotation' in nodeData.intersection) {
      const instanceReference = getInstanceReferenceFromImage360Annotation(
        nodeData.intersection.annotation.annotation
      );

      if (instanceReference === undefined || !isInternalId(instanceReference)) {
        return;
      }
      setStylingGroups([
        {
          assetIds: [instanceReference.id],
          style: { image360: { color: new Color('#c5cbff'), visible: true } }
        }
      ]);
    } else {
      setStylingGroups([]);
    }
  }, [nodeData]);

  return (
    <>
      <RevealResourcesFitCameraOnLoad
        resources={resources}
        defaultResourceStyling={{
          cad: {
            default: { color: new Color('#efefef') },
            mapped: { color: new Color('#c5cbff') }
          },
          pointcloud: {
            default: { color: new Color('#efefef') },
            mapped: { color: new Color('#c5cbff') }
          }
        }}
        instanceStyling={stylingGroups}
      />
      <RevealToolbar />
    </>
  );
};
