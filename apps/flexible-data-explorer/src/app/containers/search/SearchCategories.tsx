import styled, { css } from 'styled-components';

import { Chip } from '@cognite/cogs.js';

import { Typography } from '../../components/Typography';
import { useSearchCategoryParams } from '../../hooks/useParams';
import { useTranslation } from '../../hooks/useTranslation';
import { useFDM } from '../../providers/FDMProvider';
import { formatBigNumbersWithSuffix, formatNumber } from '../../utils/number';

import { useSearchDataTypeSortedByKeys } from './hooks/useSearchDataTypeSortedByKeys';
import { useSearchTotalCount } from './hooks/useSearchTotalCount';

export const SearchCategories = () => {
  const { t } = useTranslation();
  const [searchCategory, setSearchCategory] = useSearchCategoryParams();
  const client = useFDM();

  const {
    counts,
    keys,
    isLoading: isCountsLoading,
  } = useSearchDataTypeSortedByKeys();

  const { totalCount, isLoading: isTotalCountLoading } = useSearchTotalCount();

  const isSelected = (name?: string) => searchCategory === name;

  const handleSelectionClick = (name?: string) => {
    setSearchCategory(name);
  };

  if (isCountsLoading || isTotalCountLoading) {
    return null;
  }

  return (
    <Container>
      <Content
        selected={isSelected(undefined)}
        onClick={() => handleSelectionClick(undefined)}
      >
        <NameText>{t('SEARCH_CATEGORIES_ALL_OPTION')}</NameText>
        <Chip
          size="x-small"
          loading={isTotalCountLoading}
          type={isSelected(undefined) ? 'neutral' : undefined}
          label={formatBigNumbersWithSuffix(totalCount) ?? '?'}
          tooltipProps={{
            content: formatNumber(totalCount),
          }}
        />
      </Content>

      {keys?.map((key, index) => {
        // const dataType = item.name;
        const count = counts?.[key];
        const isDisabled = !count;

        if (key === 'File') {
          return (
            <Content
              key={key}
              selected={isSelected('File')}
              onClick={() => !!count && handleSelectionClick('File')}
              disabled={!count}
            >
              <NameText>File</NameText>
              <Chip
                size="x-small"
                type={isSelected('File') ? 'neutral' : undefined}
                label={formatBigNumbersWithSuffix(count) ?? '?'}
                tooltipProps={{
                  content: formatNumber(count),
                }}
              />
            </Content>
          );
        }

        if (key === 'TimeSeries') {
          return (
            <Content
              key={key}
              selected={isSelected('TimeSeries')}
              onClick={() => !!count && handleSelectionClick('TimeSeries')}
              disabled={!count}
            >
              <NameText>Time series</NameText>
              <Chip
                size="x-small"
                type={isSelected('TimeSeries') ? 'neutral' : undefined}
                label={formatBigNumbersWithSuffix(count) ?? '?'}
                tooltipProps={{
                  content: formatNumber(count),
                }}
              />
            </Content>
          );
        }

        const type = client.getTypesByDataType(key);
        return (
          <Content
            key={`${key}-${index}`}
            selected={isSelected(key)}
            disabled={isDisabled}
            onClick={() => !isDisabled && handleSelectionClick(key)}
          >
            <NameText>{type?.displayName || type?.name}</NameText>
            <CountChip
              size="x-small"
              type={isSelected(key) ? 'neutral' : undefined}
              label={formatBigNumbersWithSuffix(count) ?? '?'}
              tooltipProps={{
                content: formatNumber(count),
              }}
            />
          </Content>
        );
      })}
    </Container>
  );
};

const Container = styled.div`
  max-width: 200px;
  width: 100%;
  position: sticky;
  top: 0;
`;

const Content = styled.div<{ selected?: boolean; disabled?: boolean }>`
  height: 32;
  border-radius: 8px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin-bottom: 4px;
  width: 100%;
  cursor: pointer;
  justify-content: space-between;
  gap: 8px;

  & > * {
    min-width: 0;
  }

  &:hover {
    background: rgba(59, 130, 246, 0.08);
  }

  ${({ selected }) =>
    selected &&
    css`
      background: rgba(59, 130, 246, 0.08);

      & > * {
        color: #3b82f6 !important;
        font-weight: 600;
      }
    `}

  ${({ disabled }) =>
    disabled &&
    css`
      user-select: none;
      cursor: not-allowed;

      & > * {
        opacity: 0.5;
      }
    `}
`;

const NameText = styled(Typography.Body)``;

const CountChip = styled(Chip)`
  && {
    min-width: unset;
    max-width: unset;
    flex-shrink: 0;
  }
`;
