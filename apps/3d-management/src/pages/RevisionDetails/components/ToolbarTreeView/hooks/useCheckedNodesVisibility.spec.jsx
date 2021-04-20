import { useCheckedNodesVisibility } from 'src/pages/RevisionDetails/components/ToolbarTreeView/hooks/useCheckedNodesVisibility';
import { getNodeByTreeIndex } from 'src/pages/RevisionDetails/components/TreeView/utils/treeFunctions';
import { render } from '@testing-library/react';
import React from 'react';
import { sleep } from 'src/utils';

function TestComponent({ model, treeData, checkedKeys }) {
  useCheckedNodesVisibility({ model, treeData, checkedKeys });
  return null;
}
describe('useCheckedNodesVisibility tests', () => {
  it('correctly updates nodes visibility in reveal', async () => {
    const allTreeIndexes = [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
    ].sort();
    const treeData = [
      {
        key: 0,
        meta: {
          id: 7587176698924415,
          treeIndex: 0,
          depth: 0,
          name: 'RootNode',
          subtreeSize: allTreeIndexes.length,
        },
        children: [
          {
            key: 2,
            meta: {
              id: 4118495943076177,
              treeIndex: 2,
              parentId: 7587176698924415,
              depth: 1,
              name: 'Camera',
              subtreeSize: 1,
            },
          },
          {
            key: 3, // 3,4,5,6,7
            meta: {
              id: 3518215128723287,
              treeIndex: 3,
              parentId: 7587176698924415,
              depth: 1,
              name: 'Cube',
              subtreeSize: 5,
            },
            children: [
              {
                key: 4,
                meta: {
                  id: 172917895243234,
                  treeIndex: 4,
                  parentId: 3518215128723287,
                  depth: 2,
                  name: 'Cube (1)',
                  subtreeSize: 1,
                },
              },
              {
                key: 5,
                meta: {
                  id: 5528114778128032,
                  treeIndex: 5,
                  parentId: 3518215128723287,
                  depth: 2,
                  name: 'Cube (2)',
                  subtreeSize: 1,
                },
              },
              {
                key: 6,
                meta: {
                  id: 4086799595416334,
                  treeIndex: 6,
                  parentId: 3518215128723287,
                  depth: 2,
                  name: 'Cube (3)',
                  subtreeSize: 1,
                },
              },
              {
                key: 7,
                meta: {
                  id: 6444092424355782,
                  treeIndex: 7,
                  parentId: 3518215128723287,
                  depth: 2,
                  name: 'Cube (4)',
                  subtreeSize: 1,
                  boundingBox: {
                    max: [100, 100.00001525878906, 100.00001525878906],
                    min: [-100, -100.00001525878906, -100.00001525878906],
                  },
                },
              },
            ],
          },
          {
            key: 1,
            meta: {
              id: 6025029534731389,
              treeIndex: 1,
              parentId: 7587176698924415,
              depth: 1,
              name: 'Light',
              subtreeSize: 1,
            },
          },
          {
            key: 8, // 8, (9)
            meta: {
              id: 888,
              treeIndex: 8,
              parentId: 7587176698924415,
              depth: 1,
              name: 'Fake child with not fetched children',
              subtreeSize: 2,
            },
          },
          {
            key: 10, // 10, 11, 12, (13)
            meta: {
              id: 10,
              treeIndex: 10,
              parentId: 7587176698924415,
              depth: 1,
              name: 'Fake child with partially fetched children',
              subtreeSize: 4,
            },
            children: [
              {
                key: 11,
                meta: {
                  id: 11,
                  treeIndex: 11,
                  parentId: 10,
                  depth: 1,
                  name: '11',
                  subtreeSize: 1,
                },
              },
              {
                key: 12,
                meta: {
                  id: 12,
                  treeIndex: 12,
                  parentId: 10,
                  depth: 1,
                  name: '12',
                  subtreeSize: 1,
                },
              },
              // 13 is not fetched, but must be correctly visible/hidden in reveal
            ],
          },
        ],
      },
    ];

    const modelMock = {
      allTreeIndexes,
      ownCheckedNodes: new Set(allTreeIndexes),

      async showNodeByTreeIndex(treeIndex, applyToChildren) {
        if (applyToChildren) {
          const { subtreeSize } = getNodeByTreeIndex(treeData, treeIndex).meta;
          for (let i = treeIndex; i < treeIndex + subtreeSize; i++) {
            modelMock.ownCheckedNodes.add(i);
          }
        } else {
          modelMock.ownCheckedNodes.add(treeIndex);
        }
      },
      async hideNodeByTreeIndex(treeIndex, _, applyToChildren) {
        if (applyToChildren) {
          const { subtreeSize } = getNodeByTreeIndex(treeData, treeIndex).meta;
          for (let i = treeIndex; i < treeIndex + subtreeSize; i++) {
            modelMock.ownCheckedNodes.delete(i);
          }
        } else {
          modelMock.ownCheckedNodes.delete(treeIndex);
        }
      },
      async hideAllNodes() {
        modelMock.ownCheckedNodes.clear();
      },
      async showAllNodes() {
        modelMock.ownCheckedNodes = new Set(allTreeIndexes);
      },
    };

    // start with all checked
    const { rerender } = render(
      <TestComponent
        model={modelMock}
        treeData={treeData}
        checkedKeys={[0, 1, 2, 3, 4, 5, 6, 7, 8, /* 9 */ 10, 11, 12 /* 13 */]}
      />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual(allTreeIndexes);

    // uncheck one leaf [2]
    debugger;
    rerender(
      <TestComponent
        model={modelMock}
        treeData={treeData}
        checkedKeys={
          // eslint-disable-next-line prettier/prettier
          [/* 0, */ 1, /* 2, */ 3, 4, 5, 6, 7, 8, /* 9 */ 10, 11, 12 /* 13 */]
        }
      />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual(
      // eslint-disable-next-line prettier/prettier
      [1, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].sort()
    );

    // uncheck all
    rerender(
      <TestComponent model={modelMock} treeData={treeData} checkedKeys={[]} />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual([]);

    // check a child with children [3]

    const hideNodeByTreeIndexSpy = jest.spyOn(modelMock, 'hideNodeByTreeIndex');
    const hideAllNodesSpy = jest.spyOn(modelMock, 'hideAllNodes');
    rerender(
      <TestComponent
        model={modelMock}
        treeData={treeData}
        checkedKeys={[3, 4, 5, 6, 7]}
      />
    );

    await sleep(300);

    expect(hideNodeByTreeIndexSpy).not.toHaveBeenCalled();
    expect(hideAllNodesSpy).not.toHaveBeenCalled();
    expect([...modelMock.ownCheckedNodes].sort()).toEqual([3, 4, 5, 6, 7]);

    // check all [0]
    rerender(
      <TestComponent
        model={modelMock}
        treeData={treeData}
        checkedKeys={[0, 1, 2, 3, 4, 5, 6, 7, 8, /* 9 */ 10, 11, 12 /* 13 */]}
      />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual(allTreeIndexes);

    // uncheck one of the loaded nodes [11] - other children [12,13] must be visible

    rerender(
      <TestComponent
        model={modelMock}
        treeData={treeData}
        checkedKeys={
          // eslint-disable-next-line prettier/prettier
          [/* 0, */ 1, 2, 3, 4, 5, 6, 7, 8, /* 9, 10, 11, */ 12 /* 13 */]
        }
      />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual(
      // eslint-disable-next-line prettier/prettier
      [/* 0, */ 1, 2, 3, 4, 5, 6, 7, 8, 9, /* 10, 11, */ 12, 13].sort()
    );

    // uncheck both of the loaded nodes [11, 12] - all known unchecked - so hide [10..13] completely

    rerender(
      <TestComponent
        model={modelMock}
        treeData={treeData}
        checkedKeys={
          // eslint-disable-next-line prettier/prettier
          [/* 0, */ 1, 2, 3, 4, 5, 6, 7, 8 /* 9, 10, 11, 12, 13 */]
        }
      />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual(
      // eslint-disable-next-line prettier/prettier
      [1, 2, 3, 4, 5, 6, 7, 8, 9]
    );

    // check [12] back again. [13] shouldn't be visible because it was hidden

    rerender(
      <TestComponent
        model={modelMock}
        treeData={treeData}
        checkedKeys={
          // eslint-disable-next-line prettier/prettier
          [/* 0, */ 1, 2, 3, 4, 5, 6, 7, 8, /* 9, 10, 11, */ 12 /* 13 */]
        }
      />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual(
      // eslint-disable-next-line prettier/prettier
      [/* 0, */ 1, 2, 3, 4, 5, 6, 7, 8, 9, /* 10, 11, */ 12 /* 13 */].sort()
    );

    // hide [3] and check [11]. The whole [10-13] is visible.

    rerender(
      <TestComponent
        model={modelMock}
        treeData={treeData}
        checkedKeys={
          // eslint-disable-next-line prettier/prettier
          [/* 0, */ 1, 2, /* 3, 4, 5, 6, 7, */ 8, /* 9, */ 10, 11, 12 /* 13 */]
        }
      />
    );

    await sleep(300);

    expect([...modelMock.ownCheckedNodes].sort()).toEqual(
      // eslint-disable-next-line prettier/prettier
      [/* 0, */ 1, 2, /* 3, 4, 5, 6, 7, */ 8, 9, 10, 11, 12, 13].sort()
    );
  }, 19212983218937128973);
});
