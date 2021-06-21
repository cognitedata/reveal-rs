/*!
 * Copyright 2021 Cognite AS
 */

import React from 'react';

import { TestEnvCad, TestViewer } from '../TestViewer';
import * as THREE from 'three';
import { DefaultNodeAppearance, TreeIndexNodeCollection } from '@cognite/reveal';

export function HighlightTestPage() {
  return (
    <TestViewer
    modifyTestEnv={({ model }: TestEnvCad) => {
      const nodeAppearanceProvider = model.nodeAppearanceProvider;
      const nodes = new TreeIndexNodeCollection([...Array(15).keys()]);
      nodeAppearanceProvider.assignStyleToNodeCollection(nodes, DefaultNodeAppearance.Highlighted);

      return {
        camera: new THREE.PerspectiveCamera(),
        cameraConfig: {
          position: new THREE.Vector3(12, -4, -45),
        },
      }}}
    />
  );
}
