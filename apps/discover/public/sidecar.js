/**
 * Content of this file is used for localhost and pr-server and
 * will be replaced by FAS sidecar based on the deployment environment
 */

// therefore, the only stuff we put here, is the stuff we want to use locally
window.__cogniteSidecar = {
  mixpanel: 'disabled', // do not send metrics when running e2e tests by setting wrong token
  fakeIdp: [
    {
      cluster: 'azure-dev',
      fakeApplicationId: '808c3e2e-7bc1-4211-8d9e-66b4a7a37d48',
      groups: ['defaultGroup', 'writeGroup'],
      name: 'Azure-dev User',
      otherAccessTokenFields: {
        given_name: 'Normal',
        family_name: 'User',
      },
      project: 'discover-e2e-azure-dev',
      roles: [],
      tokenId: 'discover-e2e',
      userId: 'discover-e2e-azure-dev-user', // this is overwritten by os.hostname()
    },
    {
      cluster: 'azure-dev',
      fakeApplicationId: '808c3e2e-7bc1-4211-8d9e-66b4a7a37d48',
      groups: ['defaultGroup'],
      name: 'Azure-dev Admin',
      otherAccessTokenFields: {
        given_name: 'Admin',
        family_name: 'User',
      },
      project: 'discover-e2e-azure-dev',
      roles: ['administer'],
      tokenId: 'discover-e2e',
      userId: 'discover-e2e-azure-dev-admin', // this is overwritten by os.hostname()
    },
    {
      cluster: 'bluefield',
      fakeApplicationId: '1f860e84-7353-4533-a088-8fbe3228400f',
      groups: ['defaultGroup', 'readGroup', 'writeGroup'],
      name: 'Bluefield User',
      otherAccessTokenFields: {
        given_name: 'Normal',
        family_name: 'User',
      },
      project: 'discover-e2e-bluefield',
      roles: [],
      tokenId: 'discover-e2e',
      userId: 'discover-e2e-bluefield-user', // this is overwritten by os.hostname()
      // if you need to test expired tokens:
      // customExpiry: Math.floor(new Date().getTime() / 1000) + 10,
    },
    {
      cluster: 'bluefield',
      fakeApplicationId: '1f860e84-7353-4533-a088-8fbe3228400f',
      groups: ['defaultGroup', 'adminGroup'],
      name: 'Bluefield Dev',
      otherAccessTokenFields: {
        given_name: 'Normal',
        family_name: 'Dev',
      },
      project: 'discover-dev-bluefield',
      roles: [],
      tokenId: 'discover-dev',
      userId: 'discover-dev-bluefield-user', // this is overwritten by os.hostname()
      // if you need to test expired tokens:
      // customExpiry: Math.floor(new Date().getTime() / 1000) + 10,
    },
    {
      cluster: 'bluefield',
      fakeApplicationId: '1f860e84-7353-4533-a088-8fbe3228400f',
      groups: ['defaultGroup', 'readGroup', 'writeGroup'],
      name: 'Bluefield Admin',
      otherAccessTokenFields: {
        given_name: 'Admin',
        family_name: 'User',
      },
      project: 'discover-e2e-bluefield',
      roles: ['administer'],
      tokenId: 'discover-e2e',
      userId: 'discover-e2e-bluefield-admin', // this is overwritten by os.hostname()
    },
  ],
  disableIntercom: false,
};
