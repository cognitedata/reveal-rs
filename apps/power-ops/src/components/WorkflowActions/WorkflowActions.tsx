import { Button } from '@cognite/cogs.js';
import { useHistory, useRouteMatch } from 'react-router-dom';

export const WorkflowActions = ({
  eventExternalId,
}: {
  eventExternalId: string;
}) => {
  const match = useRouteMatch();
  const history = useHistory();

  const handleRowClick = () => {
    if (match.path.split('/', -1).slice(-1)[0] === 'workflows')
      history.push(`${match.path}/${eventExternalId}`);
  };

  return (
    <Button size="small" type="secondary" onClick={() => handleRowClick()}>
      View more
    </Button>
  );
};
