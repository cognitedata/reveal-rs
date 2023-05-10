import { useState } from 'react';

import { Body, Dropdown, Icon, Title } from '@cognite/cogs.js';

import {
  EMPTY_ARRAY,
  NIL_FILTER_LABEL,
  useDeepEffect,
} from '@data-exploration-lib/core';

import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import has from 'lodash/has';

import {
  OptionType,
  OptionSelection,
  SortDirection,
  CustomMetadataValue,
} from '../types';

import { filterOptions } from '../utils/filterOptions';
import { sortOptions } from '../utils/sortOptions';
import { hasOptionWithChildOptions } from '../utils/hasOptionWithChildOptions';

import { SearchInput } from './SearchInput';
import { Option } from './Option';
import { ChildOptionsMenu } from './ChildOptionsMenu';
import { FilterEmptyState } from './FilterEmptyState';
import { SortAction } from './SortAction';
import {
  OptionContainer,
  OptionMenuContainer,
  OptionMenuLoadingWrapper,
} from '../elements';

export interface OptionsMenuProps {
  options: Array<OptionType>;
  selection: OptionSelection;
  onChange: (selection: OptionSelection) => void;
  footer?: React.ReactNode;
  enableSorting?: boolean;
  useCustomMetadataValuesQuery?: CustomMetadataValue;
  onSearchInputChange?: (newValue: string) => void;
  disableOptionsMenu?: boolean;
  isLoading?: boolean;
}

export const OptionsMenu = ({
  options,
  selection,
  onChange,
  footer,
  enableSorting,
  onSearchInputChange,
  useCustomMetadataValuesQuery,
  disableOptionsMenu,
  isLoading,
}: OptionsMenuProps) => {
  const [displayOptions, setDisplayOptions] = useState(options);

  const [hoverOption, setHoverOption] = useState<OptionType>();

  useDeepEffect(() => {
    setDisplayOptions(options);
  }, [options]);

  const handleFilterOptions = (searchInputValue: string) => {
    onSearchInputChange?.(searchInputValue);
    const filteredOptions = filterOptions(options, searchInputValue);
    setDisplayOptions(filteredOptions);
  };

  const handleSortOptions = (sortDirection: SortDirection) => {
    const sortedOptions = sortOptions(displayOptions, sortDirection);
    setDisplayOptions(sortedOptions);
  };

  const handleOptionChange = (value: string, isSelected: boolean) => {
    const newSelection = isSelected
      ? { ...selection, [value]: EMPTY_ARRAY }
      : omit(selection, value);

    onChange(newSelection);
  };
  const renderOptions = () => {
    if (isEmpty(displayOptions)) {
      return <FilterEmptyState />;
    }

    return displayOptions.map((option, index) => {
      const { options: childOptions } = option;
      let { value } = option;

      if (!value) {
        value = NIL_FILTER_LABEL;
      }

      return (
        <Dropdown
          key={`${option.value}_${index}`}
          placement="right-start"
          visible={hoverOption && hoverOption?.value === option.value}
          onClickOutside={() => {
            setHoverOption(undefined);
          }}
          content={
            <ChildOptionsMenu
              parentOptionValue={value}
              options={childOptions}
              useCustomMetadataValuesQuery={useCustomMetadataValuesQuery}
              selection={selection}
              onChange={onChange}
              enableSorting={enableSorting}
            />
          }
          disabled={disableOptionsMenu}
        >
          <Option
            onMouseEnter={() => {
              setHoverOption(option);
            }}
            onMouseLeave={() => {
              setHoverOption(undefined);
            }}
            option={option}
            checked={has(selection, value)}
            indeterminate={!isEmpty(selection[value])}
            onChange={(isSelected) => handleOptionChange(value, isSelected)}
            hasOptionWithChildOptions={hasOptionWithChildOptions(
              options,
              useCustomMetadataValuesQuery
            )}
          />
        </Dropdown>
      );
    });
  };

  if (isLoading) {
    return (
      <OptionMenuContainer>
        <OptionMenuLoadingWrapper>
          <Icon size={21} type="Loader" />
          <Title level={5}>Loading...</Title>
          <Body level={3}>Amount of data might affect loading time</Body>
        </OptionMenuLoadingWrapper>
      </OptionMenuContainer>
    );
  }

  return (
    <OptionMenuContainer>
      <SearchInput onChange={handleFilterOptions} />

      <SortAction
        isVisible={enableSorting && !isEmpty(displayOptions)}
        onChange={handleSortOptions}
      />

      <OptionContainer>{renderOptions()}</OptionContainer>

      {footer}
    </OptionMenuContainer>
  );
};
