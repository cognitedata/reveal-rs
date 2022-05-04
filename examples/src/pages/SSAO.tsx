/*
 * Copyright 2021 Cognite AS
 */

import React, { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import CameraControls from 'camera-controls';
import * as reveal from '@cognite/reveal/internals';
import { THREE } from '@cognite/reveal';
import dat from 'dat.gui';
import { createSDKFromEnvironment, getParamsFromURL } from '../utils/example-helpers';
import { CogniteClient } from '@cognite/sdk';
import { AnimationLoopHandler } from '../utils/AnimationLoopHandler';
import { defaultRenderOptions } from '@cognite/reveal/internals';
import { resizeRendererToDisplaySize } from '../utils/sceneHelpers';
import { suggestCameraConfig } from '../utils/cameraConfig';
import { createManagerAndLoadModel } from '../utils/createManagerAndLoadModel';

CameraControls.install({ THREE });

export function SSAO() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const gui = new dat.GUI();
    const animationLoopHandler: AnimationLoopHandler = new AnimationLoopHandler();
    let revealManager: reveal.RevealManager;

    async function main() {
      const { project, modelUrl, modelRevision, environmentParam } = getParamsFromURL({
        project: 'publicdata',
        modelUrl: 'primitives',
      });

      let client;
      if (project && environmentParam) {
        client = await createSDKFromEnvironment('reveal.example.ssao', project, environmentParam);
      } else {
        client = new CogniteClient({ appId: 'reveal.example.ssao',
                                     project: 'dummy',
                                     getToken: async () => 'dummy' });
      }

      const scene = new THREE.Scene();


      const renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
      });
      renderer.setClearColor('#444');
      renderer.setSize(window.innerWidth, window.innerHeight);

      const { revealManager, model } = await createManagerAndLoadModel(client, renderer, scene, 'cad', modelRevision, modelUrl);

      scene.add(model);

      const { position, target, near, far } = suggestCameraConfig(model.cadModelMetadata.scene.root,
                                                                  model.getModelTransformation());
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        near,
        far
      );
      const controls = new CameraControls(camera, renderer.domElement);
      controls.setLookAt(
        position.x,
        position.y,
        position.z,
        target.x,
        target.y,
        target.z
      );
      controls.update(0.0);
      camera.updateMatrixWorld();
      revealManager.update(camera);

      const renderOptions = defaultRenderOptions;

      const updateEffect = () => {
        revealManager.renderOptions = renderOptions;
      };

      gui.add(renderOptions.ssaoRenderParameters, 'sampleRadius').min(0.0).max(30.0).onChange(updateEffect);

      gui.add(renderOptions.ssaoRenderParameters, 'sampleSize').min(1).max(256).step(1).onChange(updateEffect);

      gui.add(renderOptions.ssaoRenderParameters, 'depthCheckBias').min(0.0).max(1.0).onChange(updateEffect);

      animationLoopHandler.setOnAnimationFrameListener(async (deltaTime: number) => {
        let needsResize = resizeRendererToDisplaySize(renderer, camera);
        const controlsNeedUpdate = controls.update(deltaTime);
        if (controlsNeedUpdate) {
          revealManager.update(camera);
        }

        if (controlsNeedUpdate || revealManager.needsRedraw || needsResize) {
          revealManager.render(camera);
          revealManager.resetRedraw();
        }
      });
      animationLoopHandler.start();
    }

    main();

    return () => {
      gui.destroy();
      animationLoopHandler.dispose();
      revealManager?.dispose();
    };
  });
  return (
    <CanvasWrapper>
      <canvas ref={canvasRef} />
    </CanvasWrapper>
  );
}
