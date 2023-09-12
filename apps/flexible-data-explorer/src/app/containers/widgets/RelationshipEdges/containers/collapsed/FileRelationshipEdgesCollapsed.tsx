import { useMemo, useState } from 'react';

import capitalize from 'lodash/capitalize';
import empty from 'lodash/isEmpty';
import { matchSorter } from 'match-sorter';

import { Button } from '../../../../../components/buttons/Button';
import { SearchInput } from '../../../../../components/input/SearchInput';
import { SearchResults } from '../../../../../components/search/SearchResults';
import { Widget } from '../../../../../components/widget/Widget';
import { useNavigation } from '../../../../../hooks/useNavigation';
import { useInstanceDirectRelationshipQuery } from '../../../../../services/instances/generic/queries/useInstanceDirectRelationshipQuery';
import { InstancePreview } from '../../../../preview/InstancePreview';
import { RelationshipEdgesProps } from '../../RelationshipEdgesWidget';

export const FileRelationshipEdgesCollapsed: React.FC<
  RelationshipEdgesProps
> = ({ id, onExpandClick, rows, columns, type }) => {
  const navigate = useNavigation();
  const { data, status, isFetched } = useInstanceDirectRelationshipQuery(type);

  const [query, setQuery] = useState('');

  const isDisabled = isFetched && empty(data);
  const isEmpty = isFetched && empty(data);

  const results = useMemo(() => {
    return matchSorter(data || [], query, { keys: ['externalId'] });
  }, [data, query]);

  return (
    <Widget rows={rows || 4} columns={columns} id={id}>
      <Widget.Header type="File" title={capitalize(id)}>
        {!isEmpty && <SearchInput query={query} onChange={setQuery} />}

        <Button.Fullscreen
          onClick={() => onExpandClick?.(id)}
          disabled={isDisabled}
        />
      </Widget.Header>

      <Widget.Body state={isEmpty ? 'empty' : status} noPadding>
        <SearchResults.Body noShadow>
          {(results || [])?.map((item: any) => {
            return (
              <InstancePreview.File
                key={item.externalId}
                id={item.externalId}
                disabled={isDisabled}
              >
                <SearchResults.Item
                  key={item.externalId}
                  name={item.name || item.externalId}
                  onClick={() => {
                    navigate.toFilePage(item.externalId);
                  }}
                />
              </InstancePreview.File>
            );
          })}
        </SearchResults.Body>
      </Widget.Body>
    </Widget>
  );
};
