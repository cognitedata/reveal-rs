import React from 'react';

import { EventFilter, InternalId } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';
import { AggregatedFilter } from '../../components/Filters/AggregatedFilter/AggregatedFilter';
import { AggregatedEventFilter } from '../../components/Filters/AggregatedEventFilter/AggregatedEventFilter';
import { ByAssetFilter } from '../../components/Filters/ByAssetFilter/ByAssetFilter';
import { DateFilter } from '../../components/Filters/DateFilter/DateFilter';
import { MetadataFilter } from '../../components/Filters/MetadataFilter/MetadataFilter';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';

export const EventFilters = ({
  filter,
  setFilter,
  ...rest
}: {
  filter: EventFilter;
  setFilter: (newFilter: EventFilter) => void;
}) => {
  const { data: items = [] } = useList('events', { filter, limit: 1000 });

  return (
    <BaseFilterCollapse.Panel title="Events" {...rest}>
      <AggregatedEventFilter
        field="type"
        filter={filter}
        setValue={newValue => {
          setFilter({ ...filter, type: newValue });
        }}
        title="Type"
        value={filter.type}
      />
      <DateFilter
        title="Start Time"
        value={filter.startTime}
        setValue={newDate =>
          setFilter({
            ...filter,
            startTime: newDate || undefined,
          })
        }
      />
      <DateFilter
        title="End Time"
        enableNull
        value={
          filter.endTime && 'isNull' in filter.endTime ? null : filter.endTime
        }
        setValue={newDate =>
          setFilter({
            ...filter,
            endTime: newDate === null ? { isNull: true } : newDate || undefined,
          })
        }
      />
      <AggregatedEventFilter
        field="subtype"
        filter={filter}
        setValue={newValue => {
          setFilter({ ...filter, subtype: newValue });
        }}
        title="Sub-type"
        value={filter.subtype}
      />
      <ByAssetFilter
        value={filter.assetSubtreeIds?.map(el => (el as InternalId).id)}
        setValue={newValue =>
          setFilter({
            ...filter,
            assetSubtreeIds: newValue?.map(id => ({ id })),
          })
        }
      />
      <AggregatedFilter
        title="Source"
        items={items}
        aggregator="source"
        value={filter.source}
        setValue={newSource =>
          setFilter({
            ...filter,
            source: newSource,
          })
        }
      />
      <MetadataFilter
        items={items}
        value={filter.metadata}
        setValue={newMetadata =>
          setFilter({
            ...filter,
            metadata: newMetadata,
          })
        }
      />
    </BaseFilterCollapse.Panel>
  );
};
