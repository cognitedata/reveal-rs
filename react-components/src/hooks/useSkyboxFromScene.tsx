/*!
 * Copyright 2023 Cognite AS
 */

import { useEffect } from 'react';
import { useSceneConfig } from './useSceneConfig';
import * as THREE from 'three';
import { useReveal } from '..';
import { useQuery } from '@tanstack/react-query';
import { useSDK } from '../components/RevealContainer/SDKProvider';
import { type Cognite3DViewer } from '@cognite/reveal';

export const useSkyboxFromScene = (sceneExternalId: string, sceneSpaceId: string): void => {
  const scene = useSceneConfig(sceneExternalId, sceneSpaceId);
  const viewer = useReveal();
  const sdk = useSDK();

  const { data: skyboxTexture } = useQuery(
    ['reveal', 'react-components', 'skyboxUrl', scene.data],
    async () => {
      if (scene.data?.skybox === undefined) {
        return null;
      }

      const skyboxExternalId = scene.data.skybox.file;
      const skyBoxUrls = await sdk.files.getDownloadUrls([{ externalId: skyboxExternalId }]);

      if (skyBoxUrls.length === 0) {
        return null;
      }

      const skyboxUrl = skyBoxUrls[0].downloadUrl;
      return new THREE.TextureLoader().load(skyboxUrl);
    },
    { staleTime: Infinity }
  );

  useEffect(() => {
    if (skyboxTexture === undefined || skyboxTexture === null) {
      return;
    }
    const [skyboxMesh, cleanupFunction] = initializeSkybox(skyboxTexture, viewer);

    viewer.addObject3D(skyboxMesh);

    return cleanupFunction;
  }, [skyboxTexture]);
};

function initializeSkybox(
  texture: THREE.Texture,
  viewer: Cognite3DViewer
): [THREE.Object3D, () => void] {
  const skyboxGeometry = new THREE.SphereGeometry(1000, 20, 20);
  const skyboxMaterial = new THREE.MeshBasicMaterial({
    side: THREE.BackSide,
    map: texture
  });

  skyboxMaterial.depthWrite = false;
  const skyboxMesh = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
  skyboxMesh.renderOrder = -2;
  skyboxMesh.frustumCulled = false;
  (skyboxMesh as any).boundingBox = new THREE.Box3().makeEmpty();

  const onCameraChange = (position: THREE.Vector3): void => {
    skyboxMesh.position.copy(position);
    skyboxMesh.updateMatrix();
  };

  const onBeforeRender = (
    _renderer: THREE.WebGLRenderer,
    _scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ): void => {
    // Force low near-projection-plane to ensure the sphere geometry is in bounds
    (camera as any).lastNear = camera.near;
    camera.near = 0.1;
    camera.updateProjectionMatrix();
  };

  const onAfterRender = (
    _renderer: THREE.WebGLRenderer,
    _scene: THREE.Scene,
    camera: THREE.PerspectiveCamera
  ): void => {
    camera.near = (camera as any).lastNear;
    camera.updateProjectionMatrix();
  };

  skyboxMesh.onBeforeRender = onBeforeRender;
  skyboxMesh.onAfterRender = onAfterRender;
  viewer.on('cameraChange', onCameraChange);

  return [
    skyboxMesh,
    () => {
      // Cleanup function

      skyboxGeometry.dispose();
      texture.dispose();
      skyboxMesh.material.dispose();

      viewer.removeObject3D(skyboxMesh);
      viewer.off('cameraChange', onCameraChange);
    }
  ];
}
