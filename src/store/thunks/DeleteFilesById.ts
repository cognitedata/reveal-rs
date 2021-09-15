import { createAsyncThunk } from '@reduxjs/toolkit';
import { v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { ThunkConfig } from 'src/store/rootReducer';
import { DeleteAnnotationsForDeletedFiles } from 'src/store/thunks/DeleteAnnotationsForDeletedFiles';

export const DeleteFilesById = createAsyncThunk<
  number[],
  number[],
  ThunkConfig
>('DeleteFilesById', async (fileIds, { dispatch }) => {
  if (!fileIds || !fileIds.length) {
    throw new Error('Ids not provided!');
  }
  await dispatch(DeleteAnnotationsForDeletedFiles(fileIds));
  await sdk.files.delete(fileIds.map((id) => ({ id })));
  return fileIds;
});
