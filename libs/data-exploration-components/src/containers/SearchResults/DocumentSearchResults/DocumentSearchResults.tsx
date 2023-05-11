import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components/macro';

import {
  SearchResultCountLabel,
  SearchResultToolbar,
} from '@data-exploration-components/containers/SearchResults';
import { DocumentsTable } from '@data-exploration-components/containers/Documents';
import {
  InternalDocument,
  TableSortBy,
  getChatCompletions,
  useDocumentSearchResultWithMatchingLabelsQuery,
} from '@data-exploration-lib/domain-layer';
import { Asset, FileInfo } from '@cognite/sdk';
import { AppliedFiltersTags } from '@data-exploration-components/components/AppliedFiltersTags/AppliedFiltersTags';
import { UploadButton } from '@data-exploration-components/components/Buttons/UploadButton/UploadButton';
import { CLOSE_DROPDOWN_EVENT } from '@data-exploration-components/utils';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { AppContext } from '@data-exploration-lib/core';
import { DocumentUploaderModal } from '@data-exploration-components/containers/Documents/DocumentUploader/DocumentUploaderModal';

import { VerticalDivider } from '@data-exploration-components/components/Divider';
import { useDocumentFilteredAggregateCount } from '@data-exploration-lib/domain-layer';
import { DATA_EXPLORATION_COMPONENT } from '@data-exploration-lib/core';
import { ResourceTypes } from '@data-exploration-components/types';
import {
  InternalDocumentFilter,
  useGetSearchConfigFromLocalStorage,
} from '@data-exploration-lib/core';
import { useSDK } from '@cognite/sdk-provider';

export interface DocumentSearchResultsProps {
  query?: string;
  filter: InternalDocumentFilter;
  onClick: (item: InternalDocument) => void;
  onRootAssetClick?: (rootAsset: Asset, resourceId?: number) => void;
  onFilterChange?: (newValue: Record<string, unknown>) => void;
  onFileClicked?: (file: FileInfo) => boolean;
  selectedRow?: Record<string | number, boolean>;
  isDocumentsGPTEnabled?: boolean;
}

export const DocumentSearchResults = ({
  isDocumentsGPTEnabled,
  query = '',
  filter = {},
  onClick,
  onRootAssetClick,
  selectedRow,
  onFilterChange,
  onFileClicked,
}: DocumentSearchResultsProps) => {
  const [sortBy, setSortBy] = useState<TableSortBy[]>([]);
  const [realQuery, setRealQuery] = useState<string>();
  const [gptColumnName, setGptColumnName] = useState<string>('Summary');
  const context = useContext(AppContext);

  const trackUsage = context?.trackUsage;

  const documentSearchConfig = useGetSearchConfigFromLocalStorage('file');

  const { results, isLoading, fetchNextPage, hasNextPage } =
    useDocumentSearchResultWithMatchingLabelsQuery(
      { filter, query: realQuery, sortBy },
      { keepPreviousData: true },
      documentSearchConfig
    );

  const [modalVisible, setModalVisible] = React.useState<boolean>(false);
  const { data: aggregateCount = 0 } = useDocumentFilteredAggregateCount(
    {
      query,
      filters: filter,
    },
    documentSearchConfig
  );
  const sdk = useSDK();

  useEffect(() => {
    async function retrieveAnswer() {
      if (!query || !query.endsWith('?')) {
        setRealQuery(query);
        setGptColumnName('Summary');
        return;
      }

      const gptContent = `
      Can you split the following user question into 3 parts and give the answer as JSON key-value pairs:
      1. A keyword search prompt to find the relevant documents. 
      2. A GPT prompt that will look for the answer within each document.
      3. A column name with max 3 words describing the results from the GPT prompt.
      
      Return only the answer as a json key-value pair using the keys: keywords, prompt, column_name.

      "${query}"
      `; // Can use this: Ensure the keywords are split by |.

      const choices = await getChatCompletions(
        {
          messages: [
            {
              role: 'system',
              content: 'You are an industrial co-pilot, used by engineers.',
            },
            {
              role: 'user',
              content: gptContent,
            },
          ],
          temperature: 0,
          maxTokens: 500,
        },
        sdk
      );

      const summary = JSON.parse(choices[0].message.content.trim());
      setGptColumnName(summary['column_name']);
      setRealQuery(summary['keywords']);

      if (trackUsage) {
        trackUsage(
          DATA_EXPLORATION_COMPONENT.SEARCH.DOCUMENT_GPT_SEARCH_PROMPT,
          {
            query: query,
            numberOfDocuments: results.length,
            result: { summary },
          }
        );
      }
    }

    if (isDocumentsGPTEnabled) {
      retrieveAnswer();
    }
  }, [query, sdk]);

  const { data: hasEditPermissions } = usePermissions(
    context?.flow! as any,
    'filesAcl',
    'WRITE',
    undefined,
    { enabled: !!context?.flow }
  );

  const resourceType = ResourceTypes.File;

  return (
    <DocumentSearchResultWrapper>
      <DocumentsTable
        id="documents-search-results"
        enableSorting
        selectedRows={selectedRow}
        onSort={setSortBy}
        query={query}
        gptColumnName={gptColumnName}
        isDocumentsGPTEnabled={isDocumentsGPTEnabled}
        tableHeaders={
          <>
            <SearchResultToolbar
              type={resourceType}
              style={{ width: '100%' }}
              showCount={true}
              resultCount={
                <SearchResultCountLabel
                  loadedCount={results.length}
                  totalCount={aggregateCount}
                  resourceType={resourceType}
                />
              }
            />
            <UploadButton
              onClick={() => {
                setModalVisible(true);
                trackUsage &&
                  trackUsage(DATA_EXPLORATION_COMPONENT.CLICK.UPLOAD, {
                    table: resourceType,
                  });
              }}
              disabled={!hasEditPermissions}
            />
            <VerticalDivider />
          </>
        }
        sorting={sortBy}
        tableSubHeaders={
          <AppliedFiltersTags
            filter={filter}
            onFilterChange={onFilterChange}
            icon="Document"
          />
        }
        data={results}
        onRowClick={(document) => {
          if (document !== undefined) {
            onClick(document);
          }
        }}
        onRootAssetClick={onRootAssetClick}
        showLoadButton
        fetchMore={() => {
          fetchNextPage();
        }}
        hasNextPage={hasNextPage}
        isLoadingMore={isLoading}
      />
      {modalVisible && (
        <DocumentUploaderModal
          key="document-uploader-modal"
          visible={modalVisible}
          onFileSelected={(file) => {
            if (onFileClicked) {
              if (!onFileClicked(file)) {
                return;
              }
            }
            setModalVisible(false);
            window.dispatchEvent(new Event(CLOSE_DROPDOWN_EVENT));
          }}
          onCancel={() => setModalVisible(false)}
        />
      )}
    </DocumentSearchResultWrapper>
  );
};

const DocumentSearchResultWrapper = styled.div`
  height: 100%;
`;
