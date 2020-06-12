//=====================================================================================
// This code is part of the Reveal Viewer architecture, made by Nils Petter Fremming
// in October 2019. It is suited for flexible and customizable visualization of
// multiple dataset in multiple viewers.
//
// It is a C# to typescript port from the Modern Model architecture,
// based on the experience when building Petrel.
//
// NOTE: Always keep the code according to the code style already applied in the file.
// Put new code under the correct section, and make more sections if needed.
// Copyright (c) Cognite AS. All rights reserved.
//=====================================================================================

import * as THREE from "three";
import * as Color from "color"

import { Points } from "@/Core/Geometry/Points";
import { Range3 } from "@/Core/Geometry/Range3";
import { ColorType } from "@/Core/Enums/ColorType";
import { Colors } from "@/Core/Primitives/Colors";

import { PointsNode } from "@/Nodes/Misc/PointsNode";
import { PointsRenderStyle } from "@/Nodes/Misc/PointsRenderStyle";
import { ThreeConverter } from "@/Three/Utilities/ThreeConverter";
import { NodeEventArgs } from "@/Core/Views/NodeEventArgs";
import { BaseGroupThreeView } from "@/Three/BaseViews/BaseGroupThreeView";

export class PointsThreeView extends BaseGroupThreeView
{
  //==================================================
  // INSTANCE PROPERTIES
  //==================================================

  protected get node(): PointsNode { return super.getNode() as PointsNode; }
  protected get style(): PointsRenderStyle { return super.getStyle() as PointsRenderStyle; }

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor() { super(); }

  //==================================================
  // OVERRIDES of BaseView
  //==================================================

  protected /*override*/ updateCore(args: NodeEventArgs): void
  {
    super.updateCore(args);
  }

  //==================================================
  // OVERRIDES of Base3DView
  //==================================================

  public /*override*/ calculateBoundingBoxCore(): Range3 | undefined
  {
    const boundingBox = this.node.boundingBox;
    if (!boundingBox)
      return undefined;

    boundingBox.expandByMargin(this.style.size);
    return boundingBox;
  }

  //==================================================
  // OVERRIDES of BaseGroupThreeView
  //==================================================

  protected /*override*/ createObject3DCore(): THREE.Object3D | null
  {
    const node = this.node;
    const style = this.style;

    const points = node.data;
    if (!points)
      throw Error("points is missing in view");

    let color = node.getColor();
    if (style.colorType !== ColorType.NodeColor)
      color = Colors.white; // Must be white because the colors are multiplicated

    const threeColor: THREE.Color = ThreeConverter.toColor(color);

    const geometry = new THREE.BufferGeometry();
    geometry.addAttribute("position", new THREE.Float32BufferAttribute(createPositions(points), 3, true));

    const material = new THREE.PointsMaterial({ color: threeColor, size: style.size, sizeAttenuation: true });
    if (style.colorType === ColorType.DepthColor)
    {
      geometry.addAttribute("color", new THREE.Uint8BufferAttribute(createColors(points), 3, true));
      material.vertexColors = THREE.VertexColors;
    }
    return new THREE.Points(geometry, material);
  }
}

function createColors(points: Points): Uint8Array
{
  const zRange = points.getZRange();
  let index = 0;

  const colors = new Uint8Array(points.count * 3);
  for (let i = 0; i < points.count; i++)
  {
    const z = points.list[i].z;
    const fraction = zRange.getFraction(z);
    const color = Color.hsv(fraction * 360, 255, 200);

    colors[index++] = color.red();
    colors[index++] = color.green();
    colors[index++] = color.blue();
  }
  return colors;
}

function createPositions(points: Points): Float32Array
{
  const positions = new Float32Array(points.count * 3);
  let index = 0;
  for (let i = 0; i < points.count; i++)
  {
    const point = points.list[i];
    positions[index++] = point.x;
    positions[index++] = point.y;
    positions[index++] = point.z;
  }
  return positions;
}

