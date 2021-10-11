import React from 'react';
import { useTranslation } from 'react-i18next';

import { Container, Wrapper } from './elements';

type Props = {
  text: string;
  onClick: () => void;
};

export const BlockExpander: React.FC<Props> = React.memo(
  ({ text, onClick }) => {
    const { t } = useTranslation();

    return (
      <Wrapper data-testid="block-expander" onClick={onClick}>
        <Container>
          <span>{t(text)}</span>
        </Container>
      </Wrapper>
    );
  }
);
