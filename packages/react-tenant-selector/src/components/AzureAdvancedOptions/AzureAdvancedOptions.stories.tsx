import { action } from '@storybook/addon-actions';

import { StyledContentWrapper } from '../CardContainer/elements';

import AzureAdvancedOptions from './AzureAdvancedOptions';

export default {
  title: 'Authentication/AzureAdvancedOptions',
};

const AzureAdvancedOptionsProps = {
  advancedOptions: {
    directory: 'test',
  },
  handleOnChange: action('onChange'),
  handleSubmit: action('onSubmit'),
};

export const Base = () => (
  <StyledContentWrapper>
    <AzureAdvancedOptions {...AzureAdvancedOptionsProps} />
  </StyledContentWrapper>
);
