import React, { useState } from 'react';

import {
  EmptyState,
  ResourceTableColumns,
  Table,
} from '@data-exploration/components';
import {
  FileGroupingTable,
  FileViewSwitcher,
  ResultCount,
} from '@data-exploration/containers';
import {
  useRelatedResourceResults,
  useRelationshipCount,
} from '@data-exploration-components/hooks';
import { ColumnDef } from '@tanstack/react-table';

import { FileWithRelationshipLabels } from '@data-exploration-lib/core';

import {
  GroupingTableContainer,
  GroupingTableHeader,
  FileSwitcherWrapper,
} from '../elements';

import { RelationshipTableProps } from './RelationshipTable';

const {
  relationshipLabels,
  relation,
  name,
  mimeType,
  uploadedTime,
  lastUpdatedTime,
  created,
} = ResourceTableColumns;

const columns = [
  name(),
  relationshipLabels,
  relation,
  mimeType,
  uploadedTime,
  lastUpdatedTime,
  created,
] as ColumnDef<FileWithRelationshipLabels>[];

export function RelationshipFileTable({
  parentResource,
  onItemClicked,
  isGroupingFilesEnabled,
}: Omit<RelationshipTableProps, 'type'>) {
  const [currentView, setCurrentView] = useState<string>(
    isGroupingFilesEnabled ? 'tree' : 'list'
  );

  const { data: count } = useRelationshipCount(parentResource, 'file');

  const { hasNextPage, fetchNextPage, isLoading, items } =
    useRelatedResourceResults<FileWithRelationshipLabels>(
      'relationship',
      'file',
      parentResource,
      isGroupingFilesEnabled ? 1000 : 20
    );

  if (isLoading) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      {currentView === 'tree' && (
        <GroupingTableContainer>
          <GroupingTableHeader>
            <FileViewSwitcher
              currentView={currentView}
              setCurrentView={setCurrentView}
            />
          </GroupingTableHeader>
          <FileGroupingTable
            data={items}
            onItemClicked={(file) => onItemClicked(file.id)}
          />
        </GroupingTableContainer>
      )}
      {currentView === 'list' && (
        <Table
          id="relationship-file-table"
          hideColumnToggle
          columns={columns}
          tableHeaders={
            <>
              <ResultCount api="list" type="file" count={count} />
              <FileSwitcherWrapper>
                {isGroupingFilesEnabled && (
                  <FileViewSwitcher
                    setCurrentView={setCurrentView}
                    currentView={currentView}
                  />
                )}
              </FileSwitcherWrapper>
            </>
          }
          data={items}
          showLoadButton
          fetchMore={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoadingMore={isLoading}
          onRowClick={(row) => onItemClicked(row.id)}
        />
      )}
    </>
  );
}
