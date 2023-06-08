import React from 'react';

import styled from 'styled-components';

import { IconButton } from '@interactive-diagrams-app/components/Common';
import { useWorkflowCreateNew } from '@interactive-diagrams-app/modules/workflows';
import {
  PNID_METRICS,
  trackUsage,
} from '@interactive-diagrams-app/utils/Metrics';

import { Illustrations, Title } from '@cognite/cogs.js';

const Wrapper = styled.div`
  width: 100%;
  height: 50vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

export default function FilesListEmpty() {
  const { createWorkflow } = useWorkflowCreateNew();

  const onContextualizeNew = () => {
    trackUsage(PNID_METRICS.landingPage.startNew);
    createWorkflow();
  };

  return (
    <div>
      <Title level={4}>Pending interactive diagrams</Title>
      <Wrapper>
        <Illustrations.Solo type="PAndIdDiagram" />
        <Title level={5} style={{ margin: '24px 0' }}>
          No pending interactive diagrams to review!
        </Title>
        <IconButton
          aria-label="Icon-Button"
          type="primary"
          icon="Document"
          onClick={onContextualizeNew}
        >
          Create new interactive diagrams
        </IconButton>
      </Wrapper>
    </div>
  );
}
