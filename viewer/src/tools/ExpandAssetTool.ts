/*!
 * Copyright 2021 Cognite AS
 */
import * as THREE from 'three';
import { Cognite3DModel } from '../public/migration/Cognite3DModel';
import { Cognite3DViewerToolBase } from './Cognite3DViewerToolBase';

export class ExpandAssetTool extends Cognite3DViewerToolBase {
  private _cadModel: Cognite3DModel;
  private _treeBoundingBoxdata!: Promise<{ treeIndex: number; direction: THREE.Vector3; transform: THREE.Matrix4 }[]>;
  private _rootTreeIndex: number;

  public get readyPromise(): Promise<void> {
    return this._treeBoundingBoxdata.then();
  }

  constructor(treeIndex: number, cadModel: Cognite3DModel) {
    super();

    this._cadModel = cadModel;
    this._rootTreeIndex = treeIndex;

    this.preloadBoundingBoxData(cadModel, treeIndex);
  }

  public async expand(expandRadius: number): Promise<void> {
    const expandData = await this._treeBoundingBoxdata;

    await Promise.all(
      expandData.map(({ treeIndex, direction, transform }) => {
        if (expandRadius === 0) {
          this._cadModel.resetNodeTransformByTreeIndex(treeIndex);
          return Promise.resolve(0);
        }

        transform.setPosition(direction.x * expandRadius, direction.y * expandRadius, direction.z * expandRadius);

        return this._cadModel.setNodeTransformByTreeIndex(treeIndex, transform);
      })
    );
  }

  public reset(): void {
    this._cadModel.resetNodeTransformByTreeIndex(this._rootTreeIndex, true);
  }

  private preloadBoundingBoxData(cadModel: Cognite3DModel, treeIndex: number) {
    const rootTreeIndexBoundingBox = cadModel
      .getBoundingBoxByTreeIndex(treeIndex)
      .then(rootBoundingBox => rootBoundingBox.getCenter(new THREE.Vector3()));

    const subTreeBoundingBoxes = cadModel
      .getSubtreeTreeIndices(treeIndex)
      .then(subTreeIndices => {
        if (subTreeIndices.length > 1000) {
          throw new Error(`Subtree size of ${subTreeIndices.length} is too large (max size = 1000)`);
        }

        return subTreeIndices;
      })
      .then(subTreeIndices => {
        return Promise.all(
          subTreeIndices.map(async subTreeIndex => {
            const subTreeBox = await cadModel.getBoundingBoxByTreeIndex(subTreeIndex);
            return {
              subTreeIndex: subTreeIndex,
              subTreeIndexBoundingBoxCenter: subTreeBox.getCenter(new THREE.Vector3())
            };
          })
        );
      });

    this._treeBoundingBoxdata = Promise.all([rootTreeIndexBoundingBox, subTreeBoundingBoxes])
      .then(data => {
        const [rootCenter, subTreeCenters] = data;
        return subTreeCenters.map(({ subTreeIndex, subTreeIndexBoundingBoxCenter }) => {
          return {
            treeIndex: subTreeIndex,
            direction: new THREE.Vector3().subVectors(subTreeIndexBoundingBoxCenter, rootCenter),
            transform: new THREE.Matrix4()
          };
        });
      })
      .then(async payloads => {
        await Promise.all(
          payloads.map(payload => {
            return cadModel.setNodeTransformByTreeIndex(payload.treeIndex, payload.transform);
          })
        );
        return payloads;
      });
  }
}
