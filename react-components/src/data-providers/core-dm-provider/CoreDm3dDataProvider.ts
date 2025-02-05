/*!
 * Copyright 2024 Cognite AS
 */
import { type DataSourceType, type AddModelOptions, type DMDataSourceType } from '@cognite/reveal';
import { type FdmCadConnection } from '../../components/CacheProvider/types';
import { type Fdm3dDataProvider } from '../Fdm3dDataProvider';
import {
  type DmsUniqueIdentifier,
  type FdmSDK,
  type InstanceFilter,
  type NodeItem,
  type Source,
  type ViewItem
} from '../FdmSDK';
import { type InstancesWithView } from '../../query/useSearchMappedEquipmentFDM';
import {
  type ClassicAdd3DModelOptions,
  type AddImage360CollectionDatamodelsOptions,
  type TaggedAddResourceOptions
} from '../../components/Reveal3DResources/types';
import { COGNITE_3D_OBJECT_SOURCE } from './dataModels';
import { getDMSModels } from './getDMSModels';
import { getEdgeConnected3dInstances } from './getEdgeConnected3dInstances';
import { getFdmConnectionsForNodes } from './getFdmConnectionsForNodes';
import { type Node3D } from '@cognite/sdk';
import { getDMSRevision } from './getDMSRevision';
import { listAllMappedFdmNodes, listMappedFdmNodes } from './listMappedFdmNodes';
import { isDefined } from '../../utilities/isDefined';
import { executeParallel } from '../../utilities/executeParallel';
import { filterNodesByMappedTo3d } from './filterNodesByMappedTo3d';
import { getCadModelsForInstance } from './getCadModelsForInstance';
import { getCadConnectionsForRevisions } from './getCadConnectionsForRevisions';
import { partition, zip } from 'lodash';
import { restrictToDmsId } from '../../utilities/restrictToDmsId';
import { isClassicIdentifier, isDM3DModelIdentifier } from '../../components';
import { EMPTY_ARRAY } from '../../utilities/constants';

const MAX_PARALLEL_QUERIES = 2;

export class CoreDm3dFdm3dDataProvider implements Fdm3dDataProvider {
  readonly _fdmSdk: FdmSDK;

  readonly _relevant3dSpaces: DmsUniqueIdentifier[];

  readonly _revisionIdToDMSIdentifier = new Map<number, DmsUniqueIdentifier>();
  readonly _modelIdToDMSIdentifier = new Map<number, DmsUniqueIdentifier[]>();

  constructor(relevant3dSpaces: DmsUniqueIdentifier[], fdmSdk: FdmSDK) {
    this._fdmSdk = fdmSdk;
    this._relevant3dSpaces = relevant3dSpaces;
  }

  is3dView(view: ViewItem): boolean {
    return view.implements.some(
      (type) =>
        type.externalId === COGNITE_3D_OBJECT_SOURCE.externalId &&
        type.space === COGNITE_3D_OBJECT_SOURCE.space &&
        type.version === COGNITE_3D_OBJECT_SOURCE.version
    );
  }

  async getDMSModels(modelId: number): Promise<DmsUniqueIdentifier[]> {
    const cachedModels = this._modelIdToDMSIdentifier.get(modelId);
    if (cachedModels !== undefined) {
      return cachedModels;
    }

    const models = await getDMSModels(modelId, this._fdmSdk);

    this._modelIdToDMSIdentifier.set(modelId, models);
    return models;
  }

  private async getDMSRevision(
    modelRef: DmsUniqueIdentifier,
    revisionId: number
  ): Promise<DmsUniqueIdentifier> {
    let revisionRef = this._revisionIdToDMSIdentifier.get(revisionId);

    if (revisionRef === undefined) {
      const revisionResult = await getDMSRevision(modelRef, revisionId, this._fdmSdk);

      this._revisionIdToDMSIdentifier.set(revisionId, revisionResult);
      revisionRef = revisionResult;
    }

    if (revisionRef === undefined) {
      throw Error(`No revision with id ${revisionId} found`);
    }

    return restrictToDmsId(revisionRef);
  }

  private async getDMSModelsForIds(
    modelIds: number[]
  ): Promise<Array<DmsUniqueIdentifier | undefined>> {
    return (
      await executeParallel(
        modelIds.map((id) => async () => await this.getDMSModels(id)),
        MAX_PARALLEL_QUERIES
      )
    ).flat();
  }

