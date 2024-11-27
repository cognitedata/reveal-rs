/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactElement } from 'react';
import { type CommonResourceContainerProps } from '../Reveal3DResources/types';
import { useReveal3dResourcesFromScene } from '../../hooks/useReveal3dResourcesFromScene';
import { useGroundPlaneFromScene } from '../../hooks/useGroundPlaneFromScene';
import { useSkyboxFromScene } from '../../hooks/useSkyboxFromScene';
import { Reveal3DResources } from '../Reveal3DResources/Reveal3DResources';
import {
  type CogniteCadModel,
  type CognitePointCloudModel,
  type Image360Collection
} from '@cognite/reveal';

export type SceneContainerProps = {
  sceneExternalId: string;
  sceneSpaceId: string;
  onResourceIsLoaded?: (
    model: CogniteCadModel | CognitePointCloudModel | Image360Collection
  ) => void;
} & CommonResourceContainerProps;

export function SceneContainer({
  sceneExternalId,
  sceneSpaceId,
  onResourceIsLoaded,
  ...rest
}: SceneContainerProps): ReactElement {
  const resourceOptions = useReveal3dResourcesFromScene(sceneExternalId, sceneSpaceId);

  useGroundPlaneFromScene(sceneExternalId, sceneSpaceId);
  useSkyboxFromScene(sceneExternalId, sceneSpaceId);

  return (
    <Reveal3DResources
      resources={resourceOptions}
      {...rest}
      onResourceIsLoaded={onResourceIsLoaded}
    />
  );
}
