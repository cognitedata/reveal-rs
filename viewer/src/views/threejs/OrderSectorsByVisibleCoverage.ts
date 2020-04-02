/*!
 * Copyright 2020 Cognite AS
 */

import * as THREE from 'three';

import { SectorMetadata, CadModel } from '../..';
import { SectorModelTransformation } from '../../models/cad/types';
import { toThreeJsBox3, toThreeMatrix4 } from './utilities';
import { Box3 } from '../../utils/Box3';
import { coverageShaders } from './cad/shaders';

type SectorContainer = {
  model: CadModel;
  sectors: SectorMetadata[];

  sectorIdOffset: number;
  renderable: THREE.Object3D;
};

type SectorVisibility = {
  sectorIdWithOffset: number;
  hitCount: number;
};

const coverageMaterial = new THREE.ShaderMaterial({
  vertexShader: coverageShaders.vertex,
  fragmentShader: coverageShaders.fragment
});
const identityRotation = new THREE.Quaternion();

export interface OrderSectorsByVisibleCoverageOptions {
  glContext?: WebGLRenderingContext;
  renderSize?: THREE.Vector2;
}

export type PrioritizedSectorIdentifier = {
  /**
   * The CadModel that holds the sector.
   */
  model: CadModel;
  /**
   * Sector ID contained in the model provided.
   */
  sectorId: number;
  /**
   * A number between 0 and 1 indicating how 'important' the sector is.
   */
  priority: number;
};

export class OrderSectorsByVisibleCoverage {
  private sectorIdOffset = 0;
  private readonly scene = new THREE.Scene();
  private readonly renderer: THREE.WebGLRenderer;
  private readonly renderTarget: THREE.WebGLRenderTarget;
  private readonly containers: SectorContainer[] = [];
  private readonly buffers = {
    rtBuffer: new Uint8Array(),
    sectorVisibilityBuffer: [] as SectorVisibility[]
  };

  constructor(options?: OrderSectorsByVisibleCoverageOptions) {
    const context = (options || {}).glContext;
    const renderSize = (options || {}).renderSize || new THREE.Vector2(640, 480);
    this.renderer = new THREE.WebGLRenderer({
      context,
      antialias: false,
      alpha: false,
      precision: 'lowp',
      stencil: false
    });
    this.renderer.setClearColor('#FFFFFF');
    this.renderTarget = new THREE.WebGLRenderTarget(renderSize.width, renderSize.height, {
      generateMipmaps: false,
      type: THREE.UnsignedByteType,
      format: THREE.RGBFormat,
      stencilBuffer: false
    });
    this.renderer.setRenderTarget(this.renderTarget);
  }

  addModel(model: CadModel) {
    const sectors = model.scene.getAllSectors();
    const mesh = this.createSectorTreeMesh(this.sectorIdOffset, sectors, model.modelTransformation);
    this.containers.push({
      model,
      sectors,
      sectorIdOffset: this.sectorIdOffset,
      renderable: mesh
    });
    this.sectorIdOffset += sectors.length;
    this.scene.add(mesh);
  }

  prioritizeSectors(camera: THREE.Camera): PrioritizedSectorIdentifier[] {
    // 1. Render to offscreen buffer
    this.renderer.render(this.scene, camera);

    // 2. Prepare buffer for reading from GPU
    this.prepareBuffers();

    // 3. Read back result from GPU
    this.renderer.readRenderTargetPixels(
      this.renderTarget,
      0,
      0,
      this.renderTarget.width,
      this.renderTarget.height,
      this.buffers.rtBuffer
    );

    // 4. Unpack GPU result to something more convinient
    const sectorVisibility = this.unpackSectorVisibility(
      this.renderTarget.width,
      this.renderTarget.height,
      this.buffers.rtBuffer
    );

    // 5. Map to IDs that the world understands
    const totalHits = sectorVisibility.reduce((hits, x) => x.hitCount + hits, 0);
    const result = sectorVisibility
      .filter(x => x.hitCount > 0)
      // Sort by "hit" to put most visible sectors first
      .sort((left, right) => {
        if (left && right) {
          return right.hitCount - left.hitCount;
        } else if (left) {
          return -1;
        } else if (right) {
          return 1;
        }
        return 0;
      })
      .map(x => {
        const container = this.findSectorContainer(x.sectorIdWithOffset);
        const sectorId = x.sectorIdWithOffset - container.sectorIdOffset;
        return { model: container.model, sectorId, priority: x.hitCount / totalHits };
      });

    return result;
  }

