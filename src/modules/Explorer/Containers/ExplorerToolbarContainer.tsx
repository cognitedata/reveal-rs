import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { cancelFetch } from 'src/api/file/fetchFiles/fetchFiles';
import { MAX_SELECT_COUNT } from 'src/constants/ExplorerConstants';
import {
  setBulkEditModalVisibility,
  setFileDownloadModalVisibility,
} from 'src/modules/Common/store/commonSlice';
import { ViewMode } from 'src/modules/Common/types';
import { RootState } from 'src/store/rootReducer';
import { PopulateProcessFiles } from 'src/store/thunks/Process/PopulateProcessFiles';
import {
  selectExplorerSelectedFileIds,
  setExplorerCurrentView,
  setExplorerFileUploadModalVisibility,
  setExplorerQueryString,
} from 'src/modules/Explorer/store/explorerSlice';
import isEqual from 'lodash-es/isEqual';
import {
  getLink,
  getParamLink,
  workflowRoutes,
} from 'src/utils/workflowRoutes';
import { PopulateReviewFiles } from 'src/store/thunks/Review/PopulateReviewFiles';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { ExplorerToolbar } from 'src/modules/Explorer/Components/ExplorerToolbar';

export type ExplorerToolbarContainerProps = {
  query?: string;
  selectedCount?: number;
  isLoading: boolean;
  currentView?: string;
  reFetch: () => void;
};

export const ExplorerToolbarContainer = (
  props: ExplorerToolbarContainerProps
) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const percentageScanned = useSelector(
    ({ explorerReducer }: RootState) => explorerReducer.percentageScanned
  );
  const selectedFileIds = useSelector(
    (state: RootState) => selectExplorerSelectedFileIds(state.explorerReducer),
    isEqual
  );

  const handleViewChange = (view: string) => {
    dispatch(setExplorerCurrentView(view as ViewMode));
  };
  const handleSearch = (text: string) => {
    cancelFetch();
    dispatch(setExplorerQueryString(text));
  };
  const onUpload = () => {
    dispatch(setExplorerFileUploadModalVisibility(true));
  };
  const onDownload = () => {
    dispatch(setFileDownloadModalVisibility(true));
  };
  const onContextualise = () => {
    dispatch(PopulateProcessFiles(selectedFileIds));
    history.push(getLink(workflowRoutes.process));
  };
  const onReview = async () => {
    dispatch(PopulateReviewFiles(selectedFileIds));
    history.push(
      // selecting first item in review
      getParamLink(
        workflowRoutes.review,
        ':fileId',
        String(selectedFileIds[0])
      ),
      { from: 'explorer' }
    );
  };
  const onDelete = () => {
    dispatch(DeleteFilesById(selectedFileIds));
  };
  const onBulkEdit = () => {
    dispatch(setBulkEditModalVisibility(true));
  };

  return (
    <ExplorerToolbar
      {...props}
      maxSelectCount={MAX_SELECT_COUNT}
      percentageScanned={percentageScanned}
      onViewChange={handleViewChange}
      onSearch={handleSearch}
      onUpload={onUpload}
      onDownload={onDownload}
      onContextualise={onContextualise}
      onReview={onReview}
      onDelete={onDelete}
      onBulkEdit={onBulkEdit}
    />
  );
};
