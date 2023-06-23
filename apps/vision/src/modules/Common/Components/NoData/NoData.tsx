import React from 'react';

import { Graphic, GraphicOptions } from '@vision/assets/Graphics/Graphic';

export const NoData = () => (
  <div className="cogs-table no-data" style={{ height: '100%' }}>
    <Graphic type={GraphicOptions.Search} />
    No data found.
  </div>
);
