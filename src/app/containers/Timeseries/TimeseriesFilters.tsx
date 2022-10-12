import React from 'react';
import { useList } from '@cognite/sdk-react-query-hooks';
import { BaseFilterCollapse } from '../../components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import {
  useFilterEmptyState,
  useResetTimeseriesFilters,
  useTimeseriesFilters,
} from 'app/store/filter';
import {
  AggregatedFilterV2,
  BooleanFilter,
  MetadataFilterV2,
} from '@cognite/data-exploration';
import { TempMultiSelectFix } from 'app/containers/elements';

export const TimeseriesFilters = ({ ...rest }) => {
  const [timeseriesFilter, setTimeseriesFilter] = useTimeseriesFilters();
  const resetTimeseriesFilters = useResetTimeseriesFilters();
  const isFiltersEmpty = useFilterEmptyState('timeseries');

  const { data: items = [] } = useList('timeseries', {
    filter: timeseriesFilter,
    limit: 1000,
  });

  return (
    <BaseFilterCollapse.Panel
      title="Time series"
      hideResetButton={isFiltersEmpty}
      onResetClick={resetTimeseriesFilters}
      {...rest}
    >
      <TempMultiSelectFix>
        <BooleanFilter
          title="Is step"
          value={timeseriesFilter.isStep}
          setValue={newValue =>
            setTimeseriesFilter({
              isStep: newValue,
            })
          }
        />
        <BooleanFilter
          title="Is string"
          value={timeseriesFilter.isString}
          setValue={newValue =>
            setTimeseriesFilter({
              isString: newValue,
            })
          }
        />

        <AggregatedFilterV2
          items={items}
          aggregator="unit"
          title="Unit"
          value={timeseriesFilter.unit}
          setValue={newValue => setTimeseriesFilter({ unit: newValue })}
        />

        <MetadataFilterV2
          items={items}
          value={timeseriesFilter.metadata}
          setValue={newMetadata =>
            setTimeseriesFilter({
              metadata: newMetadata,
            })
          }
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
