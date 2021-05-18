import React from 'react';
import { useDispatch } from 'react-redux';
import { useParams, useHistory } from 'react-router-dom';
import { Input } from '@cognite/cogs.js';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';
import { Flex, IconButton } from 'components/Common';
import { createNewWorkflow } from 'modules/workflows';
import { diagramSelection } from 'routes/paths';

interface FilterBarProps {
  query: string;
  setQuery: (val: string) => void;
  renderLoadMorePanel: () => React.ReactNode;
}
export default function FilterBar({
  query,
  setQuery,
  renderLoadMorePanel,
}: FilterBarProps) {
  const { tenant } = useParams<{ tenant: string }>();
  const history = useHistory();
  const dispatch = useDispatch();

  const onContextualizeNew = () => {
    trackUsage(PNID_METRICS.contextualization.start);
    const newWorkflowId = Number(new Date());
    dispatch(createNewWorkflow(newWorkflowId));
    history.push(diagramSelection.path(tenant, String(newWorkflowId)));
  };

  return (
    <Flex row style={{ margin: '20px 0', justifyContent: 'space-between' }}>
      <Flex row>
        <Input
          placeholder="Filter by name..."
          onChange={(e) => setQuery(e.currentTarget.value)}
          value={query}
          style={{ marginRight: '10px' }}
        />
        {renderLoadMorePanel()}
      </Flex>
      <IconButton type="primary" icon="Document" onClick={onContextualizeNew}>
        Contextualize new files
      </IconButton>
    </Flex>
  );
}
