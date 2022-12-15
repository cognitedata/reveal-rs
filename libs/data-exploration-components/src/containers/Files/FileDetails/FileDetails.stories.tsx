import React from 'react';
import { files } from 'stubs/files';
import { FileDetails } from './FileDetails';

export default {
  title: 'Files/FileDetails',
  component: FileDetails,
};
export const Example = () => <FileDetails file={files[0]} />;
