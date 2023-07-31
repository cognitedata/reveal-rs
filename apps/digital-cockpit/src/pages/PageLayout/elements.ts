import styled from 'styled-components/macro';

export const Container = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
`;

export const Main = styled.div`
  display: flex;
  height: 100%;
  overflow: auto;
  background-color: var(--cogs-greyscale-grey2);
`;

export const Content = styled.div`
  width: 100%;
  overflow: auto;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden auto;
  width: 100%;
  width: -webkit-fill-available;
  width: -moz-available;
`;
