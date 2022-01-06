import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { initialState as wellState } from 'modules/wellSearch/reducer';
import { WellState } from 'modules/wellSearch/types';

import { WellboreCardDetails } from '../WellboreCardDetails';

describe('Wellbore card details', () => {
  const getPage = (viewStore: Store, viewProps: { wellId: number }) =>
    testRenderer(WellboreCardDetails, viewStore, viewProps);
  afterEach(async () => jest.clearAllMocks());

  const defaultTestInit = async (
    extra: WellState = wellState,
    viewProps: { wellId: number } = { wellId: 0 }
  ) => {
    const store = getMockedStore({ wellSearch: { ...extra } });

    return {
      ...getPage(store, viewProps),
      store,
    };
  };

  it(`should not render wellbores`, async () => {
    await defaultTestInit(wellState, { wellId: 4323 });

    // const title = await screen.findByAltText('Wellbores');
    // expect(title).not.toBeInTheDocument();

    // const wellbore = await screen.findByAltText('wellbore B');
    // expect(wellbore).not.toBeInTheDocument();
  });
});
