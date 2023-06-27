import '@cognite/cogs.js/dist/cogs.css';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';

import App from './app/App';
import { translations } from './app/common';
import { AuthProvider as InternalAuthProvider } from './app/common/auth/AuthProvider';
import GlobalStyles from './GlobalStyles';
import GlobalStyle from './utils/globalStyles';

export const AppWrapper = () => {
  const projectName = 'flexible-data-explorer';

  return (
    <GlobalStyles>
      <I18nWrapper translations={translations} defaultNamespace={projectName}>
        <InternalAuthProvider>
          <App />
        </InternalAuthProvider>
      </I18nWrapper>
      <GlobalStyle />
    </GlobalStyles>
  );
};
