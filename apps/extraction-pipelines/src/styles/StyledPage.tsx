import styled from 'styled-components';
import { Colors, Title } from '@cognite/cogs.js';
import React from 'react';
import { StyledRouterLink } from '../components/integrations/cols/Name';
import { PageTitle } from './StyledHeadings';
import { MainPanelGrid } from './grid/StyledGrid';

export const PageWrapper = styled.div`
  flex: 1;
  height: 100%;
  background-color: ${Colors.white.hex()};
  display: grid;
  grid-template-areas:
    'title links'
    'main main';
  grid-template-rows: min-content;
  h1 {
    grid-area: title;
    margin: 1.5rem 0 1.5rem 2rem;
    align-self: center;
  }
`;

export const CreateIntegrationPageWrapper = styled.div`
  display: grid;
  grid-template-areas:
    'breadcrumbs breadcrumbs'
    'title1 links'
    'main main';
  h1 {
    margin: 0.5rem 0 1.5rem 2rem;
  }
`;
export const GridBreadCrumbsWrapper = styled(StyledRouterLink)`
  grid-area: breadcrumbs;
  margin: 0.5rem 0 0 2rem;
`;
export const BackWrapper = styled(StyledRouterLink)`
  grid-area: back;
  display: flex;
  align-items: center;
  text-decoration: underline;
`;
export const GridTitleWrapper = styled(PageTitle)`
  grid-area: title1;
`;

export const GridH2Wrapper = styled((props) => (
  <Title {...props} level={2}>
    {props.children}
  </Title>
))`
  font-size: 1.2rem;
  margin-bottom: 0.3rem;
`;

export const GridMainWrapper = styled(MainPanelGrid)`
  grid-area: main;
  display: grid;
  grid-template-columns: auto 70% auto;
  grid-template-rows: min-content min-content min-content auto;
  grid-row-gap: 1rem;
  grid-template-areas:
    '. back .'
    '. title .'
    '. description .'
    '. form .';
  overflow-y: auto;
  height: calc(100vh - 16.375rem);
  form {
    grid-area: form;
  }
  h2 {
    grid-area: title;
  }
  .description {
    grid-area: description;
  }
`;
