/*!
 * Copyright 2019 Cognite AS
 */

import * as THREE from 'three';
import { TriangleMesh } from '../../../models/sector/types';
import { sectorShaders } from './shaders';

export function createTriangleMeshes(triangleMeshes: TriangleMesh[], bounds: THREE.Box3): THREE.Mesh[] {
  const result: THREE.Mesh[] = [];
  for (const mesh of triangleMeshes) {
    const geometry = new THREE.BufferGeometry();
    geometry.boundingBox = bounds.clone();
    geometry.boundingSphere = new THREE.Sphere();
    bounds.getBoundingSphere(geometry.boundingSphere);
    const indices = new THREE.Uint32BufferAttribute(mesh.indices.buffer, 1);
    const vertices = new THREE.Float32BufferAttribute(mesh.vertices.buffer, 3);
    const colors = new THREE.Float32BufferAttribute(mesh.colors.buffer, 3);
    const treeIndices = new THREE.Float32BufferAttribute(mesh.treeIndexes.buffer, 1);
    geometry.setIndex(indices);
    geometry.setAttribute('position', vertices);
    geometry.setAttribute('color', colors);
    geometry.setAttribute('treeIndex', treeIndices);
    geometry.boundingBox = bounds.clone();
    geometry.boundingSphere = new THREE.Sphere();
    bounds.getBoundingSphere(geometry.boundingSphere);

    const material = new THREE.ShaderMaterial({
      uniforms: {},
      extensions: {
        derivatives: true
      },
      side: THREE.DoubleSide,
      fragmentShader: sectorShaders.detailedMesh.fragment,
      vertexShader: sectorShaders.detailedMesh.vertex
    });
    const obj = new THREE.Mesh(geometry, material);
    obj.name = `Triangle mesh ${mesh.fileId}`;
    result.push(obj);
  }
  return result;
}
