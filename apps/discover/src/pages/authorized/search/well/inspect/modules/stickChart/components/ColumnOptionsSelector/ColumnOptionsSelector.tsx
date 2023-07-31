import * as React from 'react';

import isEmpty from 'lodash/isEmpty';
import noop from 'lodash/noop';

import { Icon } from '@cognite/cogs.js';

import { Dropdown } from 'components/Dropdown';
import { EMPTY_ARRAY } from 'constants/empty';

import { BodyColumnMainHeader } from '../../../common/Events/elements';
import { Option } from '../Option';

import {
  ColumnOptionsSelectorContainer,
  ColumnOptionsSelectorIconWrapper,
  Separator,
} from './elements';

export interface ColumnOptionsSelectorProps<T> {
  options?: T[];
  selectedOption?: T;
  displayValue?: T | string;
  width?: number;
  onChange?: (selectedOption: T) => void;
  Footer?: JSX.Element;
  disabled?: boolean;
}

export const ColumnOptionsSelector = <T extends string>({
  options = EMPTY_ARRAY,
  selectedOption,
  displayValue,
  width,
  onChange = noop,
  Footer,
  disabled = false,
}: ColumnOptionsSelectorProps<T>) => {
  const renderDropdownContent = () => {
    return (
      <Dropdown.Menu>
        {options.map((option) => (
          <Option
            key={option}
            option={option}
            isSelected={option === selectedOption}
            onChange={onChange}
          />
        ))}
        {!isEmpty(options) && Footer && <Separator />}
        {Footer}
      </Dropdown.Menu>
    );
  };

  const isChevronVisible = () => {
    if (disabled) {
      return false;
    }
    if (isEmpty(options) && !Footer) {
      return false;
    }
    return true;
  };

  return (
    <Dropdown
      placement="bottom-end"
      content={renderDropdownContent()}
      disabled={disabled}
    >
      <ColumnOptionsSelectorContainer>
        <div style={{ width }}>
          <BodyColumnMainHeader>
            {displayValue || selectedOption}
          </BodyColumnMainHeader>
        </div>

        {isChevronVisible() && (
          <ColumnOptionsSelectorIconWrapper>
            <Icon type="ChevronDownSmall" data-testid="chevron-down-icon" />
          </ColumnOptionsSelectorIconWrapper>
        )}
      </ColumnOptionsSelectorContainer>
    </Dropdown>
  );
};
