import styled, { css } from 'styled-components';
import { Button, Title } from '@cognite/cogs.js';
// import { CloseButton } from 'components/Buttons';

export const Flex = styled.div`
  display: flex;
`;

export const FlexRow = styled(Flex as any)`
  flex-direction: row;
`;

/**
 * MARGINS AND PADDINGS
 */
const extraSmall = '4px';
const small = '8px';
const normal = '16px';
const medium = '24px';
const large = '40px';
const extraLarge = '48px';
const huge = '80px';

export const sizes = {
  /** 4px */
  extraSmall,
  /** 8px */
  small,
  /** 16px */
  normal,
  /** 24px */
  medium,
  /** 40px */
  large,
  /** 48px */
  extraLarge,
  /** 80px */
  huge,
};

export const MarginLeftContainer = styled.div`
  margin-left: ${sizes.small};
  /* margin-left: 8px; */
`;

export const SyntaxHelperWrapper = styled.div`
  background-color: var(--cogs-surface--muted);
  width: 416px;
  padding: ${sizes.small};
  box-shadow: var(--cogs-z-4);
  border-radius: 4px;
`;

export const TitleContainer = styled.div`
  margin-bottom: ${sizes.normal};
  margin-left: ${sizes.small};
  /* margin-bottom: 16px;
  margin-left: 8px; */
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

// Used for the smooth transition
export const ContentWrapper = styled.div`
  transition: height 0.3s;
  height: ${(props: { height: number | undefined }) => props.height}px;
  /* height: 100px; */
  overflow: hidden;
  margin-top: ${sizes.normal};
  margin-bottom: ${sizes.small};
`;

export const Content = styled.div`
  margin-left: ${sizes.small};
  /* margin-left: 8px; */
  color: var(--cogs-text-color);
  line-height: 22px;
  font-weight: 400;
  font-size: 14px;
  width: 394px;
  h6 {
    margin-bottom: 12px;
  }
  p {
    margin-bottom: ${sizes.normal};
    /* margin-bottom: 16px; */
    width: auto;
  }
  p:last-child {
    margin-bottom: 0px;
  }
  strong {
    font-weight: 500;
  }
  hr {
    border: none;
    background: var(--cogs-greyscale-grey2);
    height: 2px;
    margin-bottom: ${sizes.normal};
    /* margin-bottom: 16px; */
  }
  ul {
    padding: 0 24px;
    li:not(li:last-of-type) {
      padding-bottom: 1em;
    }
  }
`;

export const HintColor = styled.span`
  color: var(--cogs-text-hint);
`;

export const CopyToClipboardStyle = styled.span(
  () => css`
    display: inline-block;
    margin: -1px 0; // Negative margin because the gray box is taller than the line hight :(
    min-width: 24px;
    text-align: center;
    padding: 1px ${sizes.extraSmall};
    /* padding: 1px 8px; */
    border-radius: 4px;
    background-color: var(--cogs-bg-control--secondary);
    cursor: pointer;
    user-select: none;
  `
);

export const H6 = styled(Title).attrs(() => ({
  level: 6,
}))`
  margin-bottom: ${sizes.small};
  /* margin-bottom: 8px; */
`;

export const SyntaxRuleInfoContainer = styled(FlexRow)(
  () => css`
    background: #f6f9ff; // not in the cogs
    border: 1px solid var(--cogs-midblue-5);
    /* box-sizing: border-box; */
    /* border-radius: ${sizes.small}; */
    border-radius: 8px;
    /* margin-top: ${sizes.small}; */
    margin-top: 8px;
    margin-bottom: 12px;
  `
);

export const SyntaxRuleInfoTitle = styled.p(
  () => css`
    width: 348px;
    color: var(--cogs-greyscale-grey9);
    margin: ${sizes.normal} 0px ${sizes.normal} ${sizes.normal};
    /* margin: 10px; */
  `
);

export const SyntaxInfoCloseButton = styled(Button)`
  position: relative;
  top: ${sizes.small};
  /* top: 8px; */
`;

export const SyntaxOperatorsHeaderTab = styled(FlexRow)`
  /* box-sizing: border-box; */
  border-radius: ${sizes.small};
  margin-bottom: ${sizes.normal};
  /* border-radius: 8px;
  margin-bottom: 16px; */
  & p {
    line-height: 20px;
    color: var(--cogs-greyscale-grey9);
  }
`;

// export const StyledSegmentedControl = styled(SegmentedControl)`
//   /* width: 100%;
//   display: flex;
//   justify-content: space-between; */
//   .TabsListUnstyled-root {
//     display: flex !important;
//   }
// `;

export const HorizontalDivider = styled.div`
  width: 100%;
  height: 1px;
  background-color: var(--cogs-border--muted);
  margin: 0 0 14px 0;
`;

export const StyledInfobox = styled.div`
  background-color: var(--cogs-surface--strong);
  padding: ${sizes.small};
  /* border: 1px solid rgba(102, 102, 102, 0.2); */
  border: 1px solid var(--cogs-border--muted);
  border-radius: ${sizes.small};
  margin-right: 2px;
  margin-bottom: ${sizes.normal};
`;
