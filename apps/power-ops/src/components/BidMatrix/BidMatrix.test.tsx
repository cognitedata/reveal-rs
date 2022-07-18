import { fireEvent, screen, waitFor } from '@testing-library/react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { SequenceItem } from '@cognite/sdk';

import { mockPriceArea, testRenderer } from '../../utils/test';

import * as utils from './utils';
import { BidMatrix } from './BidMatrix';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

let clipboardData = '';

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn((data) => {
      clipboardData = data;
    }),
    readText: jest.fn(() => {
      return clipboardData;
    }),
  },
});

describe('Bid matrix tests', () => {
  beforeEach(() => {
    // Display 'Total' bidmatrix
    (useParams as jest.Mock).mockImplementation(() => ({
      plantExternalId: 'total',
    }));
  });

  describe('Bid matrix header tests', () => {
    it('Should display the correct display name in Bid matrix title', async () => {
      const { rerender } = testRenderer(
        <BidMatrix priceArea={mockPriceArea} />
      );

      let title = await screen.findByRole('heading', { name: /Bid matrix:/i });
      expect(title).toHaveTextContent('Total');

      // First plant bidmatrix
      const testPlant = mockPriceArea.plants[0];
      (useParams as jest.Mock).mockImplementation(() => ({
        plantExternalId: testPlant.externalId,
      }));
      rerender(<BidMatrix priceArea={mockPriceArea} />);

      title = await screen.findByRole('heading', { name: /Bid matrix:/i });
      expect(title).toHaveTextContent(testPlant.displayName);
    });

    it('Should display the correct date generated', async () => {
      testRenderer(<BidMatrix priceArea={mockPriceArea} />);

      const dateGenerated = await screen.findByText(/Generated/i);
      expect(dateGenerated).toHaveTextContent(
        dayjs(mockPriceArea.bidDate).format('MMM DD, YYYY')
      );
    });

    it('Should display the correct external id', async () => {
      const { rerender } = testRenderer(
        <BidMatrix priceArea={mockPriceArea} />
      );

      let externalId = await screen.findByText(/Generated/i);
      expect(externalId).toHaveTextContent(
        mockPriceArea.totalMatrixWithData.externalId
      );

      // Test a plant bidmatrix
      const testPlant = mockPriceArea.plants[0];
      (useParams as jest.Mock).mockImplementation(() => ({
        plantExternalId: testPlant.externalId,
      }));
      rerender(<BidMatrix priceArea={mockPriceArea} />);

      const plant = mockPriceArea.plantMatrixesWithData.find(
        (plant) => plant.plantName === testPlant.name
      );
      const expectedExternalId = plant?.matrixWithData?.externalId;
      externalId = await screen.findByText(/Generated/i);

      expect(expectedExternalId).not.toBeUndefined();
      expect(externalId).toHaveTextContent(expectedExternalId || '');
    });
  });

  describe('Bid matrix table tests', () => {
    it('Should render bidmatrix table', async () => {
      testRenderer(<BidMatrix priceArea={mockPriceArea} />);

      const table = await screen.findByRole('table');
      expect(table).toBeInTheDocument();
    });

    it('Should have the correct number of rows', async () => {
      testRenderer(<BidMatrix priceArea={mockPriceArea} />);

      const rows = await screen.findAllByRole('row');
      expect(rows).toHaveLength(26); // 24 hours + 1 header + 1 blank filler row
    });

    it('Should have the correct number of columns', async () => {
      testRenderer(<BidMatrix priceArea={mockPriceArea} />);

      const expectedColumnLength =
        mockPriceArea.totalMatrixWithData.dataRows[0].length;
      const columns = await screen.findAllByRole('columnheader');

      expect(columns).toHaveLength(expectedColumnLength);
    });

    it('Should display correct data', async () => {
      testRenderer(<BidMatrix priceArea={mockPriceArea} />);

      const tableData = (await screen.findAllByRole('cell')).map(
        (cell) => cell.textContent
      );
      const numColumns = (await screen.findAllByRole('columnheader')).length;
      const firstColumn: SequenceItem[] = tableData.filter((value, index) => {
        return (index - 1) % numColumns === 0 && value !== '';
      });

      const expectedFirstColumn: SequenceItem[] =
        mockPriceArea.totalMatrixWithData.dataRows.map(
          (row: Array<string | number>) => {
            return Number(row.splice(1, 1)).toFixed(2);
          }
        );

      expect(firstColumn).toEqual(expectedFirstColumn);
    });
  });

  describe('Copy bidmatrix tests', () => {
    const handleCopy = jest.spyOn(utils, 'copyMatrixToClipboard');

    it('Should render copy button', async () => {
      testRenderer(<BidMatrix priceArea={mockPriceArea} />);

      const copyButton = await screen.findByRole('button');
      expect(copyButton).toBeInTheDocument();
    });

    it('Should display informational tooltip on hover', async () => {
      testRenderer(<BidMatrix priceArea={mockPriceArea} />);

      const copyButton = await screen.findByRole('button');
      fireEvent.mouseEnter(copyButton);

      const tooltip = await screen.findByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });

    // FIX_ME:
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('Should change tooltip text on click', async () => {
      testRenderer(<BidMatrix priceArea={mockPriceArea} />);

      const copyButton = await screen.findByRole('button');
      fireEvent.mouseEnter(copyButton);

      const tooltipText = (await screen.findByRole('tooltip')).textContent;
      fireEvent.click(copyButton);
      const newTooltipText = (await screen.findByRole('tooltip')).textContent;

      expect(tooltipText).not.toEqual(newTooltipText);
    });

    // FIX_ME:
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('Should call copy function', async () => {
      testRenderer(<BidMatrix priceArea={mockPriceArea} />);

      const copyButton = await screen.findByRole('button');
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(handleCopy).toBeCalled();
      });
      expect(navigator.clipboard.writeText).toBeCalled();
    });

    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('Should copy bidmatrix correctly', async () => {
      testRenderer(<BidMatrix priceArea={mockPriceArea} />);

      const copyButton = await screen.findByRole('button');
      fireEvent.click(copyButton);

      const table = await screen.findByRole('table');
      const copiedData = (await navigator.clipboard.readText()).replace(
        /\s/gm,
        ''
      );

      expect(table).toHaveTextContent(copiedData);
    });
  });
});
