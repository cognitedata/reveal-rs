import React, { FunctionComponent, useEffect } from 'react';
import { FullPageLayout } from 'components/layout/FullPageLayout';
import { trackUsage } from 'utils/Metrics';
import {
  ERROR_NOT_GET_EXT_PIPE,
  EXTRACTION_PIPELINES,
  OVERVIEW,
} from 'utils/constants';
import { useIntegrations } from 'hooks/useIntegrations';
import NoIntegrations from 'components/error/NoIntegrations';
import { Loader } from '@cognite/cogs.js';
import { ErrorFeedback } from 'components/error/ErrorFeedback';
import ExtractorDownloadsLink from 'components/links/ExtractorDownloadsLink';
import { MainFullWidthGrid } from 'styles/grid/StyledGrid';
import { useAppEnv } from 'hooks/useAppEnv';
import { LinkWrapper } from 'styles/StyledLinks';
import { ExtPipesBreadcrumbs } from 'components/navigation/breadcrumbs/ExtPipesBreadcrumbs';
import { CapabilityCheck } from 'components/accessCheck/CapabilityCheck';
import { EXTPIPES_READS, EXTPIPES_WRITES } from 'model/AclAction';
import ITable from 'components/table/ITable';
import { integrationTableColumns } from 'components/table/IntegrationTableCol';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';

export const LEARNING_AND_RESOURCES_URL: Readonly<string> =
  'https://docs.cognite.com/cdf/integration/guides/interfaces/about_integrations.html';

interface OwnProps {}

type Props = OwnProps;

const Integrations: FunctionComponent<Props> = () => {
  const { project } = useAppEnv();
  useEffect(() => {
    trackUsage(OVERVIEW, { tenant: project });
  }, [project]);
  const {
    data,
    isLoading,
    error: errorIntegrations,
    refetch,
  } = useIntegrations();
  const permissions = useOneOfPermissions(EXTPIPES_WRITES);
  const canEdit = permissions.data;
  if (data && data.length === 0) {
    return (
      <MainFullWidthGrid>
        <NoIntegrations />
      </MainFullWidthGrid>
    );
  }
  if (isLoading) {
    return <Loader />;
  }
  const handleErrorDialogClick = async () => {
    await refetch();
  };

  if (errorIntegrations) {
    return (
      <MainFullWidthGrid>
        <ErrorFeedback
          btnText="Retry"
          onClick={handleErrorDialogClick}
          fallbackTitle={ERROR_NOT_GET_EXT_PIPE}
          contentText="Please try again later."
          error={errorIntegrations}
        />
      </MainFullWidthGrid>
    );
  }

  return (
    <ITable canEdit={canEdit} columns={integrationTableColumns} data={data!} />
  );
};

export default function CombinedComponent() {
  return (
    <FullPageLayout
      pageHeadingText={EXTRACTION_PIPELINES}
      headingSide={
        <LinkWrapper>
          <ExtractorDownloadsLink
            linkText="Download Extractors"
            link={{ path: '/extractors' }}
          />
          <ExtractorDownloadsLink
            linkText="Learning and resources"
            link={{ url: LEARNING_AND_RESOURCES_URL }}
          />
        </LinkWrapper>
      }
      breadcrumbs={<ExtPipesBreadcrumbs />}
    >
      <CapabilityCheck requiredPermissions={EXTPIPES_READS}>
        <Integrations />
      </CapabilityCheck>
    </FullPageLayout>
  );
}
