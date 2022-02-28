import { Body, Icon } from '@cognite/cogs.js';
import IconContainer from 'components/icons';
import { ResourceType } from 'types/core';
import { mapResourceTypeToIcon } from 'utils/resourceTypes';

import { SearchResultContainer, SearchResultDetails } from './elements';

export type SearchResultProps = {
  type: ResourceType;
  name?: string;
  description?: string;
  onClick?: () => void;
};

const SearchResult = ({
  type,
  name,
  description,
  onClick,
}: SearchResultProps) => {
  return (
    <SearchResultContainer onClick={onClick}>
      <IconContainer
        type={mapResourceTypeToIcon(type)}
        className="search-result--icon"
      />
      <SearchResultDetails>
        <Body level={2} strong>
          {name}
        </Body>
        {description}
      </SearchResultDetails>
    </SearchResultContainer>
  );
};

export default SearchResult;
