import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset';
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, { cypressDir: 'cypress' }),
    experimentalModifyObstructiveThirdPartyCode: true,
    chromeWebSecurity: true,
  },
  env: process.env,
  video: true,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
  viewportWidth: 1920,
  viewportHeight: 1080,
});
