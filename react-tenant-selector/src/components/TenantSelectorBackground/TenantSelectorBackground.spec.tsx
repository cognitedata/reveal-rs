import React from 'react';
import { render, screen } from '@testing-library/react';

import { Base } from './TenantSelectorBackground.stories';

describe('TenantSelectorBackground', () => {
  it('Renders children', () => {
    render(<Base />);
    expect(screen.getByRole('img')).toBeTruthy();
  });
});
