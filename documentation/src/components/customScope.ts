import { Water } from 'three/examples/jsm/objects/Water';
import { resetViewerEventHandlers } from '../viewerUtilities';
import * as THREE from 'three';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { HtmlOverlayTool } from '@cognite/reveal/tools';
import { ExplodedViewTool } from '@cognite/reveal/tools';

const reveal = typeof window === 'undefined' ? {} : require('@cognite/reveal');

export const customScope: Record<string, any> = {
  resetViewerEventHandlers,
  HtmlOverlayTool,
  ExplodedViewTool,
  THREE,
  Water,
  DragControls,
  // you can't simply call useBaseUrl here because it's a react hook...
  urls: {
    skyUrl: '/img/sky007.jpg',
  },
  PotreePointShape: reveal.PotreePointShape,
  PotreePointColorType: reveal.PotreePointColorType,

  WellKnownAsprsPointClassCodes: reveal.WellKnownAsprsPointClassCodes,
};
