import { Body } from '@cognite/cogs.js';
import { useNavigation } from 'hooks/useNavigation';
import React from 'react';
import styled from 'styled-components';

const BreadcrumbText = styled(Body).attrs({ level: 2 })`
  cursor: pointer;
`;

const Container = styled.div`
  width: 100%;
  min-height: 3rem;
  background-color: var(--cogs-greyscale-grey1);
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  display: flex;
  align-items: center;
  padding: 0 2.5rem;
  gap: 0.5rem;
`;

interface Props {
  breadcrumbs?: { title: string; onClick?: () => void }[];
}
export const Breadcrumb: React.FC<Props> = ({ breadcrumbs }) => {
  const { toHome } = useNavigation();

  return (
    <Container>
      <BreadcrumbText
        strong={!breadcrumbs}
        onClick={() => {
          toHome();
        }}
      >
        Document Classifiers - Version: 1.0
      </BreadcrumbText>
      {breadcrumbs?.map((item, index) => (
        <React.Fragment key={item.title}>
          <BreadcrumbText>/</BreadcrumbText>
          <BreadcrumbText
            strong={breadcrumbs.length === index + 1}
            onClick={() => {
              if (item.onClick) item.onClick();
            }}
          >
            {item.title}
          </BreadcrumbText>
        </React.Fragment>
      ))}
    </Container>
  );
};
