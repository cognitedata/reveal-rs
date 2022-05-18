/*
 * Adapted from Potree:
 * https://github.com/potree/potree/blob/develop/src/loader/ept/BinaryLoader.js
 * License in LICENSE.potree
 */

import * as THREE from 'three';

import { WorkerPool } from '../utils/WorkerPool';
import { ILoader } from './ILoader';
import { ModelDataProvider } from '@reveal/modeldata-api';
import { PointCloudEptGeometryNode } from '../geometry/PointCloudEptGeometryNode';
import EptDecoderWorker from '../workers/eptBinaryDecoder.worker';
import { ParseCommand, ObjectsCommand } from '../workers/eptBinaryDecoder.worker';

import { ParsedEptData, EptInputData } from '../workers/parseEpt';

import { StyledObjectInfo } from '../../styling/StyledObjectInfo';

export class EptBinaryLoader implements ILoader {
  private readonly _dataLoader: ModelDataProvider;
  private readonly _styledObjectInfo: StyledObjectInfo | undefined;

  static readonly WORKER_POOL = new WorkerPool(32, EptDecoderWorker);

  extension(): string {
    return '.bin';
  }

  constructor(dataLoader: ModelDataProvider, styledObjectInfo?: StyledObjectInfo) {
    this._dataLoader = dataLoader;
    this._styledObjectInfo = styledObjectInfo;
  }

  async load(node: PointCloudEptGeometryNode): Promise<void> {
    if (node.loaded) return;

    const fullFileName = node.fileName() + this.extension();
    return this._dataLoader.getBinaryFile(node.baseUrl(), fullFileName).then(data => this.parse(node, data));
  }

  parse(node: PointCloudEptGeometryNode, data: ArrayBuffer): Promise<void> {
    return EptBinaryLoader.WORKER_POOL.getWorker().then(
      autoTerminatingWorker =>
        new Promise<void>(res => {
          autoTerminatingWorker.worker.onmessage = function (e: { data: ParsedEptData }) {
            const g = new THREE.BufferGeometry();
            const numPoints = e.data.numPoints;

            const position = new Float32Array(e.data.position);
            g.setAttribute('position', new THREE.BufferAttribute(position, 3));

            const indices = new Uint8Array(e.data.indices);
            g.setAttribute('indices', new THREE.BufferAttribute(indices, 4));

            if (e.data.color) {
              const color = new Uint8Array(e.data.color);
              g.setAttribute('color', new THREE.BufferAttribute(color, 4, true));
            }
            if (e.data.intensity) {
              const intensity = new Float32Array(e.data.intensity);
              g.setAttribute('intensity', new THREE.BufferAttribute(intensity, 1));
            }
            if (e.data.classification) {
              const classification = new Uint8Array(e.data.classification);
              g.setAttribute('classification', new THREE.BufferAttribute(classification, 1));
            }
            if (e.data.returnNumber) {
              const returnNumber = new Uint8Array(e.data.returnNumber);
              g.setAttribute('return number', new THREE.BufferAttribute(returnNumber, 1));
            }
            if (e.data.numberOfReturns) {
              const numberOfReturns = new Uint8Array(e.data.numberOfReturns);
              g.setAttribute('number of returns', new THREE.BufferAttribute(numberOfReturns, 1));
            }
            if (e.data.pointSourceId) {
              const pointSourceId = new Uint16Array(e.data.pointSourceId);
              g.setAttribute('source id', new THREE.BufferAttribute(pointSourceId, 1));
            }
            if (e.data.objectId) {
              const objectId = new Uint16Array(e.data.objectId);
              g.setAttribute('objectId', new THREE.BufferAttribute(objectId, 1));
            }

            g.attributes.indices.normalized = true;

            const tightBoundingBox = new THREE.Box3(
              new THREE.Vector3().fromArray(e.data.tightBoundingBox.min),
              new THREE.Vector3().fromArray(e.data.tightBoundingBox.max)
            );

            node.doneLoading(g, tightBoundingBox, numPoints, new THREE.Vector3(...e.data.mean));

            EptBinaryLoader.WORKER_POOL.releaseWorker(autoTerminatingWorker);
            res();
          };

          const toArray = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];
          const eptData: EptInputData = {
            buffer: data,
            schema: node.ept.schema,
            scale: node.ept.eptScale,
            offset: node.ept.eptOffset,
            mins: toArray(node.key.b.min)
          };

          if (this._styledObjectInfo) {
            const offsetVec = node.boundingBox.min;

            const objectMessage: ObjectsCommand = {
              type: 'objects',
              objects: this._styledObjectInfo.styledObjects,
              pointOffset: [offsetVec.x, offsetVec.y, offsetVec.z] as [number, number, number]
            };

            autoTerminatingWorker.worker.postMessage(objectMessage);
          }

          const parseMessage: ParseCommand = {
            type: 'parse',
            data: eptData
          };

          autoTerminatingWorker.worker.postMessage(parseMessage, [parseMessage.data.buffer]);
        })
    );
  }
}
