/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import TWEEN from '@tweenjs/tween.js';

import { Cognite3DViewer } from '../../public/migration/Cognite3DViewer';
import { CogniteClient } from '@cognite/sdk';
import nock from 'nock';

const sceneJson = require('./scene.json');

describe('Cognite3DViewer', () => {
  const context: WebGLRenderingContext = require('gl')(64, 64);

  const sdk = new CogniteClient({ appId: 'cognite.reveal.unittest' });
  const renderer = new THREE.WebGLRenderer({ context, precision: 'lowp' });
  jest.useFakeTimers();

  test('constructor throws error when unsupported options are set', () => {
    expect(() => new Cognite3DViewer({ sdk, enableCache: true })).toThrowError();
    expect(() => new Cognite3DViewer({ sdk, enableCache: false, logMetrics: true })).toThrowError();
    expect(() => new Cognite3DViewer({ sdk, enableCache: false, viewCube: 'topleft' })).toThrowError();
    expect(() => new Cognite3DViewer({ sdk, enableCache: false })).toThrowError();
  });

  test('dispose disposes WebGL resources', () => {
    const disposeSpy = jest.spyOn(renderer, 'dispose');
    const viewer = new Cognite3DViewer({ sdk, renderer });
    viewer.dispose();
    expect(disposeSpy).toBeCalledTimes(1);
  });

  test('on cameraChanged triggers when position and target is changed', () => {
    // Arrange
    const onCameraChange: (position: THREE.Vector3, target: THREE.Vector3) => void = jest.fn();
    const viewer = new Cognite3DViewer({ sdk, renderer });
    viewer.on('cameraChanged', onCameraChange);

    // Act
    viewer.setCameraTarget(new THREE.Vector3(123, 456, 789));
    viewer.setCameraPosition(new THREE.Vector3(1, 2, 3));

    // Assert
    expect(onCameraChange).toBeCalledTimes(2);
  });

  test('addModel with remote model and fit viewer, updates camera', async () => {
    // Arrange
    const outputs = {
      items: [
        {
          model: {
            id: 42
          },
          outputs: [
            {
              format: 'reveal-directory',
              version: 8,
              blobId: 1
            }
          ]
        }
      ]
    };
    nock(/.*/)
      .post(/.*\/outputs/)
      .reply(200, outputs);
    nock(/.*/)
      .get(/.*\/scene.json/)
      .reply(200, sceneJson);

    const onCameraChange: (position: THREE.Vector3, target: THREE.Vector3) => void = jest.fn();
    const viewer = new Cognite3DViewer({ sdk, renderer });
    viewer.on('cameraChanged', onCameraChange);

    // Act
    const model = await viewer.addModel({ modelId: 1, revisionId: 2 });
    viewer.fitCameraToModel(model);
    TWEEN.update();

    // Assert
    expect(onCameraChange).toBeCalled();
  });

  test('fitCameraToBoundingBox with 0 duration, moves camera immediatly', () => {
    // Arrange
    const viewer = new Cognite3DViewer({ sdk, renderer });
    const bbox = new THREE.Box3(new THREE.Vector3(1, 1, 1), new THREE.Vector3(2, 2, 2));
    const bSphere = bbox.getBoundingSphere(new THREE.Sphere());
    bSphere.radius *= 3;

    // Act
    viewer.fitCameraToBoundingBox(bbox, 0);
    TWEEN.update();

    // Assert
    expect(viewer.getCameraTarget()).toEqual(bbox.getCenter(new THREE.Vector3()));
    expect(bSphere.containsPoint(viewer.getCameraPosition())).toBeTrue();
  });
});
