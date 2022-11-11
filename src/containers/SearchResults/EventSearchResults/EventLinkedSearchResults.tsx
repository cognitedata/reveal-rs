import { CogniteEvent } from '@cognite/sdk';
import { useList } from '@cognite/sdk-react-query-hooks';
import { AggregatedEventFilterV2, MetadataFilterV2 } from 'components';
import { AppliedFiltersTags } from 'components/AppliedFiltersTags/AppliedFiltersTags';
import { TableSortBy } from 'components/ReactTable/V2';
import { transformNewFilterToOldFilter } from 'domain/transformers';
import React, { useMemo, useState } from 'react';
import { PreviewFilterDropdown } from 'components/PreviewFilter/PreviewFilterDropdown';
import { DefaultPreviewFilter } from 'components/PreviewFilter/PreviewFilter';
import { InternalCommonFilters } from 'domain/types';
import { useDebounce } from 'use-debounce';
import {
  InternalEventsFilters,
  useEventsSearchResultQuery,
} from 'domain/events';
import { EventNewTable } from 'containers';

interface Props {
  defaultFilter: InternalCommonFilters;
  onClick: (item: CogniteEvent) => void;
}

const LinkedEventFilter = ({
  filter,
  onFilterChange,
}: {
  filter: InternalEventsFilters;
  onFilterChange: (newValue: InternalEventsFilters) => void;
}) => {
  const { data: items = [] } = useList('events', {
    filter: transformNewFilterToOldFilter(filter),
    limit: 1000,
  });

  return (
    <PreviewFilterDropdown>
      <AggregatedEventFilterV2
        field="type"
        filter={filter}
        setValue={newValue => {
          onFilterChange({ type: newValue });
        }}
        title="Type"
        value={filter.type}
      />
      <AggregatedEventFilterV2
        field="subtype"
        filter={filter}
        setValue={newValue => {
          onFilterChange({ subtype: newValue });
        }}
        title="Sub-type"
        value={filter.subtype}
      />
      <MetadataFilterV2
        items={items}
        value={filter.metadata}
        setValue={newValue => onFilterChange({ metadata: newValue })}
      />
    </PreviewFilterDropdown>
  );
};

export const EventLinkedSearchResults: React.FC<Props> = ({
  defaultFilter,
  onClick,
}) => {
  const [query, setQuery] = useState<string | undefined>();
  const [debouncedQuery] = useDebounce(query, 300);
  const [filter, setFilter] = useState<InternalEventsFilters>({});
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);

  const eventsFilters = useMemo(() => {
    return {
      ...filter,
      ...defaultFilter,
    };
  }, [filter, defaultFilter]);

  const { data, hasNextPage, fetchNextPage } = useEventsSearchResultQuery({
    query: debouncedQuery,
    eventsFilters,
    eventsSortBy: sortBy,
  });

  const appliedFilters = { ...filter, assetSubtreeIds: undefined };

  return (
    <EventNewTable
      id="event-linked-search-results"
      onRowClick={event => onClick(event)}
      data={data}
      enableSorting
      onSort={props => setSortBy(props)}
      showLoadButton
      tableSubHeaders={
        <AppliedFiltersTags
          filter={appliedFilters}
          onFilterChange={setFilter}
        />
      }
      tableHeaders={
        <DefaultPreviewFilter query={query} onQueryChange={setQuery}>
          <LinkedEventFilter
            filter={filter}
            onFilterChange={newValue =>
              setFilter(prevState => ({ ...prevState, ...newValue }))
            }
          />
        </DefaultPreviewFilter>
      }
      hasNextPage={hasNextPage}
      fetchMore={fetchNextPage}
    />
  );
};
