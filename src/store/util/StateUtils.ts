// state helper functions

import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { FileState } from 'src/modules/Common/filesSlice';

// convert to state
export const createFileState = (file: FileInfo): FileState => {
  return {
    ...file,
    createdTime: file.createdTime.getTime(),
    uploadedTime: file.uploadedTime?.getTime(),
    lastUpdatedTime: file.lastUpdatedTime.getTime(),
    sourceCreatedTime: file.sourceCreatedTime?.getTime(),
    linkedAnnotations: [],
    selected: false,
  };
};

// convert from state helper functions

export const createFileInfo = (
  file: FileState
): FileInfo & { selected: boolean } => {
  return {
    ...file,
    id: Number(file.id),
    createdTime: new Date(file.createdTime),
    uploadedTime: file.uploadedTime ? new Date(file.uploadedTime) : undefined,
    lastUpdatedTime: new Date(file.lastUpdatedTime),
    sourceCreatedTime: file.sourceCreatedTime
      ? new Date(file.sourceCreatedTime)
      : undefined,
    selected: file.selected,
  };
};
