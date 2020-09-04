import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';
import config from 'utils/config';

import App from './App';
import * as serviceWorker from './serviceWorker';

import '@cognite/cogs.js/dist/cogs.css';
import I18nContainer from './containers/I18nContainer';
import { ApiProvider } from './contexts/ApiContext';
import { AuthProvider } from './contexts/AuthContext';
import { APIErrorProvider } from './contexts/APIErrorContext';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    // This is populated by the FAS build process. Change it if you want to
    // source this information from somewhere else.
    release: process.env.REACT_APP_RELEASE_ID,
    // This is populated by react-scripts. However, this can be overridden by
    // the app's build process if you wish.
    environment: config.env,
  });
}

ReactDOM.render(
  <I18nContainer>
    <AuthProvider>
      <ApiProvider>
        <APIErrorProvider>
          <App />
        </APIErrorProvider>
      </ApiProvider>
    </AuthProvider>
  </I18nContainer>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
