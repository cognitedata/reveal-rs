import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { SelectedIntegrationProvider } from 'hooks/useSelectedIntegration';
import { Colors, Loader } from '@cognite/cogs.js';
import { WrapperMargin } from 'styles/StyledWrapper';
import OverviewSidePanel from './OverviewSidePanel';
import IntegrationsTable from '../integrations/IntegrationsTable';
import { useIntegrations } from '../../hooks/useIntegrations';
import {
  mapDataSetToIntegration,
  mapUniqueDataSetIds,
} from '../../utils/dataSetUtils';
import { useDataSets } from '../../hooks/useDataSets';
import { ErrorFeedback } from '../error/ErrorFeedback';
import NoIntegrations from '../error/NoIntegrations';

const IntegrationsWrapper = styled.div`
  border-left: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
  height: calc(100vh - 9.5625rem);
`;
const StyledOverview = styled((props) => (
  <div {...props}>{props.children}</div>
))`
  grid-area: main;
  display: grid;
  grid-template-columns: auto 25rem;
  padding: 0;
  border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
`;
const ErrorWrapper = styled.div`
  grid-area: main;
  display: grid;
  height: calc(100vh - 9.5625rem);
  border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
`;
interface OwnProps {}

type Props = OwnProps;

const OverviewTab: FunctionComponent<Props> = () => {
  const {
    data,
    isLoading: isLoadingIntegrations,
    error: errorIntegrations,
    refetch,
  } = useIntegrations();
  const dataSetIds = mapUniqueDataSetIds(data);
  const { isLoading, data: dataSets } = useDataSets(dataSetIds);
  let tableData = data ?? [];
  if (data && data.length === 0) {
    return (
      <ErrorWrapper>
        <NoIntegrations />
      </ErrorWrapper>
    );
  }
  if (isLoading || isLoadingIntegrations) {
    return <Loader />;
  }
  const handleErrorDialogClick = async () => {
    await refetch();
  };

  if (errorIntegrations) {
    return (
      <ErrorWrapper>
        <ErrorFeedback
          btnText="Retry"
          onClick={handleErrorDialogClick}
          fallbackTitle="Could not get integrations"
          contentText="Please try again later."
          error={errorIntegrations}
        />
      </ErrorWrapper>
    );
  }

  if (dataSets) {
    tableData = mapDataSetToIntegration(data, dataSets);
  }
  return (
    <StyledOverview>
      <SelectedIntegrationProvider>
        <WrapperMargin>
          <IntegrationsTable tableData={tableData} />
        </WrapperMargin>
        <IntegrationsWrapper>
          <OverviewSidePanel />
        </IntegrationsWrapper>
      </SelectedIntegrationProvider>
    </StyledOverview>
  );
};

export default OverviewTab;
