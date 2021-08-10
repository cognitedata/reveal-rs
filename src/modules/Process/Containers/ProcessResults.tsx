import React, { useMemo } from 'react';
import {
  FileActions,
  ResultData,
  SelectFilter,
  TableDataItem,
  ViewMode,
} from 'src/modules/Common/types';
import {
  FileSortPaginateType,
  selectIsPollingComplete,
  setCurrentPage,
  setMapTableTabKey,
  setPageSize,
  setReverse,
  setSelectedFileId,
  setSortKey,
  showFileMetadataPreview,
} from 'src/modules/Process/processSlice';
import {
  selectAllFiles,
  selectAllFilesSelected,
  selectAllSelectedIds,
  setFileSelectState,
} from 'src/modules/Common/filesSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { MapView } from 'src/modules/Common/Components/MapView/MapView';
import { resetEditHistory } from 'src/modules/FileDetails/fileDetailsSlice';
import {
  getParamLink,
  workflowRoutes,
} from 'src/modules/Workflow/workflowRoutes';
import { FileTable } from 'src/modules/Common/Components/FileTable/FileTable';
import { FileGridPreview } from 'src/modules/Common/Components/FileGridPreview/FileGridPreview';
import { Prompt, useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { Detail } from '@cognite/cogs.js';
import { PageBasedGridView } from 'src/modules/Common/Components/GridView/PageBasedGridView';
import { VisionMode } from 'src/constants/enums/VisionEnums';
import { setSelectedAllFiles } from 'src/store/commonActions';
import { FileInfo } from '@cognite/cdf-sdk-singleton';

export const ProcessResults = ({ currentView }: { currentView: ViewMode }) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const selectedId = useSelector(
    ({ processSlice }: RootState) => processSlice.selectedFileId
  );

  const isPollingFinished = useSelector((state: RootState) => {
    return selectIsPollingComplete(state.processSlice);
  });

  const processFiles = useSelector((state: RootState) =>
    selectAllFiles(state.filesSlice)
  );

  const allFilesSelected = useSelector((state: RootState) =>
    selectAllFilesSelected(state.filesSlice)
  );

  const selectedFileIds = useSelector((state: RootState) =>
    selectAllSelectedIds(state.filesSlice)
  );

  const sortPaginateState = useSelector(
    ({ processSlice }: RootState) => processSlice.sortPaginate
  );

  const menuActions: FileActions = {
    // TODO: should onDelete be added here as well?
    onFileDetailsClicked: (fileInfo: FileInfo) => {
      dispatch(setSelectedFileId(fileInfo.id));
      dispatch(resetEditHistory());
      dispatch(showFileMetadataPreview());
    },
    onReviewClick: (fileInfo: FileInfo) => {
      history.push(
        getParamLink(workflowRoutes.review, ':fileId', String(fileInfo.id)),
        { from: 'process' }
      );
    },
  };

  const data: ResultData[] = useMemo(
    () =>
      processFiles.map((file) => ({
        ...file,
        menuActions,
        mimeType: file.mimeType || '',
      })),
    [processFiles, menuActions]
  );

  const handleItemClick = (
    item: TableDataItem,
    showFileDetailsOnClick: boolean = true
  ) => {
    dispatch(setSelectedFileId(item.id));
    if (showFileDetailsOnClick) {
      dispatch(showFileMetadataPreview());
    }
  };

  const handleRowSelect = (item: TableDataItem, selected: boolean) => {
    dispatch(setFileSelectState(item.id, selected));
  };

  const promptMessage =
    'Are you sure you want to leave or refresh this page? The session state and all unsaved processing data will be lost. Already saved processing data can be accessed from the Image explorer on the front page.';

  window.onbeforeunload = (event: any) => {
    // prompt on reload, if in a session and there are files
    if (
      !window.location.pathname.includes('/vision/workflow') ||
      !processFiles.length
    ) {
      return;
    }
    const e = event || window.event;
    e.returnValue = promptMessage; // NOTE: only some browsers show this message
    // eslint-disable-next-line consistent-return
    return promptMessage;
  };

  const handleSelectAllFiles = (
    value: boolean,
    selectFilter?: SelectFilter
  ) => {
    dispatch(
      setSelectedAllFiles({ selectStatus: value, filter: selectFilter })
    );
  };

  const handleSetSortKey = (type: FileSortPaginateType, sortKey: string) => {
    dispatch(setSortKey({ type, sortKey }));
  };
  const handleSetReverse = (type: FileSortPaginateType, reverse: boolean) => {
    dispatch(setReverse({ type, reverse }));
  };
  const handleSetCurrentPage = (
    type: FileSortPaginateType,
    currentPage: number
  ) => {
    dispatch(setCurrentPage({ type, currentPage }));
  };
  const handleSetPageSize = (type: FileSortPaginateType, pageSize: number) => {
    dispatch(setPageSize({ type, pageSize }));
  };

  const getSortControls = (type: FileSortPaginateType) => ({
    sortKey: sortPaginateState[type].sortKey,
    reverse: sortPaginateState[type].reverse,
    setSortKey: (sortKey: string) => {
      handleSetSortKey(type, sortKey);
    },
    setReverse: (reverse: boolean) => {
      handleSetReverse(type, reverse);
    },
  });
  const getPaginationControls = (type: FileSortPaginateType) => ({
    currentPage: sortPaginateState[type].currentPage,
    pageSize: sortPaginateState[type].pageSize,
    setCurrentPage: (currentPage: number) => {
      handleSetCurrentPage(type, currentPage);
    },
    setPageSize: (pageSize: number) => {
      handleSetPageSize(type, pageSize);
    },
  });

  const listSortPaginateControls = {
    ...getSortControls(FileSortPaginateType.list),
    ...getPaginationControls(FileSortPaginateType.list),
  };
  const gridSortPaginateControls = {
    ...getPaginationControls(FileSortPaginateType.grid),
  };
  const sortPaginateControlsLocation = {
    ...getSortControls(FileSortPaginateType.mapLocation),
    ...getPaginationControls(FileSortPaginateType.mapLocation),
  };
  const sortPaginateControlsNoLocation = {
    ...getSortControls(FileSortPaginateType.mapNoLocation),
    ...getPaginationControls(FileSortPaginateType.mapNoLocation),
  };

  const activeKey = useSelector(
    ({ processSlice }: RootState) => processSlice.mapTableTabKey
  );
  const setActiveKey = (key: string) => {
    dispatch(setMapTableTabKey({ mapTableTabKey: key }));
  };

  const renderView = () => {
    if (!data.length) {
      return (
        <EmptyContainer>
          <div className="header" />
          <div className="main">
            <Detail strong>
              First select from existing files or upload new
            </Detail>
          </div>
        </EmptyContainer>
      );
    }
    if (currentView === 'grid') {
      return (
        <PageBasedGridView
          onItemClicked={handleItemClick}
          onSelect={handleRowSelect}
          data={data}
          renderCell={(cellProps: any) => (
            <FileGridPreview
              mode={VisionMode.Contextualize}
              actionDisabled={!!selectedFileIds.length}
              {...cellProps}
              sortPaginateControls={gridSortPaginateControls}
            />
          )}
          totalCount={data.length}
          selectedIds={selectedFileIds}
          sortPaginateControls={gridSortPaginateControls}
        />
      );
    }
    if (currentView === 'map') {
      return (
        <MapView
          data={data}
          onRowSelect={handleRowSelect}
          onRowClick={handleItemClick}
          selectedFileId={selectedId}
          totalCount={data.length}
          allRowsSelected={allFilesSelected}
          onSelectAllRows={handleSelectAllFiles}
          selectedRowIds={selectedFileIds}
          sortPaginateControlsLocation={sortPaginateControlsLocation}
          sortPaginateControlsNoLocation={sortPaginateControlsNoLocation}
          mapTableTabKey={{ activeKey, setActiveKey }}
        />
      );
    }

    return (
      <FileTable
        data={data}
        onRowSelect={handleRowSelect}
        onRowClick={handleItemClick}
        selectedFileId={selectedId}
        totalCount={data.length}
        allRowsSelected={allFilesSelected}
        onSelectAllRows={handleSelectAllFiles}
        selectedRowIds={selectedFileIds}
        sortPaginateControls={listSortPaginateControls}
      />
    );
  };
  return (
    <>
      <Prompt
        when={!isPollingFinished}
        message={(location, _) => {
          return location.pathname.includes('vision/workflow/review/') // exclude review page
            ? true
            : promptMessage;
        }}
      />
      <Prompt
        message={(location, _) => {
          return location.pathname.includes('vision/workflow/') ||
            processFiles.length === 0 // can freely navigate in workflow or if no files.
            ? true
            : promptMessage;
        }}
      />
      {renderView()}
    </>
  );
};

const EmptyContainer = styled.div`
  .main {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 12px 20px;
    height: 500px;
    border: 1px solid #cccccc;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }

  .header {
    width: 100%;
    height: 53px;
    background: #fafafa;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    border-top: 1px solid #cccccc;
    border-left: 1px solid #cccccc;
    border-right: 1px solid #cccccc;
  }
`;
