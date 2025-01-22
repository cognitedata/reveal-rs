/*!
 * Copyright 2021 Cognite AS
 */

import * as THREE from 'three';

import { IndexSet, determinePowerOfTwoDimensions, NumericRange } from '@reveal/utilities';
import { NodeAppearanceProvider, NodeAppearance, DefaultNodeAppearance } from '@reveal/cad-styling';
import assert from 'assert';
export class NodeAppearanceTextureBuilder {
  private _defaultAppearance: NodeAppearance = {};
  private readonly _styleProvider: NodeAppearanceProvider;
  private readonly _handleStylesChangedListener = this.handleStylesChanged.bind(this);

  private _needsUpdate = true;
  private readonly _allTreeIndices: IndexSet;
  private readonly _overrideColorDefaultAppearanceRgba: Uint8ClampedArray;
  private readonly _overrideColorPerTreeIndexTexture: THREE.DataTexture;
  private readonly _regularNodesTreeIndices: IndexSet;
  private readonly _ghostedNodesTreeIndices: IndexSet;
  private readonly _infrontNodesTreeIndices: IndexSet;
  private readonly _visibleNodesTreeIndices: IndexSet;

  private readonly _defaultAppearanceTextureIterations: number;

  constructor(treeIndexCount: number, styleProvider: NodeAppearanceProvider) {
    this._allTreeIndices = new IndexSet();
    this._allTreeIndices.addRange(new NumericRange(0, treeIndexCount));
    this._styleProvider = styleProvider;
    this._styleProvider.on('changed', this._handleStylesChangedListener);
    this._overrideColorPerTreeIndexTexture = allocateOverrideColorPerTreeIndexTexture(treeIndexCount);

    const defaultAppearanceRgbaSize = determineDefaultAppearanceTextureSize(
      this._overrideColorPerTreeIndexTexture.image.data.length
    );
    this._overrideColorDefaultAppearanceRgba = new Uint8ClampedArray(defaultAppearanceRgbaSize.length);
    this._defaultAppearanceTextureIterations = defaultAppearanceRgbaSize.iterations;
    this._regularNodesTreeIndices = new IndexSet();
    this._ghostedNodesTreeIndices = new IndexSet();
    this._infrontNodesTreeIndices = new IndexSet();
    this._visibleNodesTreeIndices = new IndexSet();

    this.setDefaultAppearance(DefaultNodeAppearance.Default);

    function determineDefaultAppearanceTextureSize(inputTextureLength: number): { length: number; iterations: number } {
      assert(
        THREE.MathUtils.isPowerOfTwo(inputTextureLength),
        'Expected inputTextureLength to be power of 2. Was length ' + inputTextureLength + '.' // Should never happen due to implementation of allocateOverrideColorPerTreeIndexTexture creating a Po2 texture.
      );
      const optimalDefaultAppearanceArraySize = Math.pow(2, 21); // ~2mill. Fast, while keeping memory overhead low.
      const defaultAppearanceTextureIterationsToFitInputTexture = THREE.MathUtils.ceilPowerOfTwo(
        Math.max(1, inputTextureLength / optimalDefaultAppearanceArraySize)
      );

      const size = inputTextureLength / defaultAppearanceTextureIterationsToFitInputTexture;

      return { length: size, iterations: defaultAppearanceTextureIterationsToFitInputTexture };
    }
  }

  getDefaultAppearance(): NodeAppearance {
    return this._defaultAppearance;
  }

  /**
   * Sets the default style and invalidates the builder. Note that this causes a full
   * recomputation of values the next time {@link NodeAppearanceTextureBuilder.build} is called,
   * so using this might be expensive.
   * @param appearance New style that is applied to all 'unstyled' elements.
   */
  setDefaultAppearance(appearance: NodeAppearance): void {
    if (equalNodeAppearances(appearance, this._defaultAppearance)) {
      return;
    }

    this._defaultAppearance = appearance;
    // Create a pre-cached buffer of texture content for fast initialization in build()
    fillRGBA(this._overrideColorDefaultAppearanceRgba, appearance);
    this._needsUpdate = true;
  }

  get regularNodeTreeIndices(): IndexSet {
    return this._regularNodesTreeIndices;
  }

  get ghostedNodeTreeIndices(): IndexSet {
    return this._ghostedNodesTreeIndices;
  }

  get infrontNodeTreeIndices(): IndexSet {
    return this._infrontNodesTreeIndices;
  }

