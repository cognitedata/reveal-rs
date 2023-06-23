export interface RelationshipResource {
  resource:
    | 'timeSeries'
    | 'threeD'
    | 'threeDRevision'
    | 'asset'
    | 'event'
    | 'file';
  resourceId: string;
}

export type RelationshipType =
  | 'flowsTo'
  | 'belongsTo'
  | 'isParentOf'
  | 'implements';
export interface Relationship {
  source: RelationshipResource;
  target: RelationshipResource;
  confidence: number;
  dataSet: string;
  externalId: string;
  relationshipType: RelationshipType;
}

export type Runtime = 'py37' | 'py38' | 'py39' | 'py310' | 'py311' | 'py312'; // Future proofing.

export interface CogFunctionUpload {
  name: string;
  fileId: number;
  owner: string;
  description?: string;
  apiKey?: string;
  memory?: number;
  cpu?: number;
  secrets?: unknown;
  metadata?: unknown;
  externalId?: string;
  runtime?: Runtime;
}

export interface CogFunction extends CogFunctionUpload {
  id: number;
  createdTime: number;
  status: 'Queued' | 'Deploying' | 'Ready' | 'Failed';
  error?: Error;
  runtimeVersion?: string;
}

export interface CogFunctionLimit {
  timeoutMinutes: number;
  cpuCores: {
    default: number;
    max: number;
    min: number;
  };
  memoryGb: {
    default: number;
    max: number;
    min: number;
  };
  runtimes: Runtime[];
  responseSizeMb: number;
  vendor?: string;
}

export interface Error {
  message: string;
  trace: string;
}

type CallStatus = 'Running' | 'Completed' | 'Failed' | 'Timeout';

export interface CallResponse {
  id: number;
  functionId: number;
  response: any;
  startTime?: number;
  endTime?: number;
  status: CallStatus;
}

export interface Call extends CallResponse {
  startTime: number;
  endTime: number;
  error?: Error;
}

export interface Log {
  timestamp: number;
  message: string;
}

export interface ClientCredentials {
  clientId: string;
  clientSecret: string;
}

export interface CreateSchedule {
  name: string;
  description?: string;
  functionExternalId?: string;
  functionId?: number;
  cronExpression: string;
  data?: unknown;
}

export interface CreateScheduleApiParams {
  schedule: CreateSchedule;
  clientCredentials?: ClientCredentials;
}
export interface Schedule extends CreateSchedule {
  id: number;
  createdTime: number;
}
export type GetCallsArgs = {
  id: number;
  scheduleId?: number;
};
export type GetCallArgs = {
  id: number;
  callId: number;
};
