import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { DetailFieldNames } from 'model/Integration';
import { NO_SCHEDULE, SINGLE_EXT_PIPE } from 'utils/constants';
import { IntegrationDetails } from 'components/integration/IntegrationDetails';
import { trackUsage } from 'utils/Metrics';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { render } from 'utils/test';
import { RAW_DB } from 'components/inputs/rawSelector/EditRawTable';
// eslint-disable-next-line
import { useCapabilities } from '@cognite/sdk-react-query-hooks';
import { EXTRACTION_PIPELINES_ACL } from 'model/AclAction';

describe('IntegrationView', () => {
  const mockIntegration = getMockResponse()[0];
  const mockDataSet = mockDataSetResponse()[0];
  let wrapper: any;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mockIntegration,
      '/'
    );
    useCapabilities.mockReturnValue({
      isLoading: false,
      data: [{ acl: EXTRACTION_PIPELINES_ACL, actions: ['READ', 'WRITE'] }],
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Displays integration', async () => {
    sdkv3.get.mockResolvedValue({ data: mockIntegration });
    sdkv3.datasets.retrieve.mockResolvedValue([mockDataSet]);

    render(<IntegrationDetails />, {
      wrapper: wrapper.wrapper,
    });
    // test tracking
    expect(trackUsage).toHaveBeenCalledTimes(1);
    expect(trackUsage).toHaveBeenCalledWith(SINGLE_EXT_PIPE, {
      id: mockIntegration.id,
    });
    await waitFor(() => {
      screen.getAllByText(DetailFieldNames.DOCUMENTATION);
      screen.getByText(new RegExp(TableHeadings.CONTACTS, 'i'));
    });

    mockIntegration.contacts.forEach((contact) => {
      expect(screen.getByText(contact.name)).toBeInTheDocument();
      expect(screen.getByText(contact.email)).toBeInTheDocument();
    });
    expect(
      screen.getByText(new RegExp(DetailFieldNames.EXTERNAL_ID, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.externalId)).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.ID, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.id)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(TableHeadings.DATA_SET))
    ).toBeInTheDocument();
    expect(screen.getByText(mockDataSet.name)).toBeInTheDocument();

    expect(screen.getByText(new RegExp(RAW_DB, 'i'))).toBeInTheDocument();
    // eslint-disable-next-line no-unused-expressions
    mockIntegration.rawTables?.forEach(({ dbName, tableName }) => {
      expect(screen.getByText(dbName)).toBeInTheDocument();
      expect(screen.getByText(tableName)).toBeInTheDocument();
    });

    expect(
      screen.getByText(new RegExp(DetailFieldNames.CREATED_BY, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(mockIntegration.createdBy)).toBeInTheDocument();

    expect(
      screen.getByText(new RegExp(DetailFieldNames.CREATED_TIME, 'i'))
    ).toBeInTheDocument();
    // expect(
    //   screen.getByText(
    //     moment(mockIntegration.createdTime).from('2021-06-01T14:00:00Z')
    //   )
    // ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(DetailFieldNames.LAST_UPDATED_TIME, 'i'))
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(new RegExp(TableHeadings.SCHEDULE, 'i')).length
    ).toEqual(2); // general info and top bar
    expect(screen.getAllByText('At 09:00 AM').length).toEqual(2);
  });

  test('Renders with minimal required info', async () => {
    const mock = {
      id: 123,
      externalId: 'lisa.external.id',
      name: 'My integration',
    };
    sdkv3.get.mockResolvedValue({ data: mock });
    render(<IntegrationDetails />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(mock.externalId);
    });
    expect(screen.getByText(mock.externalId)).toBeInTheDocument();
    expect(screen.getByText(mock.id)).toBeInTheDocument();
    expect(screen.getByText(NO_SCHEDULE)).toBeInTheDocument();
    expect(screen.getByText(/add raw tables/i)).toBeInTheDocument();
    expect(screen.getByText(/add schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/add data set/i)).toBeInTheDocument();
  });
});
