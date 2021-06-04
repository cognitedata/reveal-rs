// config here is ONLY for local dev
window.__cogniteSidecar = {
  // FakeIdp is used for e2e tests fake authentication
  fakeIdp: [
    {
      roles: [],
      groups: ['defaultGroup'],
      fakeApplicationId: 'user',
      // project to run e2e tests against
      project: 'react-demo-app-e2e-azure-dev',
      // to match `Login with Fake IDP (react-demo-app-e2e-azure-dev)` button
      name: 'react-demo-app-e2e-azure-dev',
      cluster: 'azure-dev',
    },
  ],
};
