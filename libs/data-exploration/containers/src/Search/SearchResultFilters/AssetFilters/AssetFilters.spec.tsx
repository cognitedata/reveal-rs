import React from 'react';

import { render, screen } from '@testing-library/react';

import { AssetFilters } from './AssetFilters';

describe('AssetFilters', () => {
  describe('Base', () => {
    test('Show no options in the list', () => {
      const mockFilter = {
        common: {},
        asset: {},
        timeseries: {},
        sequence: {},
        file: {},
        event: {},
        document: {},
      };

      render(
        <AssetFilters
          filter={mockFilter}
          onFilterChange={() => jest.fn()}
          onResetFilterClick={() => jest.fn()}
        />
      );
      expect(screen.getByText(/assets/gi)).toBeInTheDocument();
    });
  });
});