  private findSectorContainer(sectorIdWithOffset: number): SectorContainer {
    for (const container of this.containers) {
      if (
        sectorIdWithOffset >= container.sectorIdOffset &&
        sectorIdWithOffset < container.sectorIdOffset + container.sectors.length
      ) {
        return container;
      }
    }
    throw new Error(`Sector ID ${sectorIdWithOffset} is out of range`);
  }

  private unpackSectorVisibility(
    renderTargetWidth: number,
    renderTargetHeight: number,
    renderTargetBuffer: Uint8Array
  ): SectorVisibility[] {
    const sectorVisibility = this.buffers.sectorVisibilityBuffer;
    for (let i = 0; i < renderTargetWidth * renderTargetHeight; i++) {
      const r = renderTargetBuffer[3 * i + 0];
      const g = renderTargetBuffer[3 * i + 1];
      const b = renderTargetBuffer[3 * i + 2];
      const sectorIdWithOffset = b + g * 255 + r * 255 * 255;
      if (r !== 255 && g !== 255 && b !== 255) {
        const value = sectorVisibility[sectorIdWithOffset] || { sectorIdWithOffset, hitCount: 0 };
        value.hitCount++;
        sectorVisibility[sectorIdWithOffset] = value;
      }
    }
    return sectorVisibility;
  }

  private prepareBuffers() {
    // Ensure buffer can hold all pixels from render target
    if (this.buffers.rtBuffer.length < 3 * this.renderTarget.width * this.renderTarget.height) {
      this.buffers.rtBuffer = new Uint8Array(3 * this.renderTarget.width * this.renderTarget.height);
    }

    // Blank visibility information
    // tslint:disable-next-line: prefer-for-of - for performance
    for (let i = 0; i < this.buffers.sectorVisibilityBuffer.length; i++) {
      const entry = this.buffers.sectorVisibilityBuffer[i];
      if (entry) {
        entry.hitCount = 0;
      }
    }
  }

  private createSectorTreeMesh(
    sectorIdOffset: number,
    sectors: SectorMetadata[],
    modelTransformation: SectorModelTransformation
  ): THREE.Object3D {
    const group = new THREE.Group();
    group.applyMatrix4(toThreeMatrix4(modelTransformation.modelMatrix));

    const sectorCount = sectors.length;

    const instanceValues = new Float32Array(2 * sectorCount); // sectorId, coverageFactor
    const boxGeometry = new THREE.BoxBufferGeometry();
    const mesh = new THREE.InstancedMesh(boxGeometry, coverageMaterial, sectorCount);

    const bounds = new THREE.Box3();
    const addSector = (sectorBounds: Box3, sectorId: number, coverageFactor: number) => {
      toThreeJsBox3(bounds, sectorBounds);
      const translation = bounds.getCenter(new THREE.Vector3());
      const scale = bounds.getSize(new THREE.Vector3());

      const instanceMatrix = new THREE.Matrix4().compose(translation, identityRotation, scale);
      mesh.setMatrixAt(sectorId, instanceMatrix);

      instanceValues[2 * sectorId + 0] = sectorIdOffset + sectorId;
      instanceValues[2 * sectorId + 1] = coverageFactor;
    };

    sectors.forEach(sector => {
      // TODO 2020-04-02 larsmoa: Consider sending each of the coverage factors to the shader
      const { xy, xz, yz } = sector.facesFile.coverageFactors;
      const coverageFactor = (xy + xz + yz) / 3.0;
      addSector(sector.bounds, sector.id, coverageFactor);
    });

    const buffer = new THREE.InstancedInterleavedBuffer(instanceValues, 2);
    boxGeometry.setAttribute('a_sectorId', new THREE.InterleavedBufferAttribute(buffer, 1, 0));
    boxGeometry.setAttribute('a_coverageFactor', new THREE.InterleavedBufferAttribute(buffer, 1, 1));

    group.add(mesh);
    return group;
  }
}
