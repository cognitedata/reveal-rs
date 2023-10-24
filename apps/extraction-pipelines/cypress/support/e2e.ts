// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// This will also register cypress commands defined in @fusion/shared/cypress like loginWithAADClientCredentials()
import {
  baseUrl,
  idpInternalId,
  AADUsername,
  AADPassword,
  project,
} from '../config';

import './commands';

Cypress.on('uncaught:exception', (err) => {
  // returning false here prevents Cypress from
  // failing the test
  if (
    err.message.includes('cluster not found') ||
    err.message.includes('Maximum update depth exceeded')
  ) {
    return false;
  }
});

beforeEach(() => {
  cy.session(
    [AADUsername],
    () => {
      cy.loginWithAADUserCredentials(
        baseUrl,
        idpInternalId,
        project,
        AADUsername,
        AADPassword
      );
      cy.setImportMapOverrides([
        {
          module: '@cognite/cdf-integrations-ui',
          domain: 'https://localhost:3033/index.js',
        },
      ]);
    },
    { cacheAcrossSpecs: true }
  );
});