  get visibleNodeTreeIndices(): IndexSet {
    return this._visibleNodesTreeIndices;
  }

  get needsUpdate(): boolean {
    return this._needsUpdate;
  }

  /**
   * A texture holding at least one element per node with color override
   * and style information. RGB is used to store color, A is used to store
   * style toggles, with the following bit layout:
   * - 0  : visible bit         - when set the node is visible
   * - 1  : in front bit        - when set the node is rendered in front of other objects
   * - 2  : ghosted bit         - when set the node is rendered 'ghosted'
   * - 3  : unused
   * - 4  : unused
   * - 5-7: outline color - outline toggle and color ({@see OutlineColor}).
   * Note that in-front and ghost information also is available from
   * the {@see inFrontTreeIndices} and {@see ghostedTreeIndices} collections.
   */
  get overrideColorPerTreeIndexTexture(): THREE.DataTexture {
    return this._overrideColorPerTreeIndexTexture;
  }

  dispose(): void {
    this._styleProvider.off('changed', this._handleStylesChangedListener);
    this._overrideColorPerTreeIndexTexture.dispose();
  }

  build(): void {
    if (!this._needsUpdate) {
      return;
    }

    const rgba = this._overrideColorPerTreeIndexTexture.image.data;
    this.populateTexture(rgba);
    this.populateNodeSets(rgba);

    this._needsUpdate = false;
  }

  private populateTexture(rgbaBuffer: Uint8Array | Uint8ClampedArray) {
    // Fill texture with default style
    for (let i = 0; i < this._defaultAppearanceTextureIterations; i++) {
      rgbaBuffer.set(this._overrideColorDefaultAppearanceRgba, i * this._overrideColorDefaultAppearanceRgba.length); // Note! This is basically memcpy(), i.e. fast
    }

    // Apply individual styles
    this._styleProvider.applyStyles((treeIndices, appearance) => {
      // Translate from style to magic values in textures
      this.applyStyleToNodes(treeIndices, appearance);
    });

    this._overrideColorPerTreeIndexTexture.needsUpdate = true;
  }

  private populateNodeSets(rgbaBuffer: Uint8Array | Uint8ClampedArray) {
    this._regularNodesTreeIndices.clear();
    this._infrontNodesTreeIndices.clear();
    this._ghostedNodesTreeIndices.clear();
    this._visibleNodesTreeIndices.clear();
    this._visibleNodesTreeIndices.addRange(new NumericRange(0, this._allTreeIndices.count));

    enum RangeType {
      invisible,
      inFront,
      ghosted,
      regular
    }

    const range = {
      rangeStart: -1,
      type: RangeType.regular
    };

    const commitRange = (toExclusive: number) => {
      const treeIndexRange = NumericRange.createFromInterval(range.rangeStart, toExclusive - 1);
      if (range.type === RangeType.invisible) {
        this._visibleNodesTreeIndices.removeRange(treeIndexRange);
      } else if (range.type === RangeType.inFront) {
        this._infrontNodesTreeIndices.addRange(treeIndexRange);
      } else if (range.type === RangeType.ghosted) {
        this._ghostedNodesTreeIndices.addRange(treeIndexRange);
      } else if (range.type === RangeType.regular) {
        this._regularNodesTreeIndices.addRange(treeIndexRange);
      }
    };

    // Loop over texture to determine if each node is "invisible", "regular", "ghosted" or "in front"
    for (let i = 0; i < this._allTreeIndices.count; ++i) {
      const visibleBit = (rgbaBuffer[4 * i + 3] & 1) !== 0;
      const inFrontBit = (rgbaBuffer[4 * i + 3] & 2) !== 0;
      const ghostedBit = (rgbaBuffer[4 * i + 3] & 4) !== 0;
      let type: RangeType;
      if (!visibleBit) {
        type = RangeType.invisible;
      } else if (inFrontBit) {
        type = RangeType.inFront;
      } else if (ghostedBit) {
        type = RangeType.ghosted;
      } else {
        type = RangeType.regular;
      }

      if (range.rangeStart === -1) {
        range.rangeStart = i;
        range.type = type;
      } else if (range.type !== type) {
        commitRange(i);
        range.rangeStart = i;
        range.type = type;
      }
    }
    // Commit the last range
    if (range.rangeStart !== -1) {
      commitRange(this._allTreeIndices.count);
    }
  }

