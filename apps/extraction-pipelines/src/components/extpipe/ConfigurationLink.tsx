import React, { FunctionComponent, PropsWithoutRef } from 'react';
import { Link } from 'react-router-dom';

import { useExtpipeConfig } from '@extraction-pipelines/hooks/config';
import { useSelectedExtpipe } from '@extraction-pipelines/hooks/useExtpipe';
import { EXT_PIPE_PATH } from '@extraction-pipelines/routing/RoutingConfig';
import { EXTRACTION_PIPELINES_PATH } from '@extraction-pipelines/utils/baseURL';

import { createLink } from '@cognite/cdf-utilities';
import { Colors, Icon } from '@cognite/cogs.js';

type Props = {
  createdTime: number;
};

export const ConfigurationLink: FunctionComponent<Props> = ({
  createdTime,
}: PropsWithoutRef<Props>) => {
  const { data: extpipe } = useSelectedExtpipe();

  const { data, isInitialLoading } = useExtpipeConfig(
    { externalId: extpipe!.externalId, activeAtTime: createdTime },
    { enabled: !!extpipe!.externalId }
  );
  if (isInitialLoading) {
    return (
      <Icon
        type="Loader"
        css={{ color: Colors['decorative--grayscale--600'] }}
      />
    );
  }

  if (data) {
    return (
      <Link
        to={createLink(
          `/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/${extpipe?.id}/config/${data.revision}`
        )}
      >
        {data.revision}
      </Link>
    );
  }

  return null;
};
