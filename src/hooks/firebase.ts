import { useSDK } from '@cognite/sdk-provider';
import config from 'config';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getTenantFromURL } from 'utils/env';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { useLoginStatus } from 'hooks';
import { Chart, ChartWorkflow } from 'reducers/charts/types';

type EnvironmentConfig = {
  cognite: {
    project: string;
    baseUrl?: string;
  };
  firebase: {
    databaseURL: string;
  };
};

type LoginToFirebaseResponse = {
  firebaseToken: string;
  experiments: string[];
};

type GetEnvironmentResponse = {
  tenant: string;
  config: EnvironmentConfig;
};

const APPS_API_BASE_URL = config.appsApiBaseURL;
const APP_NAME = config.appName;

const cacheOption = {
  staleTime: Infinity,
  cacheTime: Infinity,
};

const useFirebaseToken = (enabled: boolean) => {
  const sdk = useSDK();
  const project = getTenantFromURL();

  return useQuery<string>(
    ['firebase', 'token'],
    () =>
      sdk
        .get<LoginToFirebaseResponse>(`${APPS_API_BASE_URL}/login/firebase`, {
          params: {
            tenant: project,
            app: APP_NAME,
            json: true,
          },
          withCredentials: true,
        })
        .then((result) => {
          const {
            data: { firebaseToken: nextFirebaseToken },
          } = result;
          return nextFirebaseToken as string;
        }),
    { ...cacheOption, enabled }
  );
};

const useFirebaseEnv = (enabled: boolean) => {
  const sdk = useSDK();
  const project = getTenantFromURL();

  return useQuery<EnvironmentConfig>(
    ['firebase', 'env'],
    () =>
      sdk
        .get<GetEnvironmentResponse>(`${APPS_API_BASE_URL}/env`, {
          params: {
            tenant: project,
            app: APP_NAME,
            version: '0.0.0',
          },
          withCredentials: true,
        })
        .then((result) => result.data.config),
    { ...cacheOption, enabled }
  );
};

export const useFirebaseInit = (enabled: boolean) => {
  const { data: token, isFetched: tokenFetched } = useFirebaseToken(enabled);
  const { data: env, isFetched: configFetched } = useFirebaseEnv(enabled);

  return useQuery(
    ['firebase', 'init'],
    async () => {
      if (firebase.apps.length !== 0) {
        // If we're already initialized, don't do it again
        return true;
      }
      firebase.initializeApp(env?.firebase as any);

      await firebase.auth().signInWithCustomToken(token as string);
      firebase.firestore().settings({ experimentalForceLongPolling: true });
      return true;
    },
    {
      ...cacheOption,
      enabled: enabled && tokenFetched && configFetched && !!token && !!env,
    }
  );
};

const charts = () => {
  return firebase
    .firestore()
    .collection('tenants')
    .doc(getTenantFromURL())
    .collection('charts');
};

export const useMyCharts = () => {
  const { data } = useLoginStatus();

  return useQuery(
    ['charts', 'mine'],
    async () => {
      const snapshot = await charts().where('user', '==', data?.user).get();
      return snapshot.docs.map((doc) => doc.data()) as Chart[];
    },
    { enabled: !!data?.user }
  );
};

export const usePublicCharts = () => {
  const { data } = useLoginStatus();

  return useQuery(
    ['charts', 'public'],
    async () => {
      const snapshot = await charts().where('public', '==', true).get();
      return snapshot.docs.map((doc) => doc.data()) as Chart[];
    },
    { enabled: !!data?.user }
  );
};

export const useChart = (id: string) => {
  return useQuery(['charts', id], async () => {
    const snapshot = await charts().where('id', '==', id).get();
    return snapshot.docs.map((doc) => doc.data())[0] as Chart;
  });
};

export const useDeleteChart = () => {
  return useMutation(
    async (chartId: string) => charts().doc(chartId).delete(),
    {
      onSuccess() {
        const cache = useQueryClient();
        cache.invalidateQueries(['charts']);
      },
    }
  );
};

export const useUpdateChart = () => {
  return useMutation(
    async (chart: Chart) => charts().doc(chart.id).set(chart),
    {
      onSuccess() {
        const cache = useQueryClient();
        cache.invalidateQueries(['charts']);
      },
    }
  );
};

export const useUpdateWorkflow = () => {
  return useMutation(
    async ({
      chartId,
      workflowCollection,
    }: {
      chartId: string;
      workflowCollection: ChartWorkflow[];
    }) => charts().doc(chartId).update({ workflowCollection }),
    {
      onSuccess() {
        const cache = useQueryClient();
        cache.invalidateQueries(['charts']);
      },
    }
  );
};
