import styled from 'styled-components/macro';

import layers from '_helpers/zindex';
import { Flex, sizes } from 'styles/layout';

export const NPTEventsDataControlArea = styled(Flex)`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${sizes.normal};
  z-index: ${layers.FILTER_BOX};
`;

export const SwitchViewModeWrapper = styled(Flex)`
  padding-right: 10px;
  margin-right: 10px;
  border-right: 1px solid var(--cogs-border-default);
  &:last-child {
    border: none;
  }
`;

export const NptCodeAvatar = styled.div`
  height: 12px;
  width: 12px;
  border-radius: ${sizes.extraSmall};
  border: 2px var(--cogs-greyscale-grey2) solid;
  background-color: ${(props: { color: string }) => props.color};
  margin-right: ${sizes.extraSmall};
`;
