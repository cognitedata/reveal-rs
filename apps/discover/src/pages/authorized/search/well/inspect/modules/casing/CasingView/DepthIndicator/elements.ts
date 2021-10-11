import styled from 'styled-components/macro';

import mainPalette from 'styles/default.palette';

export const DepthIndicatorWrapper = styled.div`
  display: inline-block;
  width: 20px;
  height: 100%;
  cursor: pointer;
  position: relative;
  transform: ${(props: { transform: string }) => props.transform};
  z-index: ${(props: { zIndex: number }) => props.zIndex};
`;

export const Start = styled.div`
  border-left: 4px solid #00000027;
  box-sizing: border-box;
  float: left;
  width: 100%;
  height: ${(props: { height: string }) => props.height};
`;

export const Middle = styled.div`
  border-left: 4px solid ${mainPalette.black};
  box-sizing: border-box;
  float: left;
  width: 100%;
  height: ${(props: { height: string }) => props.height};
`;

export const End = styled.div`
  border-left: 4px solid ${mainPalette.black};
  box-sizing: border-box;
  float: left;
  width: 100%;
`;

export const Description = styled.div`
  position: relative;
  bottom: 14px;
  color: ${mainPalette.black};
  width: max-content;
  font-size: 11px;
  background-color: #f5f5dc;
  border: 1px #ff0000 solid;
  border-radius: 5px;
  padding: 2px;
  text-transform: lowercase;
  left: ${(props: { linerCasing: boolean }) =>
    props.linerCasing ? '9px' : '25px'};
  float: left;
`;

export const TriangleBottomRight = styled.div`
  width: 0;
  height: 0;
  border-bottom: 16px solid ${mainPalette.black};
  border-right: 16px solid transparent;
  float: left;
`;

export const LinerEnd = styled.div`
  width: 0;
  height: 0;
  border-bottom: 16px solid ${mainPalette.black};
  float: left;
`;
