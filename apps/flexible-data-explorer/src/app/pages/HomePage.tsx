import styled from 'styled-components';

import { Flex } from '@cognite/cogs.js';

import { DataExplorerLink } from '../components/links/DataExplorerLink';
import { Categories } from '../containers/category/Categories';
import { Page } from '../containers/page/Page';
import { SearchBar } from '../containers/search/SearchBar';
import { SearchConfiguration } from '../containers/search/SearchConfiguration';

const SEARCH_BAR_OPTIONS = {
  filterMenuMaxHeight: '25vh',
};

export const HomePage = () => {
  return (
    <Page disableScrollbarGutter>
      <SearchContainer>
        <Flex
          direction="column"
          justifyContent="center"
          className="search-bar-container"
          alignItems="center"
        >
          <SearchConfiguration header />

          <SearchBarContainer>
            <SearchBar width="774px" options={SEARCH_BAR_OPTIONS} />
            {/* Hide this for now. until we have flags */}
            {/* <SearchBarSwitch /> */}
          </SearchBarContainer>

          <DataExplorerLink />
        </Flex>
      </SearchContainer>

      <Page.Body>
        <Categories />
      </Page.Body>
    </Page>
  );
};

const SearchContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 60vh;

  box-sizing: border-box;

  background: radial-gradient(
      62.29% 135.84% at 0% 0%,
      rgba(10, 119, 247, 0.1024) 0%,
      rgba(10, 119, 246, 0) 100%
    ),
    radial-gradient(
      40.38% 111.35% at 76.81% 40.18%,
      rgba(84, 108, 241, 0.16) 0%,
      rgba(84, 108, 241, 0) 100%
    ),
    #ffffff;

  border-bottom: 1px solid rgba(83, 88, 127, 0.16);
`;

const SearchBarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;
