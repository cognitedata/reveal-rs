import React from 'react';

import { SecondaryTopbar } from '@cognite/cdf-utilities';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

const SECONDARY_TOPBAR_HEIGHT = 56;
const FOOTER_HEIGHT = 53;

type PageProps = {
  children: React.ReactNode;
  footer?: React.ReactNode;
  subtitle?: string;
  title: string;
};

const Page = ({
  children,
  footer,
  subtitle,
  title,
}: PageProps): JSX.Element => {
  return (
    <Container>
      <SecondaryTopbar subtitle={subtitle} title={title} />
      <Content $hasFooter={!!footer}>{children}</Content>
      {footer && <Footer>{footer}</Footer>}
    </Container>
  );
};

const Container = styled.div`
  height: 100%;
`;

const Content = styled.div<{ $hasFooter?: boolean }>`
  border-top: 1px solid ${Colors['border--interactive--default']};
  height: calc(
    100% -
      ${({ $hasFooter }) =>
        $hasFooter
          ? FOOTER_HEIGHT + SECONDARY_TOPBAR_HEIGHT
          : SECONDARY_TOPBAR_HEIGHT}px
  );
  padding: 24px;
  overflow-y: auto;
`;

const Footer = styled.div`
  height: 53px;
`;

export default Page;
