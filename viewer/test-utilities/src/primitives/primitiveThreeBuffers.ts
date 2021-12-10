/*!
 * Copyright 2021 Cognite AS
 */

import {
  createAttributeDescriptionsForPrimitive,
  getComponentByteSize,
  computeTotalAttributeByteSize,
  getShouldNormalize
} from './primitiveAttributes';
import { writePrimitiveToBuffer } from './primitiveWrite';
import { readPrimitiveFromBuffer } from './primitiveRead';
import { PrimitiveType } from './primitiveTypes';

import * as THREE from 'three';
import { TypedArray } from '../../../packages/utilities';
import { assert } from 'console';

function createCommonBuffer(elementSizes: number[], primitiveDescs: any[][]) {
  let totalSize = 0;
  for (let i = 0; i < primitiveDescs.length; i++) {
    totalSize += elementSizes[i] * primitiveDescs[i].length;
  }

  return new ArrayBuffer(totalSize);
}

function createInstancedInterleavedBuffers(
  buffer: ArrayBuffer,
  types: PrimitiveType[],
  primitiveDescs: any[][],
  elementSizes: number[]
): THREE.InstancedInterleavedBuffer[] {
  let currentByteOffset = 0;
  let lastByteOffset = 0;

  const interleavedBuffers: THREE.InstancedInterleavedBuffer[] = [];

  for (let i = 0; i < types.length; i++) {
    for (const primitiveDesc of primitiveDescs[i]) {
      currentByteOffset = writePrimitiveToBuffer(types[i], buffer, primitiveDesc, currentByteOffset);
    }

    const floatView = new Float32Array(
      buffer,
      lastByteOffset,
      (currentByteOffset - lastByteOffset) / Float32Array.BYTES_PER_ELEMENT
    );
    lastByteOffset = currentByteOffset;

    interleavedBuffers.push(
      new THREE.InstancedInterleavedBuffer(floatView, elementSizes[i] / floatView.BYTES_PER_ELEMENT)
    );
  }

  return interleavedBuffers;
}

function createBufferGeometries(
  types: PrimitiveType[],
  interleavedBuffers: THREE.InstancedInterleavedBuffer[]
): THREE.BufferGeometry[] {
  const geometries: THREE.BufferGeometry[] = [];

  for (let i = 0; i < types.length; i++) {
    const attributeDescriptions = createAttributeDescriptionsForPrimitive(types[i]);

    const geometry = new THREE.BufferGeometry();

    for (const attributeDescription of attributeDescriptions) {
      const itemSize =
        (attributeDescription.format.numComponents * getComponentByteSize(attributeDescription.format.componentType)) /
        Float32Array.BYTES_PER_ELEMENT;

      if (!Number.isInteger(itemSize)) {
        throw Error('Attribute does not have size divisible by float size');
      }

      const shouldNormalize = getShouldNormalize(attributeDescription.format.componentType);

      const bufferAttribute = new THREE.InterleavedBufferAttribute(
        interleavedBuffers[i],
        itemSize,
        attributeDescription.byteOffset / Float32Array.BYTES_PER_ELEMENT,
        shouldNormalize
      );

      geometry.setAttribute(attributeDescription.name, bufferAttribute);
    }
    geometries.push(geometry);
  }

  return geometries;
}

export function createPrimitiveInterleavedGeometriesSharingBuffer(
  types: PrimitiveType[],
  primitiveDescs: any[][]
): THREE.BufferGeometry[] {
  assert(types.length == primitiveDescs.length);

  const elementSizes = types.map(computeTotalAttributeByteSize);
  const buffer = createCommonBuffer(elementSizes, primitiveDescs);

  const interleavedBuffers = createInstancedInterleavedBuffers(buffer, types, primitiveDescs, elementSizes);

  return createBufferGeometries(types, interleavedBuffers);
}

export function createPrimitiveInterleavedGeometry(name: PrimitiveType, primitiveDescs: any[]): THREE.BufferGeometry {
  return createPrimitiveInterleavedGeometriesSharingBuffer([name], [primitiveDescs])[0];
}

/* NB: Assumes BufferGeometry only uses one underlying buffer for interleaved attributes */
function getBufferByteSize(geometryBuffer: THREE.BufferGeometry) {
  let underlyingBuffer: ArrayBuffer | undefined = undefined;
  for (const attr of Object.entries(geometryBuffer.attributes)) {
    if (attr[1] instanceof THREE.InterleavedBufferAttribute) {
      underlyingBuffer = ((attr[1] as THREE.InterleavedBufferAttribute).array as TypedArray).buffer;
    }
  }

  if (!underlyingBuffer) {
    throw Error('Could not find interleaved attribute buffer for BufferGeometry');
  }

  return underlyingBuffer.byteLength;
}

export function parseInterleavedGeometry(
  name: PrimitiveType,
  geometryBuffer: THREE.BufferGeometry
): Record<string, unknown>[] {
  const singleElementSize = computeTotalAttributeByteSize(name);

  const byteLength = getBufferByteSize(geometryBuffer);

  const numElements = byteLength / singleElementSize;

  if (!Number.isInteger(numElements)) {
    throw Error('Array size not multiple of primitive size');
  }

  const result: Record<string, unknown>[] = [];
  let currentOffset = 0;
  for (let i = 0; i < numElements; i++) {
    const thisPrimitive: Record<string, unknown> = readPrimitiveFromBuffer(geometryBuffer, currentOffset);
    result.push(thisPrimitive);
    currentOffset += singleElementSize;
  }

  return result;
}
