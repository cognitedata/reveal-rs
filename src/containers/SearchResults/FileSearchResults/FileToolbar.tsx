import React, { useContext, useState } from 'react';
import { v4 as uuid } from 'uuid';

import { Button, SegmentedControl } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import styled from 'styled-components';

import { SearchResultToolbar, FileUploaderModal } from 'containers';
import { CLOSE_DROPDOWN_EVENT } from 'utils';
import { AppContext } from 'context/AppContext';
import { RelatedResourceType } from 'hooks';

export const DATA_EXPLORATION_DOCUMENT_CATEGORISATION =
  'DATA_EXPLORATION_document_categorisation';
export const FileToolbar = ({
  onFileClicked,
  isHaveParent,
  isGroupingFilesEnabled = false,
  onViewChange,
  currentView = 'list',
  relatedResourceType,
  showCount = false,
  allowEdit = false,
}: {
  onFileClicked?: (file: FileInfo) => boolean;
  onViewChange?: (view: string) => void;
  currentView?: string;
  isHaveParent?: boolean;
  isGroupingFilesEnabled?: boolean;
  relatedResourceType?: RelatedResourceType;
  allowEdit?: boolean;
  showCount?: boolean;
}) => {
  const context = useContext(AppContext);
  const { data: hasEditPermissions } = usePermissions(
    context?.flow!,
    'filesAcl',
    'WRITE',
    undefined,
    { enabled: !!context?.flow }
  );

  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <SearchResultToolbar
        type="file"
        showCount={showCount}
        style={{ flex: 1, justifyContent: 'space-between' }}
      >
        {allowEdit && (
          <UploadButton
            onClick={() => setModalVisible(true)}
            icon="Upload"
            disabled={!hasEditPermissions}
          >
            Upload
          </UploadButton>
        )}
        {isGroupingFilesEnabled ? (
          <SegmentedControl
            onButtonClicked={onViewChange}
            currentKey={currentView}
          >
            {isHaveParent &&
            relatedResourceType === 'linkedResource' &&
            isGroupingFilesEnabled ? (
              <SegmentedControl.Button
                key="tree"
                icon="Tree"
                title="Tree"
                aria-label="Tree"
              />
            ) : (
              <div />
            )}
            <SegmentedControl.Button
              key="list"
              icon="List"
              title="List"
              aria-label="List"
            />
          </SegmentedControl>
        ) : null}
      </SearchResultToolbar>
      <FileUploaderModal
        key={uuid()}
        visible={modalVisible}
        onFileSelected={file => {
          if (onFileClicked) {
            if (!onFileClicked(file)) {
              return;
            }
          }
          setModalVisible(false);
          window.dispatchEvent(new Event(CLOSE_DROPDOWN_EVENT));
        }}
        onCancel={() => setModalVisible(false)}
      />
    </>
  );
};

const UploadButton = styled(Button)`
  && {
    margin-right: 8px;
  }
`;
