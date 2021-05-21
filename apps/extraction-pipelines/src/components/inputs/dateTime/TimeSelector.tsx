import React, { FunctionComponent, PropsWithChildren, useState } from 'react';
import styled from 'styled-components';
import { DivFlex } from 'styles/flex/StyledFlex';
import { OptionTypeBase } from 'react-select';
import { Button, Icon, Input, Range, Select } from '@cognite/cogs.js';
import {
  createDateFromTimeChange,
  createHalfHourOptions,
  optionTimeField,
  parseTimeString,
  rangeToTwoDigitString,
} from 'components/inputs/dateTime/TimeSelectorUtils';

const TimeWrapper = styled(DivFlex)`
  .cogs-input-container {
    height: 100%;
    .cogs-input {
      width: 5rem;
      background-color: transparent;
      border: 1px solid transparent;
      &:hover {
        background-color: transparent;
      }
    }
    .input-postfix-node {
      .cogs-btn {
        padding-left: 0;
      }
    }
  }
  .cogs-select {
    width: 100%;
    height: 0;
    .cogs-select__control {
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      height: 1px;
      overflow: hidden;
      position: static;
      white-space: nowrap;
      width: 1px;
    }
    .cogs-select__menu {
      position: absolute;
    }
  }
`;

export const RANGE_END_LABEL: Readonly<string> = 'Date range end time';
export const RANGE_START_LABEL: Readonly<string> = 'Date range start time';

interface TimeSelectorProps {
  dateRange: Range;
  dateRangeChanged: (range: Range) => void;
}

export type Time = { hours: number; min: number };
export const TimeSelector: FunctionComponent<TimeSelectorProps> = ({
  dateRange,
  dateRangeChanged,
}: PropsWithChildren<TimeSelectorProps>) => {
  const [showStartDropDown, setShowStartDropDown] = useState(false);
  const [showEndDropDown, setShowEndDropDown] = useState(false);
  const [startString, setStartString] = useState<string>(
    rangeToTwoDigitString({
      hours: dateRange.startDate?.getHours(),
      min: dateRange.startDate?.getMinutes(),
    })
  );
  const [endString, setEndString] = useState<string>(
    rangeToTwoDigitString({
      hours: dateRange.endDate?.getHours(),
      min: dateRange.endDate?.getMinutes(),
    })
  );

  const options = createHalfHourOptions();

  const handleSelectStart = ({ value }: OptionTypeBase) => {
    const { hours, min } = value;
    setStartString(rangeToTwoDigitString({ hours, min }));

    const start = createDateFromTimeChange(dateRange, 'startDate', value);
    dateRangeChanged({ ...dateRange, startDate: start });
    setShowStartDropDown(false);
  };

  const handleSelectEnd = ({ value }: OptionTypeBase) => {
    const { hours, min } = value;
    setEndString(rangeToTwoDigitString({ hours, min }));

    const end = createDateFromTimeChange(dateRange, 'endDate', value);
    dateRangeChanged({ ...dateRange, endDate: end });

    setShowEndDropDown(false);
  };

  const startInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setStartString(e.target.value);
    const time = parseTimeString(e.target.value);
    if (time) {
      const start = createDateFromTimeChange(dateRange, 'startDate', time);
      dateRangeChanged({ ...dateRange, startDate: start });
    }
  };

  const endInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setEndString(e.target.value);
    const time = parseTimeString(e.target.value);
    if (time) {
      const end = createDateFromTimeChange(dateRange, 'endDate', time);
      dateRangeChanged({ ...dateRange, endDate: end });
    }
  };

  const startSelectedValue = (range: Range) => {
    return options.filter(optionTimeField(range, 'startDate'))[0];
  };

  const endSelectedValue = (range: Range) => {
    return options.filter(optionTimeField(range, 'endDate'))[0];
  };

  const toggleStartDropDown = () => {
    setShowStartDropDown((prev) => !prev);
  };

  const toggleEndDropDown = () => {
    setShowEndDropDown((prev) => !prev);
  };

  return (
    <TimeWrapper className="time-picker" align="stretch">
      <DivFlex direction="column">
        <Input
          name="startTimeInput"
          value={startString}
          onChange={startInputChanged}
          onClick={toggleStartDropDown}
          postfix={
            <Button type="ghost" onClick={toggleStartDropDown}>
              <Icon type="ChevronDownMicro" />
            </Button>
          }
          aria-label={RANGE_START_LABEL}
        />
        <Select
          inputId="startTime"
          className="visually-hidden"
          menuIsOpen={showStartDropDown}
          value={startSelectedValue(dateRange)}
          options={options}
          onChange={handleSelectStart}
        />
      </DivFlex>
      <DivFlex direction="column">
        <Input
          name="endTimeInput"
          value={endString}
          onChange={endInputChanged}
          onClick={toggleEndDropDown}
          aria-label={RANGE_END_LABEL}
          postfix={
            <Button type="ghost" onClick={toggleEndDropDown}>
              <Icon type="ChevronDownMicro" />
            </Button>
          }
        />
        <Select
          inputId="endTime"
          className="visually-hidden"
          menuIsOpen={showEndDropDown}
          value={endSelectedValue(dateRange)}
          options={options}
          onChange={handleSelectEnd}
          onSelect
        />
      </DivFlex>
    </TimeWrapper>
  );
};
