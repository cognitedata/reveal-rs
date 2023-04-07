import { DASH } from '@data-exploration-lib/core';
import { mockDocument } from '../../../../stubs/documents';
import { getHighlightContent } from '../utils';

describe('getHighlightContent', () => {
  it('should return DASH when given empty string', () => {
    const highlightContent = getHighlightContent(mockDocument);
    expect(highlightContent).toEqual(DASH);
    expect(true).toBeTruthy();
  });
  it('should not have any whitespace character except a single space " "', () => {
    const rawHighlightContent =
      'maintenance tasks \n\nthrough a mobile or tablet-based application. In short, Cognite <em>Infield</em> digitalizes routine rounds \n\nand integrates work management.  \n\n• Cognite Maintain';
    const highlightContent = getHighlightContent({
      ...mockDocument,
      highlight: { name: [''], content: [rawHighlightContent] },
    });
    const found = highlightContent.match(/\t\n\x0B\f\r/g);
    expect(found).toEqual(null);
  });
});
