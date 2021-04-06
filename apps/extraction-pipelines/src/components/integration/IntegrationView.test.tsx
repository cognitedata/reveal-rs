import React from 'react';
import { screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import moment from 'moment';
import { renderWithSelectedIntegrationContext } from 'utils/test/render';
import { getMockResponse } from 'utils/mockResponse';
import { INTEGRATIONS } from 'utils/baseURL';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { DetailFieldNames } from 'model/Integration';
import { NO_SCHEDULE, SINGLE_INTEGRATION } from 'utils/constants';
import { IntegrationView } from 'components/integration/IntegrationView';
import { trackUsage } from 'utils/Metrics';

describe('IntegrationView', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Displays integration', () => {
    const mockIntegration = getMockResponse()[0];
    renderWithSelectedIntegrationContext(<IntegrationView />, {
      initIntegration: mockIntegration,
      client: new QueryClient(),
      route: `${INTEGRATIONS}/${mockIntegration.id}`,
    });
    // test tracking
    expect(trackUsage).toHaveBeenCalledTimes(1);
    expect(trackUsage).toHaveBeenCalledWith(SINGLE_INTEGRATION, {
      id: mockIntegration.id,
    });
    expect(
      screen.getByText(new RegExp(TableHeadings.NAME, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.name)).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.EXTERNAL_ID, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.externalId)).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.ID, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.id)).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.CREATED_BY, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.createdBy)).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.CREATED_TIME, 'i'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(moment(mockIntegration.createdTime).fromNow())
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(DetailFieldNames.LAST_UPDATED_TIME, 'i'))
    ).toBeInTheDocument();
    expect(
      screen.getByText(moment(mockIntegration.lastUpdatedTime).fromNow())
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(new RegExp(TableHeadings.SCHEDULE, 'i')).length
    ).toEqual(1);
    expect(screen.getByText('At 09:00 AM')).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.DESCRIPTION, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.description)).toBeInTheDocument();
  });

  test('Renders with minimal required info', () => {
    const mockIntegration = {
      id: 123,
      externalId: 'lisa.external.id',
      name: 'My integration',
    };
    renderWithSelectedIntegrationContext(<IntegrationView />, {
      initIntegration: mockIntegration,
      client: new QueryClient(),
      route: `${INTEGRATIONS}/${mockIntegration.id}`,
    });
    expect(screen.getByText(mockIntegration.externalId)).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.id)).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.name)).toBeInTheDocument();
    expect(screen.getByText(NO_SCHEDULE)).toBeInTheDocument();
  });
});
