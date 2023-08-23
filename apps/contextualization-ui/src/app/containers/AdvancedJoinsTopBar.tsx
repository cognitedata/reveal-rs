import { useContext } from 'react';

import styled from 'styled-components';

import { TopBar } from '@cognite/cogs.js';

import { TopBarLeft } from '../components/TopBarLeft';
import { TopBarRight } from '../components/TopBarRight';
import { ManualMatchesContext } from '../pages/AdvancedJoinsPage';
import { getDataManagementURL } from '../utils/goBack';
import { getAllManualMatchesNotDefined } from '../utils/manualMatchUtils';

export const AdvancedJoinsTopBar = ({
  isAdvancedJoinRunnable,
  savedManualMatchesCount,
  runStage,
  setRunStage,
}: {
  isAdvancedJoinRunnable: boolean;
  savedManualMatchesCount: number;
  runStage: boolean;
  setRunStage: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { manualMatches } = useContext(ManualMatchesContext);
  const noUnsavedManualMatches = getAllManualMatchesNotDefined(manualMatches);

  const handleRunAdvancedJoin = () => {
    setRunStage(true);
  };

  const handleBackButton = () => {
    if (!runStage && noUnsavedManualMatches) {
      const dataManagementURL = getDataManagementURL();
      window.location.href = dataManagementURL;
    }
    setRunStage(false);
  };
  const confirmedBack = () => {
    const dataManagementURL = getDataManagementURL();
    window.location.href = dataManagementURL;
  };

  return (
    <StyledTopBar>
      <>
        <TopBarLeft
          confirmedBack={confirmedBack}
          noUnsavedManualMatches={noUnsavedManualMatches}
          handleBackButton={handleBackButton}
          runStage={runStage}
        />
        <TopBarRight
          runStage={runStage}
          isAdvancedJoinRunnable={isAdvancedJoinRunnable}
          savedManualMatchesCount={savedManualMatchesCount}
          handleRunAdvancedJoin={handleRunAdvancedJoin}
        />
      </>
    </StyledTopBar>
  );
};

const StyledTopBar = styled(TopBar)`
  background-color: var(--cogs-bg-accent);
  height: 50px;
`;
