import { useList } from '@cognite/sdk-react-query-hooks';
import { AggregateResponse } from '@cognite/sdk';
import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  useAssetFilters,
  useFilterEmptyState,
  useResetAssetFilters,
} from 'app/store/filter';
import { BaseFilterCollapse } from 'app/components/Collapse/BaseFilterCollapse/BaseFilterCollapse';
import {
  AggregatedFilterV2,
  InternalAssetFilters,
  LabelFilterV2,
  MetadataFilterV2,
  transformNewFilterToOldFilter,
} from '@cognite/data-exploration';
import { TempMultiSelectFix } from 'app/containers/elements';

// TODO: Move to domain layer
export const useAssetMetadataKeys = (
  filter?: InternalAssetFilters,
  config?: UseQueryOptions<
    AggregateResponse[],
    unknown,
    AggregateResponse[],
    (string | InternalAssetFilters | undefined)[]
  >
) => {
  const sdk = useSDK();

  filter = transformNewFilterToOldFilter(filter);

  const { data, ...rest } = useQuery(
    ['assets', 'aggregate', 'metadataKeys', filter],
    async () =>
      // @ts-ignore
      sdk.assets.aggregate({ filter, aggregate: 'metadataKeys' }),
    {
      staleTime: 60 * 1000,
      ...config,
    }
  );

  return { data: data as any, ...rest };
};

export const AssetFilters = ({ ...rest }) => {
  const [assetFilters, setAssetFilters] = useAssetFilters();
  const resetAssetFilters = useResetAssetFilters();
  const isFiltersEmpty = useFilterEmptyState('asset');

  const { data: items = [] } = useList('assets', {
    filter: transformNewFilterToOldFilter(assetFilters),
    limit: 1000,
  });

  const { data: metadataKeys = [] } = useAssetMetadataKeys(assetFilters);

  return (
    <BaseFilterCollapse.Panel
      title="Assets"
      hideResetButton={isFiltersEmpty}
      onResetClick={resetAssetFilters}
      {...rest}
    >
      <TempMultiSelectFix>
        <LabelFilterV2
          resourceType="asset"
          value={assetFilters.labels}
          setValue={newFilters =>
            setAssetFilters({
              labels: newFilters,
            })
          }
          addNilOption
        />
        <AggregatedFilterV2
          title="Source"
          items={items}
          aggregator="source"
          value={assetFilters.source}
          setValue={newSource =>
            setAssetFilters({
              source: newSource,
            })
          }
          addNilOption
        />
        <MetadataFilterV2
          items={items}
          keys={metadataKeys}
          value={assetFilters.metadata}
          setValue={newMetadata =>
            setAssetFilters({
              metadata: newMetadata,
            })
          }
          useAggregates
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
