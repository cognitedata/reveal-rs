import React from 'react';
import styled from 'styled-components';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { files } from 'stubs/files';
import { FileGridPreview } from './FileGridPreview';

export default {
  title: 'Files/FileGridPreview',
  component: FileGridPreview,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
};

export const Example = () => (
  <FileGridPreview
    item={files[0]}
    onItemClicked={action('onItemClicked')}
    isSelected={() => {}}
    query={text('query', '')}
  />
);
export const ExampleSingleSelect = () => (
  <FileGridPreview
    selectionMode="single"
    item={files[0]}
    onItemClicked={action('onItemClicked')}
    isSelected={() => {}}
    query={text('query', '')}
  />
);

const Container = styled.div`
  height: 600px;
`;
