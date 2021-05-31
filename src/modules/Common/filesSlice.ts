import {
  createSelector,
  createSlice,
  PayloadAction,
  isFulfilled,
  isRejected,
} from '@reduxjs/toolkit';
import { Asset, FileInfo, Label, Metadata } from '@cognite/cdf-sdk-singleton';
import { ToastUtils } from 'src/utils/ToastUtils';
import { ReactText } from 'react';
import { createFileInfo, createFileState } from 'src/store/util/StateUtils';
import { UpdateFiles } from 'src/store/thunks/UpdateFiles';
import { deleteFilesById } from 'src/store/thunks/deleteFilesById';
import { SaveAvailableAnnotations } from 'src/store/thunks/SaveAvailableAnnotations';
import { SaveAnnotations } from 'src/store/thunks/SaveAnnotations';
import { RetrieveAnnotations } from 'src/store/thunks/RetrieveAnnotations';
import { DeleteAnnotations } from 'src/store/thunks/DeleteAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/UpdateAnnotations';

import { CDFStatusModes } from '../Common/Components/CDFStatus/CDFStatus';

export type FileState = {
  id: ReactText;
  createdTime: number;
  lastUpdatedTime: number;
  sourceCreatedTime?: number;
  mimeType?: string;
  name: string;
  source?: string;
  uploaded: boolean;
  uploadedTime?: number;
  labels?: Label[];
  metadata?: Metadata;
  linkedAnnotations: string[];
  assetIds?: number[];
  selected: boolean;
};

export type State = {
  dataSetIds?: number[];
  extractExif?: boolean;
  allFilesStatus?: boolean;
  files: {
    byId: Record<ReactText, FileState>;
    allIds: ReactText[];
  };
  saveState: {
    mode: CDFStatusModes;
    time?: number | undefined;
  };
};

export type VisionAsset = Omit<
  Omit<Omit<Asset, 'createdTime'>, 'lastUpdatedTime'>,
  'sourceCreatedType'
> & { createdTime: number; lastUpdatedTime: number };

const initialState: State = {
  dataSetIds: undefined,
  extractExif: true,
  allFilesStatus: false,
  // eslint-disable-next-line global-require
  // files: require('src/store/fakeFiles.json'),

  files: {
    byId: {},
    allIds: [],
  },
  saveState: {
    mode: 'saved' as CDFStatusModes,
    time: new Date().getTime(),
  },
};

export const selectCDFState = (
  state: State
): {
  mode: CDFStatusModes;
  time?: number | undefined;
} => {
  const cdfSaveStatus = state.saveState;
  return cdfSaveStatus;
};

