import { FdmCadConnection } from '../../components/CacheProvider/types';
import { FdmSDK } from '../FdmSDK';
import {
  InModel3dEdgeProperties,
  SYSTEM_3D_EDGE_SOURCE,
  SYSTEM_SPACE_3D_SCHEMA
} from './dataModels';
import { fdmEdgesToCadConnections } from './fdmEdgesToCadConnections';

export async function getConnectionsForRevision(
  revisionIds: number[],
  fdmClient: FdmSDK
): Promise<FdmCadConnection[]> {
  if (revisionIds.length === 0) return [];

  const versionedPropertiesKey = `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`;
  const filter = {
    in: {
      property: [SYSTEM_SPACE_3D_SCHEMA, versionedPropertiesKey, 'revisionId'],
      values: revisionIds
    }
  };
  const mappings = await fdmClient.filterAllInstances<InModel3dEdgeProperties>(
    filter,
    'edge',
    SYSTEM_3D_EDGE_SOURCE
  );
  return fdmEdgesToCadConnections(mappings.instances);
}