  private async getDMSRevisionsForRevisionIdsAndModelRefs(
    modelRefs: Array<DmsUniqueIdentifier | undefined>,
    revisionIds: number[]
  ): Promise<DmsUniqueIdentifier[]> {
    return (
      await executeParallel(
        revisionIds.map((revisionId, ind) => async () => {
          return modelRefs[ind] === undefined
            ? undefined
            : await this.getDMSRevision(modelRefs[ind], revisionId);
        }),
        MAX_PARALLEL_QUERIES
      )
    ).filter(isDefined);
  }

  async getEdgeConnected3dInstances(instance: DmsUniqueIdentifier): Promise<DmsUniqueIdentifier[]> {
    return await getEdgeConnected3dInstances(instance, this._fdmSdk);
  }

  async getFdmConnectionsForNodes(
    models: DmsUniqueIdentifier[],
    revisionId: number,
    nodes: Node3D[]
  ): Promise<FdmCadConnection[]> {
    if (models.length !== 1) {
      console.warn(`Expected 1 CoreDM 3D model, got ${models.length}:`, ...models);
    }

    const model = models[0];

    const revisionRef = await this.getDMSRevision(model, revisionId);

    return await getFdmConnectionsForNodes(model, revisionRef, revisionId, nodes, this._fdmSdk);
  }

  async listMappedFdmNodes(
    models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
    sourcesToSearch: Source[],
    instanceFilter: InstanceFilter | undefined,
    limit: number
  ): Promise<NodeItem[]> {
    const revisionRefs = await this.getRevisionRefs(models);

    return await listMappedFdmNodes(
      revisionRefs,
      sourcesToSearch,
      instanceFilter,
      limit,
      this._fdmSdk
    );
  }

  async listAllMappedFdmNodes(
    models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
    sourcesToSearch: Source[],
    instanceFilter: InstanceFilter | undefined
  ): Promise<NodeItem[]> {
    const revisionRefs = await this.getRevisionRefs(models);

    return await listAllMappedFdmNodes(revisionRefs, sourcesToSearch, instanceFilter, this._fdmSdk);
  }

  async filterNodesByMappedTo3d(
    nodes: InstancesWithView[],
    models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
    spacesToSearch: string[]
  ): Promise<InstancesWithView[]> {
    const revisionRefs = await this.getRevisionRefs(models);

    return await filterNodesByMappedTo3d(nodes, revisionRefs, spacesToSearch, this._fdmSdk);
  }

  async getCadModelsForInstance(
    instance: DmsUniqueIdentifier
  ): Promise<TaggedAddResourceOptions[]> {
    return await getCadModelsForInstance(instance, this._fdmSdk);
  }

  async getCadConnectionsForRevisions(
    modelOptions: Array<AddModelOptions<DataSourceType>>
  ): Promise<FdmCadConnection[]> {
    const isClassicModels = modelOptions.every((model) => isClassicIdentifier(model));
    if (!isClassicModels) {
      return EMPTY_ARRAY;
    }
    const modelRefs = await this.getDMSModelsForIds(modelOptions.map((model) => model.modelId));

    const revisionRefs = await this.getDMSRevisionsForRevisionIdsAndModelRefs(
      modelRefs,
      modelOptions.map((model) => model.revisionId)
    );

    const modelRevisions = zip(modelRefs, revisionRefs).filter(
      (modelRevision): modelRevision is [DmsUniqueIdentifier, DmsUniqueIdentifier] =>
        isDefined(modelRevision[0]) && isDefined(modelRevision[1])
    );

    return await getCadConnectionsForRevisions(modelRevisions, this._fdmSdk);
  }

  async getRevisionRefs(
    models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>
  ): Promise<DmsUniqueIdentifier[]> {
    const [classicModels, dmsModels] = partition(models, isClassicIdentifier) as [
      ClassicAdd3DModelOptions[],
      Array<AddModelOptions<DMDataSourceType> | AddImage360CollectionDatamodelsOptions>
    ];

    const dmModelRefsFromClassicIds = await this.getDMSModelsForIds(
      classicModels.map((model) => model.modelId)
    );
    const classicResults = await this.getDMSRevisionsForRevisionIdsAndModelRefs(
      dmModelRefsFromClassicIds,
      classicModels.map((model) => model.revisionId)
    );

    const dmResults = dmsModels.map((model) => {
      if (isDM3DModelIdentifier(model)) {
        return {
          externalId: model.revisionExternalId,
          space: model.revisionSpace
        };
      } else {
        return { externalId: model.externalId, space: model.space };
      }
    });

    return classicResults.concat(dmResults);
  }
}
