import React, { FC, useMemo } from 'react';

import styled from 'styled-components';

import { ResourceDetailsTemplate } from '@data-exploration/components';

import { Collapse, Title } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/plotting-components';

import {
  useAssetsByIdQuery,
  useDocumentSearchResultQuery,
  useEventsListQuery,
  useSequenceListQuery,
  useTimeseriesByIdsQuery,
  useTimeseriesListQuery,
} from '@data-exploration-lib/domain-layer';

import {
  AssetDetailsTable,
  EventDetailsTable,
  FileDetailsTable,
  SequenceDetailsTable,
  TimeseriesDetailsTable,
} from '../../DetailsTable';
import { TimeseriesInfo } from '../../Info';
import { onOpenResources } from '../AssetDetails';
import { EVENTS, FILES, SEQUENCES, TIME_SERIES } from '../constant';

interface Props {
  timeseriesId: number;
  isSelected: boolean;
  onSelectClicked?: () => void;
  onClose?: () => void;
}
export const TimeseriesDetails: FC<Props> = ({
  timeseriesId,
  isSelected,
  onSelectClicked,
  onClose,
}) => {
  const {
    data,
    isFetched: isTimeseriesFetched,
    isLoading: isParentTimeseriesLoading,
  } = useTimeseriesByIdsQuery([{ id: timeseriesId }]);
  const timeseries = useMemo(() => {
    return data ? data[0] : undefined;
  }, [data]);

  const assetIds = timeseries?.assetId ? [timeseries.assetId] : [];

  const isQueryEnabled = assetIds.length > 0;
  const { data: relatedAssets = [], isLoading: isAssetsLoading } =
    useAssetsByIdQuery(
      assetIds.map((id) => ({ id })),
      { enabled: isTimeseriesFetched && isQueryEnabled }
    );
  const {
    hasNextPage: hasEventNextPage,
    fetchNextPage: hasEventFetchNextPage,
    isLoading: isEventsLoading,
    data: events,
  } = useEventsListQuery({ filter: { assetIds } }, { enabled: isQueryEnabled });

  const {
    hasNextPage: hasTimeseriesNextPage,
    fetchNextPage: hasTimeseriesFetchNextPage,
    isLoading: isTimeseriesLoading,
    data: relatedTimeseries,
  } = useTimeseriesListQuery(
    { filter: { assetIds } },
    { enabled: isQueryEnabled }
  );

  const {
    hasNextPage: hasDocumentsNextPage,
    fetchNextPage: hasDocumentsFetchNextPage,
    isLoading: isDocumentsLoading,
    results: relatedDocuments = [],
  } = useDocumentSearchResultQuery(
    {
      filter: {
        assetSubtreeIds: assetIds.map((value) => ({
          value,
        })),
      },
    },
    { enabled: isQueryEnabled }
  );

  const {
    hasNextPage: hasSequencesNextPage,
    fetchNextPage: hasSequencesFetchNextPage,
    isLoading: isSequencesLoading,
    data: sequences = [],
  } = useSequenceListQuery(
    {
      filter: {
        assetIds,
      },
    },
    { enabled: isQueryEnabled }
  );

  return (
    <ResourceDetailsTemplate
      title={timeseries ? timeseries.name || '' : ''}
      icon="Timeseries"
      isSelected={isSelected}
      onClose={onClose}
      onSelectClicked={onSelectClicked}
    >
      <StyledCollapse accordion ghost defaultActiveKey="preview">
        {timeseries ? (
          <Collapse.Panel key="preview" header={<h4>Preview</h4>}>
            <TimeseriesChart
              timeseriesId={timeseries.id}
              height={300}
              numberOfPoints={100}
              variant="medium"
              dataFetchOptions={{
                mode: 'aggregate',
              }}
              autoRange
            />
          </Collapse.Panel>
        ) : null}
        <Collapse.Panel key="timeseries-details" header={<h4>Details</h4>}>
          {timeseries ? (
            <TimeseriesInfo timeseries={timeseries} />
          ) : (
            <Title level={5}>No Details Available</Title>
          )}
        </Collapse.Panel>
        <Collapse.Panel header={<h4>Assets</h4>}>
          <AssetDetailsTable
            id="related-asset-timeseries-details"
            data={relatedAssets}
            isLoadingMore={isAssetsLoading}
            onRowClick={(currentAsset) =>
              onOpenResources('asset', currentAsset.id)
            }
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="event-timeseries-detail"
          header={<h4>{TIME_SERIES}</h4>}
        >
          <TimeseriesDetailsTable
            id="timeseries-resource-event-detail-table"
            data={relatedTimeseries}
            hasNextPage={hasTimeseriesNextPage}
            fetchMore={hasTimeseriesFetchNextPage}
            isDataLoading={isParentTimeseriesLoading || isTimeseriesLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="timeseries-documents-detail"
          header={<h4>{FILES}</h4>}
        >
          <FileDetailsTable
            id="documents-resource-timeseries-detail-table"
            data={relatedDocuments}
            hasNextPage={hasDocumentsNextPage}
            fetchMore={hasDocumentsFetchNextPage}
            isDataLoading={isParentTimeseriesLoading || isDocumentsLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="timeseries-events-detail"
          header={<h4>{EVENTS}</h4>}
        >
          <EventDetailsTable
            id="event-resource-timeseries-detail-table"
            data={events}
            hasNextPage={hasEventNextPage}
            fetchMore={hasEventFetchNextPage}
            isDataLoading={isParentTimeseriesLoading || isEventsLoading}
          />
        </Collapse.Panel>
        <Collapse.Panel
          key="timeseries-sequence-detail"
          header={<h4>{SEQUENCES}</h4>}
        >
          <SequenceDetailsTable
            id="sequence-resource-timeseries-detail-table"
            data={sequences}
            hasNextPage={hasSequencesNextPage}
            fetchMore={hasSequencesFetchNextPage}
            isDataLoading={isParentTimeseriesLoading || isSequencesLoading}
          />
        </Collapse.Panel>
      </StyledCollapse>
    </ResourceDetailsTemplate>
  );
};

const StyledCollapse = styled(Collapse)`
  overflow: auto;
`;
