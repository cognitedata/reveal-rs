import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { message } from 'antd';
import { Tooltip } from '@cognite/cogs.js';
import { getUrlWithQueryParams } from '@interactive-diagrams-app/utils/config';
import { diagramPreview } from '@interactive-diagrams-app/routes/paths';
import { MenuSingle } from '@interactive-diagrams-app/containers';
import {
  Flex,
  IconButton,
  Dropdown,
} from '@interactive-diagrams-app/components/Common';
import { useParsingJob, useJobStatus } from '@interactive-diagrams-app/hooks';

type Props = { file: any };

export default function ColumnFileActions({ file }: Props): JSX.Element {
  const history = useHistory();

  const { workflowId } = useParams<{ workflowId: string }>();

  const { failedFiles } = useParsingJob();
  const jobStatus = useJobStatus();

  const didFileFail = failedFiles?.find(
    (failedFile) => failedFile.fileId === file?.id
  );

  const jobFinished = jobStatus === 'done';
  const isFileDisabled = !file || Boolean(didFileFail);
  const isButtonDisabled = !jobFinished || Boolean(didFileFail);

  const onTooltipShow = () => {
    if (jobFinished) {
      return false;
    }
    return undefined;
  };

  const onFileViewClick = () => {
    if (file) {
      history.push(
        getUrlWithQueryParams(diagramPreview.path(workflowId, file.id))
      );
    } else {
      message.info('Please wait for the process to finish for this diagram.');
    }
  };

  const viewButtonLabel = () => {
    if (!jobFinished) return 'Please wait for the diagram to finish parsing.';
    if (didFileFail) return 'You cannot preview this diagram';
    return undefined;
  };

  return (
    <Flex row>
      <Tooltip
        placement="bottom-end"
        content={viewButtonLabel()}
        onShow={onTooltipShow}
      >
        <IconButton
          aria-label="Icon-Button"
          icon="EyeShow"
          type="ghost"
          $square
          onClick={onFileViewClick}
          disabled={isButtonDisabled}
          style={{ marginRight: '2px' }}
        />
      </Tooltip>
      <Dropdown
        content={<MenuSingle file={file} />}
        dropdownDisabled={isButtonDisabled}
        buttonDisabled={isButtonDisabled || isFileDisabled}
      />
    </Flex>
  );
}
