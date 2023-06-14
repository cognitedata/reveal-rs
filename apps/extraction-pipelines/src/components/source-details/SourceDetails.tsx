import React, { useState } from 'react';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from 'common';
import Section from 'components/section';
import { MQTTSourceWithJobMetrics } from 'hooks/hostedExtractors';
import { EditSourceDetailsModal } from 'components/edit-source-details-modal/EditSourceDetailsModal';
import { MQTT_SOURCE_TYPE_LABEL } from 'components/create-source-modal/CreateSourceModal';

type SourceDetailsProps = {
  className?: string;
  source: MQTTSourceWithJobMetrics;
};

export const SourceDetails = ({
  className,
  source,
}: SourceDetailsProps): JSX.Element => {
  const { t } = useTranslation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      {isEditModalOpen && (
        <EditSourceDetailsModal
          onCancel={() => setIsEditModalOpen(false)}
          source={source}
          visible={isEditModalOpen}
        />
      )}
      <Section
        className={className}
        extra={
          <Button
            onClick={() => setIsEditModalOpen(true)}
            size="small"
            type="ghost"
          >
            {t('edit')}
          </Button>
        }
        icon="Info"
        items={[
          {
            key: 'externalId',
            title: t('external-id'),
            value: source.externalId,
          },
          {
            key: 'host',
            title: t('form-host-name'),
            value: source.host,
          },
          {
            key: 'protocol',
            title: t('form-protocol-version'),
            value: MQTT_SOURCE_TYPE_LABEL[source.type],
          },
          { key: 'port', title: t('form-port'), value: source.port },
        ]}
        title={t('details')}
      />
    </>
  );
};
