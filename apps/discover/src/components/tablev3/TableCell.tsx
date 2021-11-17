import React from 'react';
import { Cell } from 'react-table';

import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { Tooltip } from 'components/tooltip';

import { CellContentWrapper } from './elements';

interface Props {
  cell: Cell<any>;
}
export const TableCell: React.FC<Props> = React.memo(({ cell }) => {
  const isCellValueText = !isNil(cell?.value);
  const Wrapper = isCellValueText ? CellText : React.Fragment;

  // In case of undefined cell, render empty content (opposed to crashing).
  return <Wrapper>{cell?.render('Cell')}</Wrapper>;
});

const CellText = ({ children }: any) => {
  const elementRef = React.useRef<HTMLElement>(null);
  const [overflowing, setOverflowing] = React.useState(false);

  React.useLayoutEffect(() => {
    const element = elementRef.current;
    if (element) {
      setOverflowing(isElementOverflowing(element));
    }
  }, []);

  const isElementOverflowing = (element: HTMLElement): boolean => {
    if (isNil(element)) return false;
    return element.offsetWidth < element.scrollWidth;
  };

  const isCellValueEmpty = (value: string | number): boolean => {
    return !(
      value &&
      ((isString(value) && value.trim() !== '') || isNumber(value))
    );
  };

  // Render empty if the cell is empty
  const value = children.props.value.id || children.props.value;
  if (isCellValueEmpty(value)) return null;

  return (
    <CellContentWrapper
      ref={elementRef}
      whiteSpace={children.props.column.displayFullText ? 'normal' : 'nowrap'}
    >
      <Tooltip title={children} enabled={overflowing}>
        {children}
      </Tooltip>
    </CellContentWrapper>
  );
};
