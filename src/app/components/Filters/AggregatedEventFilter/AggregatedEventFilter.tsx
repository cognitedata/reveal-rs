import React from 'react';

import { EventFilter } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { aggregateKey } from '@cognite/sdk-react-query-hooks';
import { useQuery } from 'react-query';

import { Select } from '@cognite/data-exploration';
import { FilterFacetTitle } from '../FilterFacetTitle';

type EventFieldForAggregate = 'type' | 'subtype' | 'dataSetId';

const eventAggregateKey = (
  aggregate: string,
  field: EventFieldForAggregate,
  filter?: any
): string[] => [...aggregateKey('events', filter), aggregate, field];

const useEventAggregate = (
  aggregate: string,
  field: EventFieldForAggregate,
  filter?: any
) => {
  const sdk = useSDK();
  return useQuery(eventAggregateKey(aggregate, field, filter), async () =>
    sdk.events.aggregate.uniqueValues({
      filter,
      fields: [field],
    })
  );
};

export const AggregatedEventFilter = ({
  field,
  filter,
  title,
  setValue,
  value,
}: {
  field: EventFieldForAggregate;
  filter: EventFilter;
  title: string;
  setValue: (newValue?: string) => void;
  value?: string;
}): JSX.Element => {
  const { data = [] } = useEventAggregate('uniqueValues', field, filter);

  const handleUpdate = (newValue?: string): void => {
    setValue(newValue && newValue.length > 0 ? newValue : undefined);
  };

  return (
    <>
      <FilterFacetTitle>{title}</FilterFacetTitle>
      <Select
        creatable
        value={value ? { value, label: value } : null}
        onChange={(item: any) => {
          if (item) {
            handleUpdate((item as { value: string }).value);
          } else {
            handleUpdate(undefined);
          }
        }}
        options={[...data].map(({ value: eventType }) => ({
          value: eventType,
          label: eventType,
        }))}
      />
    </>
  );
};
