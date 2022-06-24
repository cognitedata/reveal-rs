import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import { sizes } from 'styles/layout';

export const SearchInputWrapper = styled.div`
  width: 100%;
  display: flex;
  border: 3px solid #f5f5f5;
  border-radius: 6px;
  padding: 10px 7px;
  line-height: normal;
  color: #1e1e1e;
  background: #f5f5f5;
`;

export const SearchInput = styled.input`
  height: 100%;
  outline: none;
  border: none;
  width: 100%;
  padding: 1px 5px;
  border-radius: 6px;
  background: #f5f5f5;
`;

export const SearchButton = styled(Button)`
  width: 100%;
  background: #dadada;
  border: ${sizes.extraSmall} white solid;
  color: #aeaeae;
  justify-content: left;
  min-height: ${sizes.large};
`;
