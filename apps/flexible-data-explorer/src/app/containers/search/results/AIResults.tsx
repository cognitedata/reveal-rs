import { useEffect, useState } from 'react';

import styled from 'styled-components';

import {
  addFromCopilotEventListener,
  sendToCopilotEvent,
  useFromCopilotEventHandler,
} from '@fusion/copilot-core';

import { Icon } from '@cognite/cogs.js';
import { useFlag } from '@cognite/react-feature-flags';

import { useDataModelParams } from '../../../hooks/useDataModelParams';
import {
  useSearchFilterParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';
import { useAIDataTypesQuery } from '../../../services/dataTypes/queries/useAIDataTypesQuery';

export const AIResults = () => {
  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();
  const selectedDataModel = useDataModelParams();

  const [gqlQuery, setGQLQuery] = useState('');
  const [variables, setVariables] = useState({});
  const [isAILoading, setIsAILoading] = useState(false);

  const { data, isLoading } = useAIDataTypesQuery(gqlQuery, variables);

  const { isEnabled: isCopilotEnabled } = useFlag('COGNITE_COPILOT', {
    fallback: false,
  });

  useFromCopilotEventHandler(
    'GQL_QUERY',
    ({ query: newGqlQuery, variables: newVariables }) => {
      setGQLQuery(newGqlQuery);
      setVariables(newVariables);
      setIsAILoading(false);
    }
  );

  useEffect(() => {
    const sendMessage = () => {
      sendToCopilotEvent('NEW_MESSAGES', [
        {
          source: 'bot',
          type: 'data-model',
          ...selectedDataModel,
          content: 'I am looking at data in this data model',
        },
        {
          source: 'user',
          content: `I would like to search for data in my data model: "${query}" with this filter: \`\`\`${JSON.stringify(
            filters
          )} \`\`\``,
          type: 'text',
          context: 'Searched in Explorer',
        },
      ]);
      setIsAILoading(true);
    };
    if (query && selectedDataModel && isCopilotEnabled) {
      sendMessage();
    }
    const removeHandler = addFromCopilotEventListener('CHAT_READY', () => {
      if (query && selectedDataModel) {
        sendMessage();
      }
      removeHandler();
    });
  }, [query, filters, selectedDataModel, isCopilotEnabled]);

  if (!isCopilotEnabled) {
    return <></>;
  }

  if (isLoading || isAILoading) {
    return (
      <Wrapper>
        <Icon type="Loader" />
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <h2>AI Results:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  padding: 16px;
  background: mediumpurple;
  margin-bottom: 50px;
`;
