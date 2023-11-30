/*!
 * Copyright 2023 Cognite AS
 */
export type NodeResponse = {
  instanceType: string;
  version: number;
  space: string;
  externalId: string;
};

export type EdgeResponse = {
  version: number;
  type: {
    space: string;
    externalId: string;
  };
  space: string;
  externalId: string;
  startNode: {
    space: string;
    externalId: string;
  };
  endNode: {
    space: string;
    externalId: string;
  };
};

export type SceneResponse = {
  items: {
    scene: SceneConfigurationResponse[];
    skybox: SkyboxResponse[];
    groundPlanes: GroundPlaneResponse[];
  };
  nextCursor: {
    scene: string;
    skybox: string;
  };
};

export type SceneConfigurationResponse = NodeResponse & {
  properties: Record<string, Record<string, SceneConfigurationProperties>>;
};

// export type ModelPropertiesResponse = EdgeResponse & {
//   properties: Record<string, Record<string, SceneConfigurationProperties>>;
// };

export type SkyboxResponse = NodeResponse & {
  properties: Record<string, Record<string, SkyboxProperties>>;
};

export type SceneConfigurationProperties = {
  name: string;
  cameraTranslationX: number;
  cameraTranslationY: number;
  cameraTranslationZ: number;
  cameraEulerRotationX: number;
  cameraEulerRotationY: number;
  cameraEulerRotationZ: number;
};

export type SkyboxProperties = {
  type: string;
  url: string;
};

export type GroundPlaneResponse = NodeResponse & {
  properties: Record<string, Record<string, GroundPlaneProperties>>;
};

export type GroundPlaneProperties = {
  file: string;
  label: string;
  wrapping: string;
};

export type Cdf3dRevisionProperties = {
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  revisionId: number;
  translationX: number;
  translationY: number;
  translationZ: number;
  eulerRotationX: number;
  eulerRotationY: number;
  eulerRotationZ: number;
};
