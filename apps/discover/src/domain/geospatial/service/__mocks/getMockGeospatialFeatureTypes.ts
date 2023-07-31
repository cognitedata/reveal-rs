import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { SIDECAR } from 'constants/app';

import { TEST_ERROR_MESSAGE } from '../../constants';

export const getMockGeospatialFeatureTypes = () => {
  const url = `${SIDECAR.cdfApiBaseUrl}/api/v1/projects/${TEST_PROJECT}/geospatial/featuretypes`;
  return rest.post<Request>(url, (_req, res, ctx) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!_req.body.items[0]?.externalId) {
      ctx.status(400);
      return res(ctx.status(400), ctx.json(new Error(TEST_ERROR_MESSAGE)));
    }
    return res(ctx.json(_req.body));
  });
};
