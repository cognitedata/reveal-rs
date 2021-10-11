import { Geometry } from '@cognite/seismic-sdk-js';

export interface BaseAPIResult {
  success?: string;
  updated?: boolean;
  error?: boolean;
}

// fix this in api next:
export type RawSeismicMetadata = [string, string][];
export interface SeismicFile {
  id: string;
  name: string;
  crs?: string;
  geometry?: Geometry;
  metadata: RawSeismicMetadata;
}
export interface SeismicSurvey {
  id: string;
  name: string;
  geometry?: Geometry;
}

export interface SeismicGetData {
  survey: SeismicSurvey;
  files: SeismicFile[];
}
export interface SeismicGetResult extends BaseAPIResult {
  data: SeismicGetData;
}
export interface SeismicSearchResult extends BaseAPIResult {
  data: {
    results: SeismicGetData[];
  };
}

export type GenericApiError = {
  error: boolean;
};
