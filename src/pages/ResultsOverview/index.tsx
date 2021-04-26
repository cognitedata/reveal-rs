import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Icon, Tooltip, Title } from '@cognite/cogs.js';
import { message } from 'antd';
import { FileInfo } from '@cognite/sdk';
import {
  useWorkflowItems,
  loadWorkflow,
  useWorkflowLoadPercentages,
} from 'modules/workflows';
import { checkPermission } from 'modules/app';
import {
  startConvertFileToSvgJob,
  UploadJobState,
} from 'modules/contextualization/uploadJobs';
import { startPnidParsingWorkflow } from 'modules/contextualization/pnidWorkflow';
import { ParsingJobState } from 'modules/contextualization/parsingJobs';
import { useAnnotationsForFiles, useActiveWorkflow } from 'hooks';
import LoadResources from 'containers/LoadResources';
import MissingPermissionFeedback from 'components/MissingPermissionFeedback';
import { Flex } from 'components/Common';
import { canDeploySelectedFiles } from 'utils/FilesUtils';
import { resourceSelection } from 'routes/paths';
import { getWorkflowItems, getContextualizationJobs } from './selectors';
import ResultsTable from './ResultsTable';

export default function ResultsOverview() {
  const history = useHistory();
  const dispatch = useDispatch();
  const { tenant } = useParams<{ tenant: string }>();

  const [selectedKeys, setSelectedKeys] = useState([] as number[]);
  const [renderFeedback, setRenderFeedback] = useState(false);
  const [jobRunning, setJobRunning] = useState(false);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  const getCanEditFiles = useMemo(
    () => checkPermission('filesAcl', 'WRITE'),
    []
  );
  const getCanReadFiles = useMemo(
    () => checkPermission('filesAcl', 'READ'),
    []
  );
  const { workflowId } = useActiveWorkflow();
  const { diagrams, resources } = useWorkflowItems(workflowId, true);
  const { loaded: diagramsLoaded } = useWorkflowLoadPercentages(
    Number(workflowId),
    'diagrams'
  );
  const { loaded: assetsLoaded } = useWorkflowLoadPercentages(
    Number(workflowId),
    'assets'
  );
  const { workflow } = useSelector(getWorkflowItems(workflowId));
  const canEditFiles = useSelector(getCanEditFiles);
  const canReadFiles = useSelector(getCanReadFiles);
  const { parsingJobs, uploadJobs } = useSelector(getContextualizationJobs);
  const annotationsByFileId = useAnnotationsForFiles(selectedKeys);

  const isLoading = Object.values(uploadJobs).some((job: any) => !job.jobDone);

  const startWorkflow = () => {
    if (!jobRunning) {
      if (diagramsLoaded && assetsLoaded) {
        setJobRunning(true);
        dispatch(
          startPnidParsingWorkflow.action({ workflowId, diagrams, resources })
        );
      } else if (!workflowLoading) {
        dispatch(loadWorkflow({ workflowId }));
        setWorkflowLoading(true);
      }
    }
  };

  useEffect(() => {
    if (canEditFiles && canReadFiles) startWorkflow();
    else setRenderFeedback(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEditFiles, canReadFiles, diagrams, resources]);

  useEffect(() => {
    if (!workflow) {
      message.error('Invalid Data Selections...');
      history.push(resourceSelection.path(tenant, String(workflowId)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflow]);

  const startUploadJob = () => {
    if (canEditFiles) {
      selectedKeys.forEach((key) => {
        if (annotationsByFileId[key]) {
          dispatch(startConvertFileToSvgJob(key, annotationsByFileId[key]));
        } else {
          const diagramToConvert = diagrams.find(
            (diagram: FileInfo) => diagram.id === key
          );
          if (diagramToConvert) {
            message.error(`${diagramToConvert.name} has no annotations`);
          } else {
            message.error(`we are still loading file ${key}`);
          }
        }
      });
    } else {
      setRenderFeedback(true);
    }
  };

  const rows = diagrams
    .filter((diagram: FileInfo) => !!diagram)
    .map((diagram: FileInfo) => {
      return {
        ...diagram,
        parsingJob: parsingJobs[diagram.id],
        uploadJob: uploadJobs[diagram.id],
      } as FileInfo & {
        parsingJob?: ParsingJobState;
        uploadJob?: UploadJobState;
      };
    });

  return renderFeedback ? (
    <>
      <MissingPermissionFeedback key="eventsAcl" acl="eventsAcl" type="WRITE" />
      <MissingPermissionFeedback key="filesAcl" acl="filesAcl" type="WRITE" />
    </>
  ) : (
    <Flex column>
      <Flex align style={{ width: '100%', justifyContent: 'space-between' }}>
        <Title level={2}>Review the contextualized P&IDs</Title>
        <Flex align style={{ justifyContent: 'flex-end' }}>
          <Tooltip
            placement="left"
            content="This will create or update an interactive SVG linked to the assets for the selected files."
          >
            <Icon
              type="Help"
              style={{
                marginRight: '24px',
                fontSize: '18px',
                display: 'inline-block',
              }}
            />
          </Tooltip>
          <Button
            type="primary"
            disabled={!canDeploySelectedFiles(rows, selectedKeys)}
            title={
              !canDeploySelectedFiles(rows, selectedKeys) &&
              selectedKeys.length !== 0
                ? 'Not all selected files can be deployed to CDF. This might be caused by them still being in "Pending" state or the parsing job failed. Please check if all selected files finished parsing with success.'
                : ''
            }
            onClick={startUploadJob}
            loading={isLoading}
          >
            {`Deploy ${selectedKeys.length} files to CDF`}
          </Button>
        </Flex>
      </Flex>
      <Flex
        grow
        style={{
          width: '100%',
          margin: '12px 0',
        }}
      >
        <LoadResources />
      </Flex>
      <Flex grow style={{ width: '100%', margin: '12px 0' }}>
        <ResultsTable
          rows={rows}
          selectedKeys={selectedKeys}
          setSelectedKeys={setSelectedKeys}
          setRenderFeedback={setRenderFeedback}
        />
      </Flex>
    </Flex>
  );
}
