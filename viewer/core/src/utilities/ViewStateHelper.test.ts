/*!
 * Copyright 2022 Cognite AS
 */
import * as THREE from 'three';

import { Cognite3DViewer } from '../public/migration/Cognite3DViewer';
import { ViewStateHelper } from './ViewStateHelper';

import { createGlContext, mockClientAuthentication } from '../../../test-utilities';

import { CogniteClient } from '@cognite/sdk';

describe(ViewStateHelper.name, () => {
  let viewer: Cognite3DViewer;
  let helper: ViewStateHelper;

  beforeEach(() => {
    const sdk = new CogniteClient({ appId: 'reveal.test', project: 'dummy', getToken: async () => 'dummy' });
    mockClientAuthentication(sdk);
    const context = createGlContext(64, 64, { preserveDrawingBuffer: true });
    const renderer = new THREE.WebGLRenderer({ context });

    viewer = new Cognite3DViewer({ sdk, renderer });
    helper = new ViewStateHelper(viewer, sdk);
  });

  test('setState() resets camera and clipping to initial state', () => {
    // Arrange
    const original = {
      cameraPosition: new THREE.Vector3(-1, -2, -3),
      cameraTarget: new THREE.Vector3(1, 2, 3),
      clippingPlanes: [new THREE.Plane().setComponents(1, 2, 3, 4), new THREE.Plane().setComponents(-1, -2, -3, -4)]
    };
    viewer.cameraManager.setCameraPosition(original.cameraPosition);
    viewer.cameraManager.setCameraTarget(original.cameraTarget);
    viewer.setClippingPlanes(original.clippingPlanes);

    // Act
    const state = viewer.getViewState();
    viewer.cameraManager.setCameraPosition(new THREE.Vector3(-10, -10, -10));
    viewer.cameraManager.setCameraTarget(new THREE.Vector3(10, 10, 10));
    viewer.setClippingPlanes([]);
    viewer.setViewState(state);

    // Assert
    expect(viewer.cameraManager.getCameraPosition().distanceTo(original.cameraPosition)).toBeLessThan(1e-5);
    expect(viewer.cameraManager.getCameraTarget().distanceTo(original.cameraTarget)).toBeLessThan(1e-5);
    expect(viewer.getClippingPlanes()).toEqual(original.clippingPlanes);
  });
});