  private applyStyleToNodes(treeIndices: IndexSet, style: NodeAppearance) {
    if (treeIndices.count === 0) {
      return;
    }

    combineRGBA(this._overrideColorPerTreeIndexTexture.image.data, treeIndices, style);
  }

  private handleStylesChanged() {
    this._needsUpdate = true;
  }
}

function allocateOverrideColorPerTreeIndexTexture(treeIndexCount: number): THREE.DataTexture {
  const { width, height } = determinePowerOfTwoDimensions(treeIndexCount);
  const textureElementCount = width * height;
  // Color and style override texture
  const overrideColorPerTreeIndexTexture = new THREE.DataTexture(
    new Uint8ClampedArray(4 * textureElementCount),
    width,
    height
  );

  return overrideColorPerTreeIndexTexture;
}

function appearanceToColorOverride(appearance: NodeAppearance): [number, number, number, number] {
  const [r, g, b] = appearance.color?.toArray().map(c => Math.round(c * 255)) ?? [0, 0, 0];
  const isVisible = appearance.visible !== undefined ? !!appearance.visible : true;
  const inFront = !!appearance.renderInFront;
  const ghosted = !!appearance.renderGhosted;
  const outlineColor = appearance.outlineColor ? Number(appearance.outlineColor) : 0;
  // Byte layout:
  // [isVisible, renderInFront, renderGhosted, unused, unused, outlineColor0, outlineColor1, outlineColor2]
  const bytePattern =
    (isVisible ? 1 << 0 : 0) + //      -------X
    (inFront ? 1 << 1 : 0) + //        ------X-
    (ghosted ? 1 << 2 : 0) + //        -----X--
    (outlineColor << 5); //            XXX-----
  return [r, g, b, bytePattern];
}

function fillRGBA(rgbaBuffer: Uint8ClampedArray, style: NodeAppearance) {
  const [r, g, b, a] = appearanceToColorOverride(style);
  for (let i = 0; i < rgbaBuffer.length; ++i) {
    rgbaBuffer[4 * i + 0] = r;
    rgbaBuffer[4 * i + 1] = g;
    rgbaBuffer[4 * i + 2] = b;
    rgbaBuffer[4 * i + 3] = a;
  }
}

function combineRGBA(rgbaBuffer: Uint8Array | Uint8ClampedArray, treeIndices: IndexSet, style: NodeAppearance) {
  const [r, g, b, a] = appearanceToColorOverride(style);
  // Create a bit mask for updating color (update if style contains color, don't update if it doesn't)
  const updateRgbBitmask = style.color === undefined ? 0 : 0b11111111;
  const keepRgbBitmask = ~updateRgbBitmask;
  const updateR = r & updateRgbBitmask;
  const updateG = g & updateRgbBitmask;
  const updateB = b & updateRgbBitmask;

  // Create bit masks for updating the correct bits in the alpha channel based on what settings
  // the style overrides
  const updateAlphaBitmask =
    (style.visible !== undefined ? 0b00000001 : 0) |
    (style.renderInFront !== undefined ? 0b00000010 : 0) |
    (style.renderGhosted !== undefined ? 0b00000100 : 0) |
    (style.outlineColor !== undefined ? 0b11100000 : 0);
  const keepAlphaBitmask = ~updateAlphaBitmask;
  const updateAlpha = a & updateAlphaBitmask;

  treeIndices.forEachRange(range => {
    for (let i = range.from; i <= range.toInclusive; ++i) {
      const oldR = rgbaBuffer[4 * i + 0];
      const oldG = rgbaBuffer[4 * i + 1];
      const oldB = rgbaBuffer[4 * i + 2];

      // Combine color - this will replace color if the style provided sets color or keep
      // the old color if not
      rgbaBuffer[4 * i + 0] = (oldR & keepRgbBitmask) | updateR;
      rgbaBuffer[4 * i + 1] = (oldG & keepRgbBitmask) | updateG;
      rgbaBuffer[4 * i + 2] = (oldB & keepRgbBitmask) | updateB;
      // Update "settings" - this will override any settings provided by the style,
      // but keep any existing setting that is not provided by the style
      rgbaBuffer[4 * i + 3] = (rgbaBuffer[4 * i + 3] & keepAlphaBitmask) | updateAlpha;
    }
  });
}

function equalNodeAppearances(left: NodeAppearance, right: NodeAppearance) {
  // https://stackoverflow.com/a/1144249/167251
  return JSON.stringify(left) === JSON.stringify(right);
}
