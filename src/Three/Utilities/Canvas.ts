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
import * as Color from "color";

import { SpriteCreator } from "@/Three/Utilities/SpriteCreator";
import { Appearance } from "@/Core/States/Appearance";

export class Canvas
{
  // A lot of tips here:
  // https://www.javascripture.com/CanvasRenderingContext2D

  //==================================================
  // INSTANCE FIELDS
  //==================================================

  private dx = 0;
  private dy = 0;

  // These 3 values af for beginFunction, fillFunction and addFunctionValue
  private firstX = Number.NaN;
  private lastX = Number.NaN;
  private fillFunction = false;
  private canvas: HTMLCanvasElement

  // eslint-disable-next-line react/static-property-placement
  private context: CanvasRenderingContext2D;

  //==================================================
  // CONSTRUCTORS
  //==================================================

  public constructor(dx: number, dy: number)
  {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context)
    {
      this.canvas = new HTMLCanvasElement();
      this.context = new CanvasRenderingContext2D();
      return;
    }
    canvas.width = dx;
    canvas.height = dy;
    this.dx = dx;
    this.dy = dy;
    this.canvas = canvas;
    this.context = context;
  }

  //==================================================
  // INSTANCE METHODS: Misc
  //==================================================

  public createTexture(): THREE.CanvasTexture | null
  {
    return SpriteCreator.createTexture(this.canvas);
  }

  //==================================================
  // INSTANCE METHODS: 
  //==================================================

  public clear(color: Color): void
  {
    this.context.fillStyle = Canvas.getColor(color);
    this.context.fillRect(0, 0, this.dx, this.dy);
  }

  //==================================================
  // INSTANCE METHODS: Path 
  //==================================================

  public beginPath()
  {
    this.context.beginPath();
  }

  public closePath()
  {
    this.context.closePath();
  }

  public drawPath(color: Color | null = null, lineWidth = 1)
  {
    this.context.lineCap = 'round';
    this.context.lineWidth = lineWidth;
    this.context.strokeStyle = Canvas.getColor(color);
    this.context.stroke();
  }

  public addVerticalLine(x: number)
  {
    x *= this.dx;
    this.context.moveTo(x, 0);
    this.context.lineTo(x, this.dy);
  }

  //==================================================
  // INSTANCE METHODS: Function path
  //==================================================

  public beginFunction(fillPath: boolean)
  {
    this.fillFunction = fillPath;
    this.firstX = Number.NaN;
  }

  public closeFunction(): boolean
  {
    if (Number.isNaN(this.firstX))
      return false;

    if (this.fillFunction)
      this.context.lineTo(this.lastX, 0);

    this.lastX = Number.NaN;
    this.firstX = Number.NaN;
    return true;
  }

  public addFunctionValue(x: number, y: number)
  {
    // assume: x and y in [0,1]
    x *= this.dx;
    y *= this.dy;

    if (Number.isNaN(this.firstX))
    {
      this.beginPath();
      this.firstX = x;
      if (this.fillFunction)
        this.context.moveTo(x, 0);
    }
    this.context.lineTo(x, y);
    this.lastX = x;
  }

  //==================================================
  // INSTANCE METHODS: Path 
  //==================================================

  public drawText(x: number, text: string, fontSize: number, color: Color | null, rightBand: boolean, outerMost: boolean = true)
  {
    // https://www.javascripture.com/CanvasRenderingContext2D
    const borderSize = fontSize * 0.1;
    const font = Canvas.getBolderFont(fontSize);

    this.context.font = font;
    this.context.textBaseline = "alphabetic";
    this.context.fillStyle = Canvas.getColor(color);

    this.context.save();
    this.context.translate(x * this.dx - borderSize, outerMost ? this.dy - borderSize : borderSize);

    this.context.rotate(-Math.PI / 2);
    if (rightBand)
      this.context.scale(-1, 1);

    if (rightBand !== outerMost)
      this.context.textAlign = "left";
    else
      this.context.textAlign = "right";

    this.context.fillText(text, 0, 0);
    this.context.restore();
  }

  //==================================================
  // INSTANCE METHODS: Filling
  //==================================================

  public fillPath(color: Color, alphaFraction = 1)
  {
    if (alphaFraction !== 1)
      color = color.alpha(alphaFraction);

    this.context.fillStyle = Canvas.getColor(color);
    this.context.fill();
  }

  public fillRect(x0: number, x1: number, color: Color, alphaFraction = 1)
  {
    if (alphaFraction !== 1)
      color = color.alpha(alphaFraction);

    x0 *= this.dx;
    x1 *= this.dx;
    this.context.fillStyle = Canvas.getColor(color);
    this.context.fillRect(x0, 0, x1 - x0, this.dy);
  }

  public fillPathBySemiTransparentGradient(color: Color, alphaFraction = 1)
  {
    const operation = this.context.globalCompositeOperation;
    this.context.globalCompositeOperation = 'darker';
    if (alphaFraction !== 1)
      color = color.alpha(alphaFraction);

    const gradient = this.context.createLinearGradient(0, 0, 0, this.dy);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(1, Canvas.getColor(color));

    this.context.fillStyle = gradient;
    this.context.fill();
    this.context.globalCompositeOperation = operation;
  }

  //==================================================
  // STATIC METHODS: Filling
  //==================================================

  public static getColor(color: Color | null) { return color ? color.string() : "black"; };

  private static getFont(fontSize: number): string { return `${fontSize}px ${Appearance.viewerFontType}`; }

  public static getNormalFont(fontSize: number): string { return `Normal ${Canvas.getFont(fontSize)}`; }

  public static getBoldFont(fontSize: number): string { return `Bold ${Canvas.getFont(fontSize)}`; }

  public static getBolderFont(fontSize: number): string { return `Bolder ${Canvas.getFont(fontSize)}`; }

  public static measureTextHeight(context: CanvasRenderingContext2D, text: string, maxWidth: number, lineHeight: number): number
  {
    return Canvas.fillOrTextHeightText(context, text, -1, -1, maxWidth, lineHeight);
  }

  public static fillText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void
  {
    Canvas.fillOrTextHeightText(context, text, x, y, maxWidth, lineHeight);
  }

  private static fillOrTextHeightText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number
  {
    const words = text.split(' ');
    let line = '';
    let height = 0;
    const draw = x >= 0 && y >= 0;
    for (let n = 0; n < words.length; n++)
    {
      let testLine = line;
      if (line.length > 0)
        testLine += ' ';
      testLine += words[n];
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0)
      {
        if (draw)
          context.fillText(line, x, y + height);
        line = words[n];
        height += lineHeight;
      }
      else
        line = testLine;
    }
    if (draw)
      context.fillText(line, x, y + height);
    height += lineHeight;
    return height;
  }

}
