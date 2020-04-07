/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

export function discardSector(group: THREE.Group) {
  const meshes: THREE.Mesh[] = group.children.filter(x => x instanceof THREE.Mesh).map(x => x as THREE.Mesh);
  for (const mesh of meshes) {
    if (mesh.geometry) {
      console.log("Disposing", mesh.geometry);
      mesh.geometry.dispose();
      // NOTE: Forcefully creating a new reference here to make sure
      // there are no lingering references to the large geometry buffer
      mesh.geometry = new THREE.Geometry();
    }
  }
}
