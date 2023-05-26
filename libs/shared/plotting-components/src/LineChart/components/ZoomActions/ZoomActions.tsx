import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { useAxisDirection } from '../../hooks/useAxisDirection';
import { AxisDirectionConfig } from '../../types';
import { getPlotZoomRange } from '../../utils/getPlotZoomRange';
import { PlotElement } from '../Plot';

import { ZoomActionsWrapper } from './elements';

export interface ZoomActionsProps {
  plotRef: React.RefObject<PlotElement>;
  zoomDirectionConfig: AxisDirectionConfig;
}

export const ZoomActions: React.FC<ZoomActionsProps> = ({
  plotRef,
  zoomDirectionConfig,
}) => {
  const zoomDirection = useAxisDirection(zoomDirectionConfig);

  const handleZoom = (mode: 'zoom-in' | 'zoom-out') => {
    if (!zoomDirection) {
      return;
    }

    const newRange = getPlotZoomRange(plotRef.current, zoomDirection, mode);

    if (newRange) {
      plotRef.current?.setPlotRange(newRange);
    }
  };

  if (zoomDirectionConfig === false) {
    return null;
  }

  return (
    <ZoomActionsWrapper>
      <Button
        icon="ZoomOut"
        aria-label="zoom-out"
        onClick={() => handleZoom('zoom-out')}
      />

      <Button
        icon="Restore"
        aria-label="zoom-reset"
        onClick={() => plotRef.current?.resetPlotRange()}
      />

      <Button
        icon="ZoomIn"
        aria-label="zoom-in"
        onClick={() => handleZoom('zoom-in')}
      />
    </ZoomActionsWrapper>
  );
};
