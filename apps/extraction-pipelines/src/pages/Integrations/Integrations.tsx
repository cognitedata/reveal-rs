import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';
import ExtractorDownloadsLink from '../../components/links/ExtractorDownloadsLink';
import OverviewTab from '../../components/tabs/OverviewTab';
import { HeadingWithUnderline } from '../../styles/StyledHeadings';

const IntegrationsTitle = styled((props) => (
  <HeadingWithUnderline {...props}>{props.children}</HeadingWithUnderline>
))`
  font-size: 1.5rem;
`;
const LinkWrapper = styled.div`
  grid-area: links;
  display: flex;
  justify-content: flex-end;
  margin: 1.5rem 0;
  a {
    align-self: center;
    margin-right: 2rem;
  }
`;

const Wrapper = styled.div`
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

export const LEARNING_AND_RESOURCES_URL: Readonly<string> =
  'https://docs.cognite.com/cdf/integration/';

interface OwnProps {}

type Props = OwnProps;

const Integrations: FunctionComponent<Props> = () => {
  return (
    <Wrapper>
      <IntegrationsTitle level={1}>Integrations</IntegrationsTitle>
      <LinkWrapper>
        <ExtractorDownloadsLink
          linkText="Download Extractors"
          link={{ path: '/extractors' }}
        />
        <ExtractorDownloadsLink
          linkText="Learning and resources"
          link={{ url: LEARNING_AND_RESOURCES_URL }}
        />
      </LinkWrapper>
      <OverviewTab />
    </Wrapper>
  );
};
export default Integrations;
