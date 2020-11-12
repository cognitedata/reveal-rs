import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryCache } from 'react-query';
import OverviewTab from './OverviewTab';
import { render } from '../../utils/test';
import { mockResponse } from '../../utils/mockResponse';
import { renderWithReactQueryCacheProvider } from '../../utils/test/render';

describe('OverviewTab', () => {
  const project = 'itera-int-green';
  const cdfEnv = 'greenfield';

  test('Render with out fail', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: mockResponse } });
    const queryCache = new QueryCache();
    const wrapper = renderWithReactQueryCacheProvider(
      queryCache,
      project,
      cdfEnv
    );
    render(<OverviewTab />, { wrapper });
    await waitFor(() => {
      const sidePanelHeading = screen.getByRole('table');
      expect(sidePanelHeading).toBeInTheDocument();
    });
  });
});
