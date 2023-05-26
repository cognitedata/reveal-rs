import { useState } from 'react';

import { ComponentStory } from '@storybook/react';

import ZoomControls from './ZoomControls';

export default {
  title: 'Components/Zoom Controls Story',
  component: ZoomControls,
};

export const ZoomControlsStory: ComponentStory<typeof ZoomControls> = () => {
  const [scale, setScale] = useState(1);
  return (
    <ZoomControls
      currentZoomScale={scale}
      zoomIn={() => {
        setScale(scale * 1.5);
      }}
      zoomOut={() => {
        setScale(scale / 1.5);
      }}
      zoomToFit={() => {
        setScale(1);
      }}
      setZoomScale={setScale}
    />
  );
};
