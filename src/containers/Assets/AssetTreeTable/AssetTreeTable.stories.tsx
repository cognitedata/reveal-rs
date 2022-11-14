import React from 'react';
import styled from 'styled-components';
import { assets } from 'stubs/assets';
import { action } from '@storybook/addon-actions';
import { ComponentStory } from '@storybook/react';
import { AssetTreeTable } from './AssetTreeTable';

export default {
  title: 'Assets/AssetTreeTable',
  component: AssetTreeTable,
  decorators: [(storyFn: any) => <Container>{storyFn()}</Container>],
  argTypes: { query: { control: 'string' } },
};

export const Example: ComponentStory<typeof AssetTreeTable> = args => (
  <AssetTreeTable {...args} />
);
Example.args = {
  onAssetClicked: action('onAssetClicked'),
  isSelected: () => false,
};

export const ExampleSingleSelect: ComponentStory<
  typeof AssetTreeTable
> = args => <AssetTreeTable {...args} />;
ExampleSingleSelect.args = {
  selectionMode: 'single',
  onAssetClicked: action('onAssetClicked'),
  isSelected: () => false,
};

const asset = assets[assets.length - 1];
export const ExampleFocusAsset: ComponentStory<
  typeof AssetTreeTable
> = args => <AssetTreeTable {...args} />;
ExampleFocusAsset.args = {
  selectionMode: 'single',
  activeIds: [asset.id],
  hierachyRootId: asset.rootId,
  filter:
    asset.id === asset.rootId
      ? { assetSubtreeIds: [{ label: asset.name, value: asset.id }] }
      : {},
  onAssetClicked: action('onAssetClicked'),
  isSelected: () => false,
};

const Container = styled.div`
  padding: 20px;
  width: 100%;
  height: 600px;
  background: grey;
  display: flex;
  position: relative;

  && > * {
    background: #fff;
  }
`;
