import { Menu } from '@cognite/cogs.js';
import { ChangeEvent } from 'react';

import { ShapeSettings as ShapeSettingsType } from '../../library/types';

import ColorPicker from './ColorPicker/ColorPicker';
import { ShapeSettingsWrapper } from './elements';

type ShapeSettingsProps = {
  shapeSettings: ShapeSettingsType;
  onSettingsChange: (nextSettings: Partial<ShapeSettingsType>) => void;
};

const ShapeSettings = ({
  shapeSettings: { strokeColor, strokeWidth, opacity },
  onSettingsChange,
}: ShapeSettingsProps) => {
  const onThicknessSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ strokeWidth: Number(e.target.value) });
  };

  const onOpacitySliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ opacity: Number(e.target.value) });
  };

  return (
    <ShapeSettingsWrapper>
      <Menu>
        <Menu.Header>STROKE</Menu.Header>
        <input
          type="range"
          min="2"
          max="12"
          value={strokeWidth}
          onChange={onThicknessSliderChange}
          step="1"
        />
        <p>Thickness</p>
        <input
          type="range"
          min="0.1"
          max="1"
          value={opacity}
          onChange={onOpacitySliderChange}
          step="0.1"
        />
        <p>Opacity</p>
        <Menu.Header>COLOR</Menu.Header>
        <ColorPicker color={strokeColor} onSettingsChange={onSettingsChange} />
      </Menu>
    </ShapeSettingsWrapper>
  );
};

export default ShapeSettings;
