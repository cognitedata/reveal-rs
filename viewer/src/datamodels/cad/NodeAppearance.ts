/*!
 * Copyright 2020 Cognite AS
 */

export enum OutlineColor {
  NoOutline = 0,
  Red,
  Green,
  Blue,
  Yellow,
  Purple,
  LightBlue,
  White
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
   */
  readonly renderInFront?: boolean;
  /**
   * When set, an outline is drawn around the
   * node to make it stand out.
   */
  readonly outlineColor?: OutlineColor;
};

export interface NodeAppearanceProvider {
  styleNode(treeIndex: number): NodeAppearance | undefined;
}

const OutlinedAppearance: NodeAppearance = {
  outlineColor: OutlineColor.LightBlue
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

export const DefaultNodeAppearance = {
  NoOverrides: undefined as NodeAppearance | undefined,
  Outlined: OutlinedAppearance,
  Hidden: HiddenAppearance,
  InFront: InFrontAppearance,
  // TODO 2020-06-18 larsmoa: Add outline for Highlighted nodes
  Highlighted: { ...InFrontAppearance, ...HighlightedColorApperance, ...OutlinedAppearance }
};
