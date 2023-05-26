import React, { useEffect, useRef, useState } from 'react';

import {
  DatePicker,
  Select,
  RangePicker,
} from '@data-exploration-components/components';
import { TIME_SELECT } from '@data-exploration-components/containers';

import { Body } from '@cognite/cogs.js';
import { DateRange } from '@cognite/sdk';

const determinePeriod = (value: DateRange | undefined | null) => {
  if (value === undefined) {
    return 'none';
  }
  if (value === null) {
    return 'null';
  }
  if (value.min && value.max) {
    return 'during';
  }
  if (value.min) {
    return 'after';
  }
  if (value.max) {
    return 'before';
  }
  return 'none';
};

export const DateFilter = ({
  value,
  setValue,
  title,
  enableNull = false,
}: {
  title: string;
  enableNull?: boolean;
  value: DateRange | undefined | null;
  setValue: (
    newValue: { min?: number; max?: number } | undefined | null
  ) => void;
}) => {
  type PeriodType = 'none' | 'before' | 'during' | 'after' | 'null';
  const [period, setPeriod] = useState<PeriodType>(determinePeriod(value));

  const prevValueRef = useRef<PeriodType>();
  const prevValue = prevValueRef.current;
  if (
    determinePeriod(value) !== prevValue &&
    determinePeriod(value) !== period
  ) {
    setPeriod(determinePeriod(value));
  }
  useEffect(() => {
    prevValueRef.current = determinePeriod(value);
  }, [value]);

  const startDate = new Date(
    value?.min || value?.max || TIME_SELECT['1Y'].getTime()[0]
  );
  const endDate = new Date(value?.max || new Date());

  const options = [
    { value: 'none', label: 'All' },
    ...(enableNull ? [{ value: 'null', label: 'Empty' }] : []),
    { value: 'before', label: 'Before' },
    { value: 'during', label: 'During' },
    { value: 'after', label: 'After' },
  ];

  return (
    <>
      <Body
        level={4}
        style={{ marginBottom: 5, marginTop: 10 }}
        className="title"
      >
        {title}
      </Body>
      <Select
        value={options.find((el) => el.value === period)!}
        options={options}
        isSearchable={false}
        isClearable={false}
        blurInputOnSelect
        isMulti={false}
        onChange={(newValue: any) => {
          const newKey = (
            newValue as {
              value: 'none' | 'null' | 'before' | 'during' | 'after';
            }
          ).value;
          setPeriod(newKey);
          switch (newKey) {
            case 'none': {
              if (value !== undefined) {
                setValue(undefined);
              }
              return;
            }
            case 'during': {
              if (
                !value ||
                value.min !== startDate.valueOf() ||
                value.max !== endDate.valueOf()
              ) {
                setValue({ min: startDate.valueOf(), max: endDate.valueOf() });
              }
              return;
            }
            case 'before': {
              if (!value || value.max !== endDate.valueOf()) {
                setValue({ max: endDate.valueOf() });
              }
              return;
            }
            case 'after': {
              if (!value || value.min !== endDate.valueOf()) {
                setValue({ min: endDate.valueOf() });
              }
              return;
            }
            case 'null': {
              if (value !== null) {
                setValue(null);
              }
            }
          }
        }}
      />
      {(period === 'after' || period === 'before') && (
        <div style={{ marginTop: 8 }}>
          <DatePicker
            initialDate={new Date(startDate)}
            onDateChanged={(newDate) => {
              if (period === 'after') {
                setValue({ min: newDate.valueOf() });
              } else {
                setValue({ max: newDate.valueOf() });
              }
            }}
          />
        </div>
      )}
      {period === 'during' && (
        <div style={{ marginTop: 8 }}>
          <RangePicker
            initialRange={[new Date(startDate), new Date(endDate)]}
            onRangeChanged={(dates) => {
              setValue({ min: dates[0].valueOf(), max: dates[1].valueOf() });
            }}
          />
        </div>
      )}
    </>
  );
};
