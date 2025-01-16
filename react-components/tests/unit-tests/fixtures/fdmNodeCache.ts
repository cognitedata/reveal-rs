import { Mock } from 'moq.ts';
import { type FdmNodeCache } from '../../../src/components/CacheProvider/FdmNodeCache';
import { type Node3D } from '@cognite/sdk';
import {
  type ModelRevisionId,
  type FdmCadConnection,
  type FdmConnectionWithNode
} from '../../../src/components/CacheProvider/types';
import { DmsUniqueIdentifier } from '../../../src/data-providers';

const fdmNodeCacheMock = new Mock<FdmNodeCache>()
  .setup((instance) => instance.getAllMappingExternalIds)
  .returns(
    async (
      modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
      _fetchViews: boolean
    ) => {
      return new Map(
        modelRevisionIds.map(({ modelId, revisionId }) => [
          `${modelId}/${revisionId}`,
          [
            {
              connection: {
                instance: { space: 'space', externalId: 'id' },
                modelId,
                revisionId,
                treeIndex: 1
              } satisfies FdmCadConnection,
              cadNode: {
                id: 1,
                treeIndex: 1,
                parentId: 0,
                depth: 0,
                name: 'node-name',
                subtreeSize: 1
              } satisfies Node3D
            } satisfies FdmConnectionWithNode
          ]
        ])
      );
    }
  )
  .setup((instance) => instance.getClosestParentDataPromises)
  .returns((modelId: number, revisionId: number, treeIndex: number) => {
    return {
      modelId,
      revisionId,
      treeIndex,
      data: `data-for-${modelId}-${revisionId}-${treeIndex}`,
      cadAndFdmNodesPromise: Promise.resolve(undefined),
      viewsPromise: Promise.resolve([])
    };
  })
  .setup((instance) => instance.getMappingsForFdmInstances)
  .returns(
    async (fdmAssetExternalIds: DmsUniqueIdentifier[], modelRevisionIds: ModelRevisionId[]) => {
      return modelRevisionIds.map((model) => ({
        modelId: model.modelId,
        revisionId: model.revisionId,
        mappings: new Map(fdmAssetExternalIds.map((id) => [JSON.stringify(id), [] as Node3D[]]))
      }));
    }
  );

const fdmNodeCacheContentMock = fdmNodeCacheMock.object();

export { fdmNodeCacheContentMock };
