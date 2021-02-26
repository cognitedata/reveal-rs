/*!
 * Copyright 2021 Cognite AS
 */

export enum OutlineColor {
  NoOutline = 0,
  White,
  Black,
  Cyan,
  Blue,
  Purple,
  Pink,
  Orange
}

export type NodeAppearance = {
  /**
   * Overrides the default color of the node.
   */
  readonly color?: [number, number, number];
  /**
   * Overrides the visibility of the node.
   */
  readonly visible?: boolean;
  /**
   * When set to true, the node is rendered in front
   * of all other nodes even if it's occluded.
   * Note that this take precedence over {@link renderGhosted}.
   */
  readonly renderInFront?: boolean;
  /**
   * When set to true, the node is rendered ghosted, i.e.
   * transparent with a fixed color. This has no effect if {@link renderInFront}
   * is `true`.
   */
  readonly renderGhosted?: boolean;
  /**
   * When set, an outline is drawn around the
   * node to make it stand out.
   */
  readonly outlineColor?: OutlineColor;
  /**
   * When set, a matrix4 transformation is applied
   * to the node in world space.
   */
  readonly worldTransform?: THREE.Matrix4;
};

const OutlinedAppearance: NodeAppearance = {
  outlineColor: OutlineColor.White
};

const HiddenAppearance: NodeAppearance = {
  visible: false
};

const InFrontAppearance: NodeAppearance = {
  renderInFront: true
};

const HighlightedColorApperance: NodeAppearance = {
  color: [100, 100, 255]
};

const GhostedApperance: NodeAppearance = {
  renderGhosted: true
};

export const DefaultNodeAppearance = {
  Default: { visible: true },
  Outlined: OutlinedAppearance,
  Hidden: HiddenAppearance,
  InFront: InFrontAppearance,
  Ghosted: GhostedApperance,
  Highlighted: { ...InFrontAppearance, ...HighlightedColorApperance, ...OutlinedAppearance }
};
