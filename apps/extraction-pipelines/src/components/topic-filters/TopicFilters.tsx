import React, { useState } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@extraction-pipelines/common';
import { CreateJobsModal } from '@extraction-pipelines/components/create-jobs-modal/CreateJobsModal';
import Section from '@extraction-pipelines/components/section';
import { MQTTSourceWithJobMetrics } from '@extraction-pipelines/hooks/hostedExtractors';

import { Body, Button, Flex, Icon, Title } from '@cognite/cogs.js';

import { TopicFilter } from './TopicFilter';

type TopicFiltersProps = {
  className?: string;
  source: MQTTSourceWithJobMetrics;
};

export const TopicFilters = ({
  className,
  source,
}: TopicFiltersProps): JSX.Element => {
  const { t } = useTranslation();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <Section
      className={className}
      extra={
        source.jobs.length !== 0 && (
          <Button
            size="small"
            onClick={() => setIsCreateModalOpen(true)}
            type="ghost"
          >
            {t('add-topic-filters')}
          </Button>
        )
      }
      icon="List"
      title={t('topic-filter', { count: 2 })}
    >
      {isCreateModalOpen && (
        <CreateJobsModal
          onCancel={() => setIsCreateModalOpen(false)}
          source={source}
          visible={isCreateModalOpen}
        />
      )}
      <Content>
        {source.jobs.length ? (
          source.jobs.map((job) => (
            <TopicFilter key={job.externalId} job={job} />
          ))
        ) : (
          <EmptyContent>
            <Flex alignItems="center" direction="column" gap={8}>
              <Icon size={24} type="ListSearch" />
              <Flex alignItems="center" direction="column" gap={2}>
                <Title level={5}>{t('no-topic-filters')}</Title>
                <Body level={2} muted>
                  {t('add-topic-filters-to-get-data-in')}
                </Body>
              </Flex>
            </Flex>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              icon="AddLarge"
              type="primary"
            >
              {t('add-topic-filters')}
            </Button>
          </EmptyContent>
        )}
      </Content>
    </Section>
  );
};

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const EmptyContent = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: center;
  gap: 24px;
  flex-direction: column;
  padding: 16px;
`;
