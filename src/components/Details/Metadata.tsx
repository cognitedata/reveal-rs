import React, { useState, useMemo } from 'react';

import { Checkbox, Input, Table } from '@cognite/cogs.js';
import styled from 'styled-components';

export function Metadata({ metadata }: { metadata?: { [k: string]: string } }) {
  const [query, setQuery] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);

  const filteredMetadata = useMemo(
    () =>
      metadata
        ? Object.entries(metadata).filter(([key, value]) => {
            if (hideEmpty && !value) {
              return false;
            }
            return (
              query.length === 0 ||
              key.toLowerCase().includes(query.toLowerCase()) ||
              value.toLowerCase().includes(query.toLowerCase())
            );
          })
        : [],
    [metadata, query, hideEmpty]
  );
  if (!metadata || Object.keys(metadata).length === 0) {
    return null;
  }
  return (
    <>
      <MetadataHeader>
        <h3>Metadata</h3>
        <FilterContainer>
          <InputWrapper>
            <Input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filter metadata"
              clearable={{ callback: () => setQuery('') }}
            />
          </InputWrapper>
          <Checkbox
            name="hideEmpty"
            value={hideEmpty}
            onChange={(nextState: boolean) => setHideEmpty(nextState)}
          >
            Hide empty
          </Checkbox>
        </FilterContainer>
      </MetadataHeader>
      <MetadataTableContainer>
        <Table
          dataSource={filteredMetadata.map(item => ({
            key: item[0],
            id: item[0],
            value: item[1],
          }))}
          columns={[
            {
              Header: 'Key',
              key: 'key',
              accessor: 'key',
              width: '50%',
            },
            {
              Header: 'Value',
              accessor: 'value',
              key: 'value',
              width: '50%',
            },
          ]}
          pagination={false}
        />
      </MetadataTableContainer>
    </>
  );
}

const MetadataHeader = styled.div`
  padding: 0 16px;
`;

const MetadataTableContainer = styled.div`
  margin: 8px 16px 0;
  max-width: 900px;
  .metadata-table-row {
    background-color: var(--cogs-white);
  }
`;

const FilterContainer = styled.div`
  display: flex;
  margin-bottom: 16px;
  margin-right: 15px;
`;

const InputWrapper = styled.div`
  max-width: 300px;
  margin-right: 16px;
`;
