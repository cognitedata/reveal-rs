import { MSWRequest } from '@data-exploration-lib/core';
import { rest } from 'msw';

import { TEST_PROJECT } from '../../__mocks';
import { mock3dModels } from '../__fixtures/mock3dModels';
import { mock3dRevisions } from '../__fixtures/mock3dRevisions';

export const mockModelObj = mock3dModels.items[0];
export const getMock3DRevisions = (): MSWRequest => {
  return rest.get<Request>(
    `https://api.cognitedata.com/api/v1/projects/${TEST_PROJECT}/3d/models/${mockModelObj.id}/revisions`,
    (_req, res, ctx) => {
      return res(ctx.json(mock3dRevisions));
    }
  );
};
