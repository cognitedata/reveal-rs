import { A, Body, Title } from '@cognite/cogs.js';
import { useTranslation, Trans } from 'react-i18next';
import sidecar from 'utils/sidecar';

import { Container, Code } from '../elements';

const Info = () => {
  const { t } = useTranslation('Info');

  const baseURL = sidecar.cdfApiBaseUrl;

  return (
    <Container>
      <Title>What is the Sidecar?</Title>
      <Body>
        <Trans t={t} i18nKey="cdfBaseUrl_paragraph">
          The CDF base URL for this cluster is <Code>{baseURL}</Code>
        </Trans>
      </Body>
      <Body>
        <div>
          The sidecar contains constants that is useful for the application, and
          the values contained
          <br />
          in the sidecar are dynamically assigned based on cluster specific
          configuration.
        </div>
        <Trans t={t} i18nKey="info-sidecar">
          Learn more about{' '}
          <A
            isExternal
            href="https://cog.link/sidecar"
            target="_blank"
            rel="noopener noreferrer"
          >
            sidecars
          </A>
          !
        </Trans>
      </Body>
    </Container>
  );
};

export default Info;
