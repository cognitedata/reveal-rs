/*!
 * Copyright 2024 Cognite AS
 */

import { type DmsUniqueIdentifier } from '../../../data-providers';
import { type InstanceReference } from '../../../utilities/instanceIds';

export type PoiVisibility = 'PUBLIC' | 'PRIVATE';

export type SceneState = Record<string, unknown>;

export type PointsOfInterestProperties = {
  // "ID as the node appears in the Source system"
  //  sourceId?: string;
  // "Name of the source system node comes from"
  // source?: string;
  // "Title or name of the node"
  name: string;
  // "Long description of the node"
  description?: string;
  // "Text based labels for generic use"
  // labels?: string[];
  // "Visibility of node (PUBLIC, PRIVATE, PROTECTED)"
  // visibility?: string;
  // "Who created this node?"
  ownerId?: string;
  // "Who was the last person to update this node?"
  // updatedBy?: string;
  // "Is this item archived, and therefore hidden from most UIs?"
  // isArchived?: boolean;
  // "The status of the observation (draft, completed, sent)"
  // status?: string;
  // "External ID of the associated CDF Asset"
  // "List of associated files"
  // files?: DmsUniqueIdentifier[];
  // "description of how the observation was troubleshooted"
  // troubleshooting?: string;
  // "Priority of the observation (Urgent, High ...)"
  // priority?: string;
  // "The observation type (Malfunction report, Maintenance request, etc.)"
  // type?: string;
  // Create time
  createdTime?: number;
  // "3D position" */
  positionX: number;
  positionY: number;
  positionZ: number;
  scene: DmsUniqueIdentifier;
  instanceRef?: InstanceReference;
  // "Comments"
  // comments?: CommentProperties[];
  sceneState: SceneState;
  // Visibility
  visibility?: PoiVisibility;
};

export type CommentProperties = {
  ownerId: string;
  content: string;
};

export type PointsOfInterestInstance<ID> = { id: ID; properties: PointsOfInterestProperties };
