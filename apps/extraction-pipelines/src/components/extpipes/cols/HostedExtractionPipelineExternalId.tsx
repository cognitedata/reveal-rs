import React from 'react';

import { createLink } from '@cognite/cdf-utilities';
import { Body } from '@cognite/cogs.js';

import { HOSTED_EXTRACTION_PIPELINE_PATH } from '@extraction-pipelines/routing/RoutingConfig';
import { EXTRACTION_PIPELINES_PATH } from '@extraction-pipelines/utils/baseURL';
import Link from '@extraction-pipelines/components/links/Link';

type HostedExtractionPipelineExternalIdProps = {
  externalId: string;
};

const HostedExtractionPipelineExternalId = ({
  externalId,
}: HostedExtractionPipelineExternalIdProps): JSX.Element => {
  return (
    <Body level={2} strong>
      <Link
        to={createLink(
          `/${EXTRACTION_PIPELINES_PATH}/${HOSTED_EXTRACTION_PIPELINE_PATH}/${externalId}`
        )}
      >
        {externalId}
      </Link>
    </Body>
  );
};

export default HostedExtractionPipelineExternalId;
