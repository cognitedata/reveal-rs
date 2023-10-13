import { Link, useParams, useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import { createLink } from '@cognite/cdf-utilities';
import { Flex } from '@cognite/cogs.js';

import { useTranslation } from '../../common';
import { SOURCE_TABLE_QUERY_KEY } from '../../common/constants';
import { CreatePipelineButton } from '../../components/create-pipeline-button/CreatePipelineButton';
import NoAccessPage from '../../components/error-pages/NoAccess';
import UnknownErrorPage from '../../components/error-pages/UnknownError';
import NoWrapButton from '../../components/no-wrap-button';
import PipelineList from '../../components/pipeline-list';
import SearchInput from '../../components/search-input';
import Title from '../../components/title';
import { useEMPipelines } from '../../hooks/entity-matching-pipelines';

export default function RootList() {
  const { t } = useTranslation();
  const { subAppPath } = useParams<{
    subAppPath: string;
  }>();
  const [searchParams, setSearchParams] = useSearchParams('');
  const { error } = useEMPipelines();

  if (error) {
    if (error?.status === 403) {
      return (
        <ListWrapper>
          <Title
            title={t('entity-matching-pipelines')}
            dataTestId="home-title"
          />
          <NoAccessPage />
        </ListWrapper>
      );
    }
    return <UnknownErrorPage error={error} />;
  }

  return (
    <ListWrapper>
      <Title title={t('entity-matching-pipelines')} dataTestId="home-title" />
      <TopRow
        gap={22}
        alignItems="center"
        justifyContent="space-between"
        data-testid="top-row"
      >
        <SearchInput
          placeholder={t('filter-placeholder')}
          onChange={(e) => {
            searchParams.set(SOURCE_TABLE_QUERY_KEY, e.target.value);
            setSearchParams(searchParams);
          }}
          value={searchParams.get(SOURCE_TABLE_QUERY_KEY) || ''}
        />
        <Flex gap={12}>
          <Link
            to={createLink(`/${subAppPath}/quick-match/create/select-sources`)}
            data-testid="quick-match-button"
          >
            <NoWrapButton type="primary" icon="GanttChart">
              {t('quick-match')}
            </NoWrapButton>
          </Link>
          <CreatePipelineButton dataTestId="create-pipeline-button" />
        </Flex>
      </TopRow>
      <PipelineList />
    </ListWrapper>
  );
}

const TopRow = styled(Flex)`
  margin-top: 40px;
`;

const ListWrapper = styled(Flex).attrs({ direction: 'column' })`
  padding: 24px 40px;
`;
