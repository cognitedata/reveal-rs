import { describe, expect, test, vi, beforeEach } from 'vitest';
import React, { type JSX } from 'react';
import { CogniteClient } from '@cognite/sdk';

import { renderHook } from '@testing-library/react';

import { useRemoveNonReferencedModels } from '../../../../src/components/Reveal3DResources/hooks/useRemoveNonReferencedModels';

import {
  viewerImage360CollectionsMock,
  viewerMock,
  viewerModelsMock,
  viewerRemoveModelsMock
} from '../../fixtures/viewer';
import { Reveal3DResourcesInfoContextProvider } from '../../../../src/components/Reveal3DResources/Reveal3DResourcesInfoContext';
import { cadMock, cadModelOptions } from '../../fixtures/cadModel';
import { pointCloudMock, pointCloudModelOptions } from '../../fixtures/pointCloud';
import { image360Mock, image360Options } from '../../fixtures/image360';
import { EMPTY_ARRAY } from '../../../../src/utilities/constants';
import { RevealRenderTarget } from '../../../../src/architecture';

function createRenderTargetMock(): RevealRenderTarget {
  const sdk = new CogniteClient({
    appId: 'not-in-use',
    baseUrl: '',
    project: '',
    getToken: async () => await Promise.resolve('')
  });
  return new RevealRenderTarget(viewerMock, sdk);
}

describe(useRemoveNonReferencedModels.name, () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }): JSX.Element => (
    <Reveal3DResourcesInfoContextProvider>{children}</Reveal3DResourcesInfoContextProvider>
  );
  test('does not crash when no models are added', () => {
    const renderTarget = createRenderTargetMock();
    viewerModelsMock.mockReturnValue([]);
    viewerImage360CollectionsMock.mockReturnValue([]);
    expect(() =>
      renderHook(
        () => {
          useRemoveNonReferencedModels(EMPTY_ARRAY, renderTarget);
        },
        { wrapper }
      )
    ).not.toThrow();
  });

  test('removes models when empty ', () => {
    const renderTarget = createRenderTargetMock();
    viewerModelsMock.mockReturnValue([cadMock]);
    viewerImage360CollectionsMock.mockReturnValue([]);
    renderHook(
      () => {
        useRemoveNonReferencedModels(EMPTY_ARRAY, renderTarget);
      },
      { wrapper }
    );
    expect(viewerRemoveModelsMock).toHaveBeenCalledOnce();
  });

  test('does not remove models when in addOptions', () => {
    const renderTarget = createRenderTargetMock();
    viewerModelsMock.mockReturnValue([pointCloudMock, cadMock]);
    viewerImage360CollectionsMock.mockReturnValue([image360Mock]);
    const mockAddOptions = [pointCloudModelOptions, cadModelOptions, image360Options];
    renderHook(
      () => {
        useRemoveNonReferencedModels(mockAddOptions, renderTarget);
      },
      { wrapper }
    );
    expect(viewerRemoveModelsMock).not.toHaveBeenCalled();
  });

  test('removes only relevant model', () => {
    const renderTarget = createRenderTargetMock();
    viewerModelsMock.mockReturnValue([pointCloudMock, cadMock]);
    viewerImage360CollectionsMock.mockReturnValue([image360Mock]);
    const mockAddOptions = [cadModelOptions, image360Options];
    renderHook(
      () => {
        useRemoveNonReferencedModels(mockAddOptions, renderTarget);
      },
      { wrapper }
    );
    expect(viewerRemoveModelsMock).toHaveBeenCalledWith(pointCloudMock);
  });
});
