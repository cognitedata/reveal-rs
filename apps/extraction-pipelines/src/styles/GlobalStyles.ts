import { createGlobalStyle } from 'styled-components';

import theme from './theme';

const GlobalStyle = createGlobalStyle<{ theme: typeof theme }>`
  body {
    overflow-y: hidden;
  }

  .ant-input,
  .ant-tag {
    font-family: BlinkMacSystemFont,Arial,sans-serif;
  }

  .ant-form-explain-holder {
    display: none;
  }

  h1 {
    font-size: 1.75rem;
  }

  a {
    color: ${(props) => props.theme.actionText};
    text-decoration: none !important; /* cogs overrides default for every anchor */
    :hover {
      color: ${(props) => props.theme.actionText};
    }
  }
  .ant-table {
    overflow: auto;
    background: white;
  }

  .antd-table table {
    min-width: 1100px;
  }
  .ant-btn-primary-disabled, .ant-btn-danger[disabled], .ant-btn-primary.disabled, .ant-btn-primary[disabled], .ant-btn-primary-disabled:focus, .ant-btn-primary.disabled:focus, .ant-btn-primary[disabled]:focus, .ant-btn-primary-disabled:active, .ant-btn-primary.disabled:active, .ant-btn-primary[disabled]:active, .ant-btn-primary-disabled.active, .ant-btn-primary.disabled.active, .ant-btn-primary[disabled].active{
    color : white;
  }

  .ant-select-dropdown-menu {
    margin-top: 0;
  }
`;

export default GlobalStyle;
