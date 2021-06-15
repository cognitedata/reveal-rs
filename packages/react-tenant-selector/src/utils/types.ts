// we need to make a more generic place to move this type into
import { IntercomBootSettings } from '@cognite/intercom-helper';

export type FakeIdp = {
  roles: string[];
  groups: string[];
  project: string;
  cluster: string;
  name?: string;
  fakeApplicationId: string;
  otherIdTokenFields: Record<string, string>;
  otherAccessTokenFields: Record<string, string>;
};

export type SidecarConfig = {
  __sidecarFormatVersion: number;
  aadApplicationId?: string;
  AADTenantID?: string;
  applicationId: string;
  applicationName: string;
  appsApiBaseUrl: string;
  backgroundImage?: string;
  cdfApiBaseUrl: string;
  cdfCluster: string;
  directoryTenantId?: string;
  disableTranslations?: boolean;
  disableLegacyLogin?: boolean;
  disableAzureLogin?: boolean;
  helpLink?: string;
  intercom?: string;
  intercomSettings?: IntercomBootSettings;
  locize?: {
    apiKey?: string;
    projectId: string;
    version?: string;
    keySeparator?: false | string;
  };
  fakeIdp?: FakeIdp[];
};
