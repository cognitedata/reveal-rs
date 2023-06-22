import React from 'react';

import styled from 'styled-components';

import { useTranslation } from '@raw-explorer/common/i18n';
import Tooltip from '@raw-explorer/components/Tooltip/Tooltip';
import moment from 'moment';

import { Body, Colors, Detail, Flex, Icon } from '@cognite/cogs.js';

type TableLastUpdatedTimeProps = {
  isTableLastUpdatedTimeFetched?: boolean;
  tableLastUpdatedTime?: Date;
};

const TableLastUpdatedTime = ({
  isTableLastUpdatedTimeFetched,
  tableLastUpdatedTime,
}: TableLastUpdatedTimeProps): JSX.Element => {
  const { t } = useTranslation();

  if (!isTableLastUpdatedTimeFetched) {
    <StyledLastUpdatedTimeLoaderIcon type="Loader" />;
  }

  if (!tableLastUpdatedTime) {
    return <></>;
  }

  return (
    <Wrapper alignItems="center" direction="column">
      <Tooltip
        content={moment(tableLastUpdatedTime).format(
          'DD/MM/YYYY hh:mm:ss A (Z)'
        )}
        delay={[300, 0]}
      >
        <StyledLastUpdatedTimeBody
          level={2}
          strong
          style={{ display: 'flex', alignItems: 'center' }}
        >
          {t('spreadsheet-table-last-updated-time', {
            time: moment(tableLastUpdatedTime).format('DD/MM/YYYY'),
          })}
        </StyledLastUpdatedTimeBody>
      </Tooltip>
      <Detail className="detail--last-update-info" strong>
        {t('spreadsheet-table-last-updated-time-note')}
      </Detail>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  white-space: nowrap;
  margin-top: 18px;
  .detail--last-update-info {
    color: ${Colors['text-icon--muted']};
  }
`;

const StyledLastUpdatedTimeBody = styled(Body)`
  white-space: nowrap;
`;

const StyledLastUpdatedTimeLoaderIcon = styled(Icon)`
  color: ${Colors['text-icon--muted']};
  margin: 0 5px;
`;

export default TableLastUpdatedTime;
