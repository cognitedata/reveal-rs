import { ComponentStory } from '@storybook/react';

import { CommonFilter } from './CommonFilter';

export default {
  title:
    'FlexibleDataExplorer/Containers/Search/Filter/Containers/CommonFilter',
  component: CommonFilter,
};

export const Example: ComponentStory<typeof CommonFilter> = (args) => (
  <CommonFilter {...args} />
);
Example.args = {
  field: {
    name: 'Field',
    type: 'string',
  },
};
