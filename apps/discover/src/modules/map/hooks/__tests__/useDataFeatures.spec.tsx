import '__mocks/mockCogniteSDK';
import 'domain/wells/__mocks/setupWellsMockSDK';

import { getDocumentFixture } from 'domain/documents/service/__fixtures/getDocumentFixture';
import { getMockDocumentSearch } from 'domain/documents/service/__mocks/getMockDocumentSearch';
import { getMockConfigGet } from 'domain/projectConfig/service/__mocks/getMockConfigGet';
import { getMockWellsGeometry } from 'domain/wells/well/service/__mocks/getMockWellsGeometry';

import { screen, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { getMockPointGeo } from '__test-utils/fixtures/geometry';
import { getMockWellGeometry } from '__test-utils/fixtures/wellGeometryCollection';
import { getWrapper, testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import {
  ExternalWellsFeature,
  useDataFeatures,
} from 'modules/map/hooks/useDataFeatures';
import {
  DOCUMENT_LAYER_ID,
  WELL_HEADS_LAYER_ID,
} from 'pages/authorized/search/map/constants';

const selectedLayers = [WELL_HEADS_LAYER_ID, DOCUMENT_LAYER_ID];

const mockServer = setupServer();

// TODO(PP-2924): will be fixed by this ticket
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('useDataFeatures', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  beforeEach(jest.clearAllMocks);
  beforeEach(() => {
    jest.clearAllMocks();
    mockServer.resetHandlers();
  });

  it('should return empty array for empty state', async () => {
    mockServer.use(
      getMockWellsGeometry(),
      getMockDocumentSearch(),
      getMockConfigGet()
    );

    const store = getMockedStore();

    const { result } = renderHook(() => useDataFeatures(selectedLayers, []), {
      wrapper: getWrapper(store),
    });

    expect(result.current.features).toHaveLength(0);
  });

  it('should return empty array for documents and wells without geolocation', async () => {
    mockServer.use(
      // getMockWellsGeometry(),
      getMockDocumentSearch({
        items: [{ item: getDocumentFixture({ geoLocation: undefined }) }],
      }),
      getMockConfigGet()
    );

    const store = getMockedStore({
      wellSearch: {
        selectedWellIds: {
          1: true,
        },
      },
    });

    const { result, waitForNextUpdate } = await renderHook(
      () => useDataFeatures(selectedLayers, []),
      {
        wrapper: getWrapper(store),
      }
    );
    await waitForNextUpdate();

    expect(result.current.features).toHaveLength(0);
  });

  it('should return correct data for documents and wells that have geolocation', async () => {
    mockServer.use(
      getMockWellsGeometry(),
      getMockDocumentSearch(),
      getMockConfigGet()
    );

    const store = getMockedStore({
      wellSearch: {
        selectedWellIds: {
          1: true,
        },
      },
    });

    const TestComponent: React.FC = () => {
      const data = useDataFeatures(selectedLayers, []);
      return <div>Total: {data.features.length}</div>;
    };

    await testRenderer(TestComponent, store);

    expect(await screen.findByText('Total: 2')).toBeInTheDocument();
  });

  it('should return correct data from state and remote wells', async () => {
    mockServer.use(
      getMockWellsGeometry(),
      getMockDocumentSearch(),
      getMockConfigGet()
    );

    const externalWells: ExternalWellsFeature[] = [
      {
        id: 123,
        type: 'Feature',
        geometry: {
          type: 'GeometryCollection',
          geometries: [getMockPointGeo()],
        },
        properties: {
          id: 123454,
        },
      },
    ];

    const store = getMockedStore({
      wellSearch: {
        selectedWellIds: {
          1: true,
        },
      },
    });

    const TestComponent: React.FC = () => {
      const data = useDataFeatures(selectedLayers, externalWells);
      return (
        <>
          {data?.features.map((well, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <button type="button" key={index}>
              {well.id || well?.properties?.id || 'Empty'}
            </button>
          ))}
        </>
      );
    };

    await testRenderer(TestComponent, store);

    expect(
      await screen.findByRole('button', { name: /123/i })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /well-collection-1/ })
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('button', { name: /Empty/i })
    ).toBeInTheDocument();
    expect(await (await screen.findAllByRole('button')).length).toEqual(3);
  });

  it('should return empty array when no layers are selected based on data from state and remote wells', async () => {
    mockServer.use(
      getMockWellsGeometry(),
      getMockDocumentSearch(),
      getMockConfigGet()
    );

    const externalWells: ExternalWellsFeature[] = [
      {
        id: 123,
        type: 'Feature',
        geometry: {
          type: 'GeometryCollection',
          geometries: [getMockPointGeo()],
        },
        properties: {
          id: 124,
        },
      },
    ];

    const store = getMockedStore({
      wellSearch: {
        selectedWellIds: {
          1: true,
        },
      },
    });

    const { result, waitForNextUpdate } = renderHook(
      () => useDataFeatures([], externalWells),
      {
        wrapper: getWrapper(store),
      }
    );

    await waitForNextUpdate();

    expect(result.current.features).toHaveLength(0);
  });

  it('should set isBlurred and isSelected properties correctly', async () => {
    mockServer.use(
      getMockWellsGeometry(),
      getMockDocumentSearch(),
      getMockConfigGet()
    );

    const externalWells: ExternalWellsFeature[] = [
      {
        id: 123,
        type: 'Feature',
        geometry: {
          type: 'GeometryCollection',
          geometries: [getMockPointGeo()],
        },
        properties: {
          id: 123,
        },
      },
    ];

    const store = getMockedStore({
      documentSearch: {
        selectedDocumentIds: ['123', '2'],
      },
      wellSearch: {
        selectedWellIds: {
          1: false,
        },
      },
    });

    const TestComponent: React.FC = () => {
      const data = useDataFeatures(selectedLayers, externalWells);
      return (
        <>
          {data?.features.map((well) => {
            const id = `${well.id || well?.properties?.id}:${
              well.properties?.isSelected
            }:${well.properties?.isBlurred}`;
            return (
              <button type="button" key={id}>
                {id}
              </button>
            );
          })}
        </>
      );
    };

    await testRenderer(TestComponent, store);

    // documents is selected so isblurred is false
    expect(
      await screen.findByRole('button', { name: /:true:false/ })
    ).toBeInTheDocument();

    // well should have isBlurred true since its not selected and there are documents selected
    expect(
      await screen.findByRole('button', {
        name: /123:false:true/,
      })
    ).toBeInTheDocument();

    // remote well heads are cannot be selected and they are blurred if any document or well is selected
    expect(
      await screen.findByRole('button', {
        name: /well-collection-1:false:true/,
      })
    ).toBeInTheDocument();
  });

  it('should remove external wells that have same id as wells from results', async () => {
    mockServer.use(
      getMockWellsGeometry(),
      getMockDocumentSearch(),
      getMockConfigGet()
    );

    const externalWells: ExternalWellsFeature[] = [
      {
        id: 111,
        type: 'Feature',
        geometry: {
          type: 'GeometryCollection',
          geometries: [getMockPointGeo()],
        },
        properties: {
          id: 111,
        },
      },
      {
        id: 222,
        type: 'Feature',
        geometry: {
          type: 'GeometryCollection',
          geometries: [getMockPointGeo()],
        },
        properties: {
          id: 222,
        },
      },
    ];

    const store = getMockedStore({
      wellSearch: {
        selectedWellIds: {
          111: true, // this is the duplicate
          222: true,
          444: true, // this is NOT the duplicate, since the main ID does not match it
        },
      },
    });

    const TestComponent: React.FC = () => {
      const data = useDataFeatures(selectedLayers, externalWells);
      return (
        <>
          {data?.features.map((well) => (
            <button type="button" key={`id-${well.id || well?.properties?.id}`}>
              {well.id || well?.properties?.id}
            </button>
          ))}
        </>
      );
    };

    await testRenderer(TestComponent, store);

    // eslint-disable-next-line
    await waitFor(() =>
      expect(
        screen.getByRole('button', {
          name: getMockWellGeometry().properties.id,
        })
      ).toBeInTheDocument()
    );

    // NOTE: i suspect there is something wrong here
    // this is not showing 444 but i think it should
    await waitFor(() =>
      expect(screen.getAllByRole('button').length).toEqual(4)
    );
  });
});
