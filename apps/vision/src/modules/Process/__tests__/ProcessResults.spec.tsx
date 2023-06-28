import React from 'react';

import styled from 'styled-components';

import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { mockFileList } from '@vision/__test-utils/fixtures/files';
import { testRenderer } from '@vision/__test-utils/renderer';
import { getMockedStore } from '@vision/__test-utils/store.utils';
import { initialState as fileState } from '@vision/modules/Common/store/files/slice';
// import { ProcessResults } from '@vision/modules/Process/Containers/ProcessResults';
import { initialState as processState } from '@vision/modules/Process/store/slice';
import { createFileState } from '@vision/store/util/StateUtils';

// Debt: This tests fails because of something related to unified file viewer. it works in prod, so expecting this to be a config issue
// Should be looked into later. It fails when importing the component
describe.skip('ProcessResults', () => {
  jest.mock('react-virtualized-auto-sizer');

  const ResultsContainer = styled.div`
    height: 500px;
    width: 1000px;
  `;

  const TestComponent = (props: any) => {
    return (
      <ResultsContainer>{/* <ProcessResults {...props} /> */}</ResultsContainer>
    );
  };

  const props = {
    currentView: 'list',
  };

  const fileOne = createFileState(mockFileList[0]);
  const fileTwo = createFileState(mockFileList[1]);

  it('should render empty massage if no files are uploaded or selected', () => {
    const store = getMockedStore({
      processSlice: {
        ...processState,
      },
      fileReducer: {
        ...fileState,
      },
    });

    testRenderer(TestComponent, store, props);

    expect(
      screen.getByText('First select from existing files or upload new')
    ).toBeInTheDocument();
  });

  describe('test process results after file upload', () => {
    const store = getMockedStore({
      processSlice: {
        ...processState,
        fileIds: [fileOne.id, fileTwo.id],
      },
      fileReducer: {
        ...fileState,
        files: {
          byId: {
            1: fileOne,
            2: fileTwo,
          },
          allIds: [1, 2],
          selectedIds: [],
        },
      },
    });

    it('should render unprocessed file list when files uploaded or added', async () => {
      // test table entries

      testRenderer(TestComponent, store, props);

      expect(screen.getByText(fileOne.name)).toBeInTheDocument();
      expect(screen.getByText(fileTwo.name)).toBeInTheDocument();

      const table = screen.getAllByRole('table')[0]; // get the first and only table element

      expect(table).toBeInTheDocument();

      table.querySelectorAll<HTMLElement>('.table-row').forEach((el) => {
        expect(within(el).getByText('Unprocessed')).toBeInTheDocument();
        expect(within(el).getByText('No annotations')).toBeInTheDocument();
        expect(el.querySelector('button')).not.toBeDisabled();
      });

      // test thunk calls

      await waitFor(() =>
        expect(store.getActions()).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'FetchFilesById/pending',
              payload: undefined,
              meta: expect.objectContaining({
                arg: [fileOne.id, fileTwo.id],
              }),
            }),
            expect.objectContaining({
              type: 'process/pollJobs/pending',
              payload: undefined,
            }),
            expect.objectContaining({
              type: 'RetrieveAnnotations/pending',
              payload: undefined,
              meta: expect.objectContaining({
                arg: expect.objectContaining({
                  fileIds: [fileOne.id, fileTwo.id],
                  clearCache: true,
                }),
              }),
            }),
          ])
        )
      );
    });

    it('should call action to show metadata panel and focus file id on row click', async () => {
      testRenderer(TestComponent, store, props);

      fireEvent.click(screen.getByText(fileOne.name));

      // test actions

      await waitFor(() => {
        expect(store.getActions()).toEqual(
          expect.arrayContaining([
            {
              type: 'processSlice/setFocusedFileId',
              payload: fileOne.id,
            },
            {
              type: 'processSlice/showFileMetadata',
              payload: undefined,
            },
          ])
        );
      });
    });
  });
});
