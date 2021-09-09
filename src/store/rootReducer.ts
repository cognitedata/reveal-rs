import { combineReducers } from '@reduxjs/toolkit';
import './commonActions';
import filesSlice from 'src/modules/Common/filesSlice';
import processSlice from 'src/modules/Process/processSlice';
import previewSlice from 'src/modules/Review/previewSlice';
import fileDetailsSlice from 'src/modules/FileDetails/fileDetailsSlice';
import annotationReducer from 'src/modules/Common/annotationSlice';
import explorerReducer from 'src/modules/Explorer/store/explorerSlice';
import imagePreviewReducer from 'src/modules/Review/imagePreviewSlice';
import commonReducer from 'src/modules/Common/commonSlice';

const rootReducer = combineReducers({
  filesSlice,
  commonReducer,
  processSlice,
  previewSlice,
  fileDetailsSlice,
  annotationReducer,
  explorerReducer,
  imagePreviewReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type ThunkConfig = { state: RootState };

export default rootReducer;
