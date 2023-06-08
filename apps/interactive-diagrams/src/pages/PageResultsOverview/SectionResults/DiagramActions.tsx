import React from 'react';
import { useHistory } from 'react-router-dom';

import { Dropdown } from '@interactive-diagrams-app/components/Common';
import { MenuAll } from '@interactive-diagrams-app/containers';
import {
  useReviewFiles,
  useActiveWorkflow,
  isFilePending,
} from '@interactive-diagrams-app/hooks';
import {
  useWorkflowDiagramsIds,
  useWorkflowItems,
} from '@interactive-diagrams-app/modules/workflows';
import { diagramPreview } from '@interactive-diagrams-app/routes/paths';
import { Tooltip } from 'antd';
import { getUrlWithQueryParams } from '@interactive-diagrams-app/utils/config';

import { Button } from '@cognite/cogs.js';

import { InfoWrapper } from './components';

export default function DiagramActions() {
  const history = useHistory();
  const { workflowId } = useActiveWorkflow();
  const diagramsIds = useWorkflowDiagramsIds(workflowId, true, true);
  const { diagrams } = useWorkflowItems(Number(workflowId), true);
  const { onApproveDiagrams, isOnApprovedLoading: isLoading } =
    useReviewFiles(diagramsIds);

  const noSuccessfulFiles = !diagramsIds?.length;

  const onPreviewAllClick = () => {
    if (!noSuccessfulFiles)
      history.push(
        getUrlWithQueryParams(diagramPreview.path(workflowId, diagramsIds[0]))
      );
  };

  const isApproveAllDisabled =
    isLoading || !diagrams.some((diagram) => isFilePending(diagram));

  return (
    <InfoWrapper>
      <Tooltip
        title={
          isApproveAllDisabled &&
          'All diagrams are already approved or have no tags to review'
        }
      >
        <Button
          aria-label="Button-Approve-All"
          icon="Checkmark"
          type="tertiary"
          disabled={isApproveAllDisabled || noSuccessfulFiles}
          onClick={() => onApproveDiagrams(true)}
        >
          Approve all
        </Button>
      </Tooltip>
      <Button
        aria-label="Button-Preview-All"
        icon="EyeShow"
        type="primary"
        onClick={onPreviewAllClick}
        disabled={isLoading || noSuccessfulFiles}
      >
        Preview all
      </Button>
      <Dropdown content={<MenuAll canRejectAll={!isApproveAllDisabled} />} />
    </InfoWrapper>
  );
}
