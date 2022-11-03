import * as React from 'react';

import { Button } from '@cognite/cogs.js';

import { RootAssetLabel } from './elements';

export interface RootAssetButtonProps {
  label: string;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  maxWidth?: number;
}

export const RootAssetButton: React.FC<RootAssetButtonProps> = ({
  label,
  onClick,
  maxWidth,
}) => {
  return (
    <Button
      icon="ArrowRight"
      iconPlacement="right"
      type="link"
      onClick={onClick}
    >
      <RootAssetLabel maxwidth={maxWidth}>{label}</RootAssetLabel>
    </Button>
  );
};
