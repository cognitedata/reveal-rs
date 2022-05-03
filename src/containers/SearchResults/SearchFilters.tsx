import React from 'react';
import { Icon, Button, Tooltip, Row, Col, Flex } from '@cognite/cogs.js';

import { ResourceType } from 'types';
import { ResourceFilterProps, SetResourceFilterProps } from 'CommonProps';
import {
  AssetFilters,
  EventFilters,
  FileFilters,
  SequenceFilters,
  TimeseriesFilters,
} from 'components';
import { lightGrey } from 'utils/Colors';
import styled from 'styled-components';

const TRANSITION_TIME = 200;

type FilterProps = Required<ResourceFilterProps> &
  SetResourceFilterProps & {
    resourceType: ResourceType;
  };
const Filters = ({
  resourceType,
  assetFilter,
  setAssetFilter,
  timeseriesFilter,
  setTimeseriesFilter,
  sequenceFilter,
  setSequenceFilter,
  eventFilter,
  setEventFilter,
  fileFilter,
  setFileFilter,
}: FilterProps) => {
  switch (resourceType) {
    case 'asset': {
      return <AssetFilters filter={assetFilter} setFilter={setAssetFilter} />;
    }
    case 'event': {
      return <EventFilters filter={eventFilter} setFilter={setEventFilter} />;
    }
    case 'timeSeries': {
      return (
        <TimeseriesFilters
          filter={timeseriesFilter}
          setFilter={setTimeseriesFilter}
        />
      );
    }
    case 'file': {
      return <FileFilters filter={fileFilter} setFilter={setFileFilter} />;
    }
    case 'sequence': {
      return (
        <SequenceFilters
          filter={sequenceFilter}
          setFilter={setSequenceFilter}
        />
      );
    }

    default: {
      return null;
    }
  }
};

export const SearchFilters = ({
  visible = true,
  allowHide = true,
  closeFilters = () => {},
  resourceType,
  assetFilter,
  setAssetFilter,
  timeseriesFilter,
  setTimeseriesFilter,
  sequenceFilter,
  setSequenceFilter,
  eventFilter,
  setEventFilter,
  fileFilter,
  setFileFilter,
}: {
  resourceType: ResourceType;
  visible?: boolean;
  allowHide?: boolean;
  closeFilters?: () => void;
} & Required<ResourceFilterProps> &
  SetResourceFilterProps) => (
  <div
    style={{
      display: 'flex',
      flex: '0 1 auto',
      flexDirection: 'column',
      width: visible ? 260 : 0,
      marginLeft: 1,
      borderRight: `1px solid ${lightGrey}`,
      visibility: visible ? 'visible' : 'hidden',
      transition: `visibility 0s linear ${TRANSITION_TIME}ms, width ${TRANSITION_TIME}ms ease`,
    }}
  >
    {visible && (
      <>
        <HeaderRow alignItems="center">
          <Flex style={{ flex: 1 }}>
            <IconCol>
              <Icon type="Filter" />
            </IconCol>

            <div>Filters</div>
          </Flex>
          {allowHide && (
            <HideFiltersTooltip content="Hide">
              <Button icon="PanelLeft" type="ghost" onClick={closeFilters} />
            </HideFiltersTooltip>
          )}
        </HeaderRow>
        <div
          style={{
            paddingLeft: 1,
            paddingRight: 16,
            paddingBottom: 16,
            overflow: 'auto',
            height: '100%',
          }}
        >
          <Filters
            resourceType={resourceType}
            assetFilter={assetFilter}
            setAssetFilter={setAssetFilter}
            timeseriesFilter={timeseriesFilter}
            setTimeseriesFilter={setTimeseriesFilter}
            sequenceFilter={sequenceFilter}
            setSequenceFilter={setSequenceFilter}
            eventFilter={eventFilter}
            setEventFilter={setEventFilter}
            fileFilter={fileFilter}
            setFileFilter={setFileFilter}
          />
        </div>
      </>
    )}
  </div>
);

const IconCol = styled.div`
  margin-right: 16px;
  padding-right: 16px;
  border-right: 1px solid ${lightGrey};
`;

const HeaderRow = styled(Flex)`
  padding-right: 16px;
  padding-bottom: 20px;
  margin-top: 24px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${lightGrey};
`;

const HideFiltersTooltip = styled(Tooltip)`
  margin-bottom: 8px;
`;
