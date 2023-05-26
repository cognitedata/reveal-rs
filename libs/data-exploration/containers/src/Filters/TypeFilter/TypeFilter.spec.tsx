import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { TypeFilter } from './TypeFilter';

describe('TypeFilter', () => {
  describe('Base', () => {
    test('Show no options in the list', () => {
      render(<TypeFilter options={[]} />);

      expect(screen.getByText(/type/gi)).toBeInTheDocument();

      userEvent.click(screen.getByText('Select...'));

      expect(screen.getByText('No options')).toBeInTheDocument();
    });
  });
});