const filesSlice = createSlice({
  name: 'filesSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setFiles: {
      prepare: (files: FileInfo[]) => {
        return { payload: files.map((file) => createFileState(file)) };
      },
      reducer: (state, action: PayloadAction<FileState[]>) => {
        const files = action.payload;
        clearFileState(state);

        files.forEach((file) => {
          updateFileState(state, file);
        });
      },
    },
    setUploadedFiles: {
      prepare: (files: FileInfo[]) => {
        return { payload: files.map((file) => createFileState(file)) };
      },
      reducer: (state, action: PayloadAction<FileState[]>) => {
        const files = action.payload;
        clearFileState(state);

        files.forEach((file) => {
          updateFileState(state, file);
        });
      },
    },
    addUploadedFile: {
      prepare: (file: FileInfo) => {
        return { payload: createFileState(file) };
      },
      reducer: (state, action: PayloadAction<FileState>) => {
        updateFileState(state, action.payload);
      },
    },
    setAllFilesStatus(state, action: PayloadAction<boolean>) {
      state.allFilesStatus = action.payload;
    },
    setDataSetIds(state, action: PayloadAction<number[] | undefined>) {
      state.dataSetIds = action.payload;
    },
    setExtractExif(state, action: PayloadAction<boolean>) {
      state.extractExif = action.payload;
    },
    setFileSelectState: {
      prepare: (id: number, selected: boolean) => {
        return { payload: { fileId: id, selectState: selected } };
      },
      reducer: (
        state,
        action: PayloadAction<{ fileId: number; selectState: boolean }>
      ) => {
        const { fileId } = action.payload;
        if (fileId) {
          const file = state.files.byId[fileId];
          if (file) {
            file.selected = action.payload.selectState;
          }
        }
      },
    },
    setAllFilesSelectState(state, action: PayloadAction<boolean>) {
      const allFileIds = state.files.allIds;
      allFileIds.forEach((fileId) => {
        const file = state.files.byId[fileId];
        file.selected = action.payload;
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deleteFilesById.fulfilled, (state, { payload }) => {
      payload.forEach((fileId) => {
        deleteFileById(state, fileId.id);
      });
    });

    builder.addCase(UpdateFiles.fulfilled, (state, { payload }) => {
      payload.forEach((fileState) => {
        updateFileState(state, fileState);
      });

      if (payload.length) {
        ToastUtils.onSuccess('File updated successfully!');
      }
    });

    builder.addCase(UpdateFiles.rejected, (_, { error }) => {
      if (error && error.message) {
        ToastUtils.onFailure(error?.message);
      }
    });

    builder.addCase(SaveAvailableAnnotations.fulfilled, (state) => {
      state.dataSetIds = initialState.dataSetIds;
      state.extractExif = initialState.extractExif;
      state.files = initialState.files;
    });
    builder.addMatcher(
      isFulfilled(
        SaveAnnotations,
        DeleteAnnotations,
        UpdateAnnotations,
        UpdateFiles
      ),
      (state) => {
        state.saveState.mode = 'timestamp';
        state.saveState.time = new Date().getTime();
      }
    );

    builder.addMatcher(
      isRejected(
        SaveAnnotations,
        RetrieveAnnotations,
        DeleteAnnotations,
        UpdateAnnotations,
        UpdateFiles
      ),
      (state, { error }) => {
        if (error && error.message) {
          state.saveState.mode = 'error';
          state.saveState.time = new Date().getTime();
          ToastUtils.onFailure(
            `Failed to update Annotations! ${error?.message}`
          );
        }
      }
    );
  },
});

export const {
  setFiles,
  setUploadedFiles,
  addUploadedFile,
  setDataSetIds,
  setExtractExif,
  setAllFilesStatus,
  setFileSelectState,
  setAllFilesSelectState,
} = filesSlice.actions;

export default filesSlice.reducer;

export const selectAllFiles = createSelector(
  (state: State) => state.files.allIds,
  (state) => state.files.byId,
  (allIds, allFiles) => {
    return allIds.map((id) => createFileInfo(allFiles[id]));
  }
);

export const selectAllFilesSelected = createSelector(
  (state: State) => state.files.allIds,
  (state) => state.files.byId,
  (allIds, allFiles) => {
    return allIds.length
      ? allIds.map((id) => allFiles[id]).every((item) => !!item.selected)
      : false;
  }
);

export const selectAllSelectedFiles = createSelector(
  selectAllFiles,
  (files) => {
    return files.filter((file) => file.selected);
  }
);

export const selectFileById = createSelector(
  (_: State, fileId: string) => fileId,
  (state) => state.files.byId,
  (fileId, files) => {
    const file = files[fileId];
    return file ? createFileInfo(file) : null;
  }
);

// state utility functions

const deleteFileById = (state: State, id: ReactText) => {
  delete state.files.byId[id];
  state.files.allIds = Object.keys(state.files.byId);
};

const updateFileState = (state: State, file: FileState) => {
  const hasInState = !!state.files.byId[file.id];
  state.files.byId[file.id] = file;
  if (!hasInState) {
    state.files.allIds.push(file.id);
  }
};

const clearFileState = (state: State) => {
  state.files.byId = {};
  state.files.allIds = [];
};
