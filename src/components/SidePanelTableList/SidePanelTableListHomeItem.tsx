import React, { useContext, useState } from 'react';

import {
  Body,
  Button,
  Dropdown,
  Colors,
  Icon,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';
import styled from 'styled-components';

import { RawExplorerContext } from 'contexts';
import DeleteDatabaseModal from 'components/DeleteDatabaseModal/DeleteDatabaseModal';
import { useUserCapabilities } from 'hooks/useUserCapabilities';

type SidePanelTableListHomeItemProps = {
  isEmpty?: boolean;
};

const StyledPanelTableListHomeItemWrapper = styled.div`
  border-bottom: 1px solid ${Colors['border-default']};
  margin-bottom: 8px;
  padding-bottom: 8px;
`;

const StyledHomeItem = styled.div`
  align-items: center;
  background-color: ${Colors['bg-accent']};
  border-radius: 6px;
  display: flex;
  height: 40px;
  padding: 0 8px;
  width: 100%;
`;

const StyledHomeIcon = styled(Icon)`
  color: ${Colors['bg-status-small--accent-pressed']};
  margin-right: 8px;
`;

const StyledHomeItemName = styled(Body)`
  margin-right: 8px;
  overflow: hidden;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: calc(100% - 60px);
`;

const SidePanelTableListHomeItem = ({
  isEmpty,
}: SidePanelTableListHomeItemProps): JSX.Element => {
  const { selectedSidePanelDatabase = '' } = useContext(RawExplorerContext);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');

  return (
    <StyledPanelTableListHomeItemWrapper>
      <StyledHomeItem>
        <StyledHomeIcon type="Home" />
        <StyledHomeItemName level={3}>
          {selectedSidePanelDatabase}
        </StyledHomeItemName>
        <Dropdown
          content={
            <Menu>
              <Tooltip
                content={
                  hasWriteAccess ? (
                    'You cannot delete non-empty databases'
                  ) : (
                    <>
                      To delete databases, you need to have the{' '}
                      <strong>raw:write</strong> capability
                    </>
                  )
                }
                disabled={hasWriteAccess && isEmpty}
              >
                <Button
                  disabled={!isEmpty || !hasWriteAccess}
                  icon="Trash"
                  onClick={() => setIsDeleteModalOpen(true)}
                  type="ghost-danger"
                >
                  Delete database
                </Button>
              </Tooltip>
            </Menu>
          }
        >
          <Button
            icon="MoreOverflowEllipsisHorizontal"
            size="small"
            type="ghost"
          />
        </Dropdown>
        <DeleteDatabaseModal
          databaseName={selectedSidePanelDatabase}
          onCancel={() => setIsDeleteModalOpen(false)}
          visible={isDeleteModalOpen}
        />
      </StyledHomeItem>
    </StyledPanelTableListHomeItemWrapper>
  );
};

export default SidePanelTableListHomeItem;
