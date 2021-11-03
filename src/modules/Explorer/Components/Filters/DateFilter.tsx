import React, { useEffect, useState } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { DatePicker } from 'antd';
import styled from 'styled-components';
import moment from 'moment';
import { DateRange } from '@cognite/cdf-sdk-singleton';
import { VisionFilterItemProps } from './types';

const dateFormat = 'DD.MM.YYYY HH:mm:ss';

export const DateFilter = ({ filter, setFilter }: VisionFilterItemProps) => {
  const [action, setAction] = useState('created');
  const [time, setTime] = useState('before');
  const [startDate, setStartDate] =
    useState<moment.Moment | undefined>(undefined);
  const [endDate, setEndDate] = useState<moment.Moment | undefined>(undefined);

  const clearAll = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // clear filter
  useEffect(() => {
    if (
      filter.createdTime === undefined &&
      filter.uploadedTime === undefined &&
      filter.sourceCreatedTime === undefined
    )
      clearAll();
  }, [filter]);

  useEffect(() => {
    let range: DateRange | undefined;

    // set range according to time
    switch (time) {
      case 'before':
        range = startDate ? { max: startDate.valueOf() } : undefined;
        break;
      case 'after':
        range = startDate ? { min: startDate.valueOf() } : undefined;
        break;
      case 'range':
        range =
          startDate && endDate
            ? { min: startDate.valueOf(), max: endDate.valueOf() }
            : undefined;
        break;
    }

    // set range to undefined if startDate and endDate are undefined
    if (startDate?.valueOf() === undefined && endDate?.valueOf() === undefined)
      range = undefined;

    // to avoid setting filter when dates are undefined
    if (range) {
      switch (action) {
        case 'created':
          setFilter({
            ...filter,
            createdTime: range,
          });
          break;
        case 'uploaded':
          setFilter({
            ...filter,
            uploadedTime: range,
          });
          break;
        case 'captured':
          setFilter({
            ...filter,
            sourceCreatedTime: range,
          });
          break;
      }
    }
    // if range is undefined clearing filter if and if only it was defined
    else if (
      filter.createdTime ||
      filter.uploadedTime ||
      filter.sourceCreatedTime
    ) {
      setFilter({
        ...filter,
        createdTime: undefined,
        uploadedTime: undefined,
        sourceCreatedTime: undefined,
      });
    }
  }, [action, time, startDate, endDate]);

  return (
    <Container>
      <StyledSegmentedControl
        currentKey={action}
        onButtonClicked={setAction}
        size="small"
      >
        <SegmentedControl.Button key="created">Created</SegmentedControl.Button>
        <SegmentedControl.Button key="uploaded">
          Uploaded
        </SegmentedControl.Button>
        <SegmentedControl.Button key="captured">
          Captured
        </SegmentedControl.Button>
      </StyledSegmentedControl>

      <StyledSegmentedControl
        currentKey={time}
        onButtonClicked={setTime}
        size="small"
        style={{ width: 'fit-content' }}
      >
        <SegmentedControl.Button key="before">Before</SegmentedControl.Button>
        <SegmentedControl.Button key="after">After</SegmentedControl.Button>
        <SegmentedControl.Button key="range">Range</SegmentedControl.Button>
      </StyledSegmentedControl>

      <DatePickersContainer>
        <DatePicker
          showTime
          value={startDate}
          onChange={(date) => {
            if (date === null) setStartDate(undefined);
            else setStartDate(date);
          }}
          format={dateFormat}
          style={{ backgroundColor: '#ffffff' }}
        />
        <DatePicker
          showTime
          value={endDate}
          onChange={(date) => {
            if (date === null) setEndDate(undefined);
            else setEndDate(date);
          }}
          format={dateFormat}
          style={{ backgroundColor: '#ffffff' }}
          disabled={time !== 'range'}
        />
      </DatePickersContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  gap: 16px;
  flex-direction: column;
`;

const StyledSegmentedControl = styled(SegmentedControl)`
  width: fit-content;
`;

const DatePickersContainer = styled.div`
  display: grid;
  gap: 6px;
`;
