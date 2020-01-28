/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';
import { TriangleMesh } from '../../../models/cad/types';
import { sectorShaders, shaderDefines } from './shaders';
import { RenderType } from '../materials';

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
    const treeIndices = new THREE.Float32BufferAttribute(mesh.treeIndices.buffer, 1);
    geometry.setIndex(indices);
    geometry.setAttribute('position', vertices);
    geometry.setAttribute('color', colors);
    geometry.setAttribute('treeIndex', treeIndices);
    geometry.boundingBox = bounds.clone();
    geometry.boundingSphere = new THREE.Sphere();
    bounds.getBoundingSphere(geometry.boundingSphere);

    const triangleMeshMaterial = new THREE.ShaderMaterial({
      name: 'Triangle meshes',
      ...shaderDefines,
      extensions: {
        derivatives: true
      },
      side: THREE.DoubleSide,
      fragmentShader: sectorShaders.detailedMesh.fragment,
      vertexShader: sectorShaders.detailedMesh.vertex,
      uniforms: {
        renderType: {
          value: RenderType.Color
        }
      }
    });
    const obj = new THREE.Mesh(geometry, triangleMeshMaterial);
    obj.name = `Triangle mesh ${mesh.fileId}`;
    result.push(obj);
  }
  return result;
}
