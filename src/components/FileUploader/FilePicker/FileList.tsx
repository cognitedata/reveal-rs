import React from 'react';
import { Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { margin } from 'src/cogs-variables';
import { FileListItem } from 'src/components/FileUploader/FilePicker/FileListItem';
import { CogsFileInfo } from './types';
import SpiderImg from './img/Spider.svg';

type FileListProps = {
  files: CogsFileInfo[];
  onRemove: (file: CogsFileInfo) => unknown;
  children?: React.ReactNode;
};

export function FileList({ files, onRemove, children }: FileListProps) {
  return (
    <div>
      <Title level={5} style={{ margin: `${margin.default} 0` }}>
        {files.length} items selected
      </Title>

      <TableContainer
        style={{
          ...(!files.length && {
            background: `url(${SpiderImg}) top no-repeat`,
          }),
        }}
      >
        {files.map((file) => (
          <FileListItem key={file.uid} file={file} onRemove={onRemove} />
        ))}
      </TableContainer>

      {children}
    </div>
  );
}

const TableContainer = styled.div`
  padding: 22px;
  margin: ${margin.default} 0;

  height: 345px;
  overflow: auto;

  & > *:nth-child(even) {
    background-color: #fbfbfb;
  }

  box-shadow: 0 0 20px -5px rgba(133, 145, 243, 0.2);
  border: 1px solid #cccccc;
  border-radius: 10px;
`;
