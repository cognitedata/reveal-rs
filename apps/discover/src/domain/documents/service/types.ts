import { DocumentCategories } from '@cognite/discover-api-types';

import { GenericApiError, BaseAPIResult } from 'core/types';

export type DocumentError = GenericApiError;

export interface DocumentCategoriesResult extends BaseAPIResult {
  data: DocumentCategories;
}

export type DocumentFeedbackType = 'accept' | 'reject';

export enum ActionType {
  ATTACH = 'ATTACH',
  DETACH = 'DETACH',
}

export type DocumentFeedbackCreateBody = {
  documentId: number;
  label: {
    externalId: string;
  };
  action: ActionType;
  reporterInfo?: string;
};

export type DocumentFeedbackCreateResponse = DocumentFeedbackCreateBody & {
  status: 'CREATED' | 'ACCEPTED' | 'REJECTED' | 'STALE';
  feedbackId: number;
  createdAt: string;
};

export type DocumentFeedbackListResponse = DocumentFeedbackCreateResponse & {
  reviewedAt: string;
};

export type DocumentFeedbackJudgeBody = {
  id: number;
};
