import React from 'react';
import { useFilePreviewURL } from '@data-exploration-components/hooks/sdk';
import { Body, DocumentIcon } from '@cognite/cogs.js';
import { Loader } from '@data-exploration-components/components';
import { FileInfo } from '@cognite/sdk';
import { Document } from '@data-exploration-components/domain/documents';
import Styled from 'styled-components';

export const FileThumbnail = ({ file }: { file: FileInfo | Document }) => {
  const { data: filePreviewUrl, isError, isFetching } = useFilePreviewURL(file);

  if (filePreviewUrl) {
    return <ImagePreview src={filePreviewUrl} alt="" />;
  }
  if (!isError && isFetching) {
    return <Loader />;
  }
  return (
    <>
      <DocumentIcon file={file.name} style={{ height: 36, width: 36 }} />
      {isError && <Body level={3}>Unable to preview file.</Body>}
    </>
  );
};

const ImagePreview = Styled.img`
 max-height: 200px;
`;
