import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';

import {
  CogniteIdPResponse,
  CogIdpProject,
  ListCogIdpProjectsResponse,
  PublicOrgResponse,
} from '../types';

import {
  getApp,
  getBaseUrl,
  getRequiredOrganization,
  isPreviewDeployment,
  setRedirectCookieForPreviewDeployment,
  setLoginOrganizationCookie,
} from './loginInfo';

export const cogIdpAuthority = 'https://auth.cognite.com';
export const cogIdpInternalId = 'ff16d970-0491-415a-ab4b-3ba9eb65ac4a';

export const cogIdpAsResponse = (
  projects: CogIdpProject[] = []
): CogniteIdPResponse => ({
  authority: cogIdpAuthority,
  internalId: cogIdpInternalId,
  type: 'COGNITE_IDP',
  clusters: [
    ...new Set(projects.map((project) => removeProtocol(project.apiUrl))),
  ],
  projects: projects,
  appConfiguration: {
    clientId: getClientId(),
  },
});

const removeProtocol = (url: string) => new URL(url).host;

const getRedirectUri = () => {
  if (isPreviewDeployment) {
    return 'https://oauth.preview.cogniteapp.com/signin/callback';
  }
  return `${getBaseUrl()}/signin/callback`;
};

// If we have multiple instances of UserManager we will perform multiple parallel token refresh requests.
// This will be rejected by CogIdP. Therefore, we must take care to only use one instance of User Manager
// per authority/client_id combination.
const userManagerCache = new Map<string, UserManager>(); // key: authority|||client_id
export const getCogniteIdPUserManager = (params: {
  authority: string;
  client_id: string;
}) => {
  const cacheKey = `${params.authority}|||${params.client_id}`;
  const cachedUserManager = userManagerCache.get(cacheKey);
  if (cachedUserManager) {
    return cachedUserManager;
  }
  const userManager = new UserManager({
    authority: params.authority,
    client_id: params.client_id,
    redirect_uri: getRedirectUri(),
    scope: `openid offline_access email profile`,
    automaticSilentRenew: true,
    accessTokenExpiringNotificationTimeInSeconds: 180,
    userStore: new WebStorageStateStore({
      store: window.localStorage,
      prefix: `oidc:user:${params.authority}/`,
    }),
    stateStore: new WebStorageStateStore({
      store: window.localStorage,
      prefix: `oidc:state:${params.authority}/`,
    }),
  });
  userManagerCache.set(cacheKey, userManager);
  return userManager;
};

export const getCogniteIdPToken = async (userManager: UserManager) => {
  const organization = getRequiredOrganization();
  try {
    let user = await userManager.getUser();
    if (user?.expired) {
      await cogniteIdPSignInRedirect(userManager, organization);
    }
    if (!user?.access_token) {
      return undefined;
    }
    return user.access_token;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
    return undefined;
  }
};

export type CogIdPState = {
  pathname: string;
  search: string;
};

export const getCogIdPState = (user: User) => user.state as CogIdPState;

export const cogniteIdPSignInRedirect = async (
  userManager: UserManager,
  organization: string
) => {
  const org = getRequiredOrganization();
  if (isPreviewDeployment) {
    const redirectTo = new URL(window.location.href);
    redirectTo.pathname = `/`;
    setRedirectCookieForPreviewDeployment(redirectTo.href);
  } else {
    setLoginOrganizationCookie(org);
  }
  const { pathname, search } = window.location;
  const state: CogIdPState = {
    pathname,
    search,
  };
  await userManager.signinRedirect({
    state,
    extraQueryParams: {
      organization_hint: organization,
    },
  });
};

export const getPublicOrg = async (
  options: { timeout?: number } = {}
): Promise<PublicOrgResponse | undefined> => {
  const organization = getRequiredOrganization();

  const controller = new AbortController();
  if (options.timeout) {
    setTimeout(() => controller.abort(), options.timeout);
  }

  const response = await fetch(
    `${cogIdpAuthority}/api/v0/orgs/${organization}/public?includeMigrationStatus=true`,
    {
      signal: controller.signal,
    }
  );
  if (!response.ok) {
    return undefined;
  }
  return await response.json();
};

export const getProjectsForCogIdpOrg = async (
  token?: string
): Promise<ListCogIdpProjectsResponse | undefined> => {
  if (!token) {
    return undefined;
  }
  const organization = getRequiredOrganization();

  const response = await fetch(
    `${cogIdpAuthority}/api/v0/orgs/${organization}/projects`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    return undefined;
  }
  return await response.json();
};

export const getClientId = () => {
  const app = getApp();
  if (app === 'fusion') {
    return '012c261c-0c5c-4ff6-9af1-20b9dfd81352';
  } else if (app === 'fusion-dev') {
    return 'e28859b5-1db0-44df-bbf3-d0a06758eecc';
  } else {
    throw new Error(`Unknown app: ${app}`);
  }
};
