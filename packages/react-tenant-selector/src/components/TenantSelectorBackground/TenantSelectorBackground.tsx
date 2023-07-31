import React from 'react';

import LogoWithText from '../../icons/LogoWithText';
import { Centered } from '../../styles/elements';
import { useIsDesktop } from '../../hooks/useIsDesktop';

import {
  Background,
  CogniteLogo,
  StyledIconWrapper,
  CLetter,
  NLetter,
  DimmingOverlay,
} from './elements';

interface Props {
  children: React.ReactNode | null;
  className?: string;
  backgroundImage: string;
}

const TenantSelectorBackground = ({
  children,
  className,
  backgroundImage,
}: Props) => {
  const isDesktop = useIsDesktop();
  return (
    <Background
      role="img"
      className={className}
      backgroundImage={backgroundImage}
    >
      <CogniteLogo>
        <StyledIconWrapper>
          <LogoWithText />
        </StyledIconWrapper>
      </CogniteLogo>
      {isDesktop ? (
        <>
          <CLetter />
          <NLetter />
        </>
      ) : null}
      <DimmingOverlay>
        <Centered>{children}</Centered>
      </DimmingOverlay>
    </Background>
  );
};

export default TenantSelectorBackground;
