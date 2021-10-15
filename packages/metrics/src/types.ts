import { Dict } from 'mixpanel-browser';

export type Callback = () => void;

export type Properties = Dict;

export interface ITimer {
  stop: (props?: Properties, callback?: Callback) => void;
}

export interface MetricsDebugger {
  readonly isDebug?: boolean;
  track: (event: string, props: Properties) => void;
  stop: (event: string, props: Properties) => void;
}

export type InitOptions = {
  mixpanelToken: string;
  metricsDebugger?: MetricsDebugger;
  persistence?: 'cookie' | 'localStorage';
} & Properties;

export type Stub = {
  start: () => { stop: () => undefined };
  track: () => undefined;
};
