/*!
 * Copyright 2023 Cognite AS
 */

import {
  type PointerEventData,
  type Image360AnnotationIntersection,
  type AnyIntersection,
  type DataSourceType
} from '@cognite/reveal';
import { useEffect, useMemo, useState } from 'react';
import { type CogniteInternalId, type Node3D } from '@cognite/sdk';
import { type FdmNodeDataPromises } from '../components/CacheProvider/types';
import { type NodeAssetMappingResult } from '../components/CacheProvider/AssetMappingAndNode3DCache';
import { usePointCloudAnnotationMappingForIntersection } from './pointClouds/usePointCloudAnnotationMappingForIntersection';
import { type PointCloudAnnotationMappedAssetData } from './types';
import { MOUSE, Vector2, type Vector3 } from 'three';
import { type Source, type DmsUniqueIdentifier } from '../data-providers/FdmSDK';
import { useRenderTarget, useReveal } from '../components/RevealCanvas/ViewerContext';
import { isActiveEditTool } from '../architecture/base/commands/BaseEditTool';
import {
  type PointCloudFdmVolumeMappingWithViews,
  usePointCloudFdmVolumeMappingForIntersection
} from '../query/core-dm/usePointCloudVolumeMappingForAssetInstances';
import { useAssetMappingForTreeIndex, useFdm3dNodeDataPromises } from './cad';
import { type UseQueryResult } from '@tanstack/react-query';

export type AssetMappingDataResult = {
  cadNode: Node3D;
  assetIds: CogniteInternalId[];
};

export type FdmNodeDataResult = {
  fdmNodes: DmsUniqueIdentifier[];
  cadNode: Node3D;
  /**
   * A value of `undefined` means it's not yet finished evaluating.
   * A value of `null` means there was no result
   */
  views?: Source[][] | null;
};

export type ClickedNodeData = {
  mouseButton?: MOUSE;
  position?: Vector2;

  /**
   * A value of `undefined` means it's not yet finished evaluating.
   * A value of `null` means there was no result
   */
  fdmResult?: FdmNodeDataResult | null;

  /**
   * A value of `undefined` means it's not yet finished evaluating.
   * A value of `null` means there was no result
   */
  assetMappingResult?: AssetMappingDataResult | null;

  /**
   * A value of `undefined` means it's not yet finished evaluating.
   * A value of `null` means there was no result
   */
  pointCloudAnnotationMappingResult?: PointCloudAnnotationMappedAssetData[] | null;

  /**
   * A value of `undefined` means it's not yet finished evaluating.
   * A value of `null` means there was no result
   */
  pointCloudFdmVolumeMappingResult?: PointCloudFdmVolumeMappingWithViews[] | null;
  intersection: AnyIntersection | Image360AnnotationIntersection<DataSourceType>;
};

export const useClickedNodeData = (options?: {
  leftClick?: boolean;
  rightClick?: boolean;
  disableOnEditTool?: boolean;
}): ClickedNodeData | undefined => {
  const leftClick = options?.leftClick ?? true;
  const rightClick = options?.rightClick ?? false;
  const disableOnEditTool = options?.disableOnEditTool ?? true;

  const viewer = useReveal();
  const renderTarget = useRenderTarget();

  const [intersection, setIntersection] = useState<AnyIntersection | undefined>(undefined);

  const [image360AnnotationIntersection, setImage360AnnotationIntersection] = useState<
    Image360AnnotationIntersection<DataSourceType> | undefined
  >(undefined);

  const [position, setPosition] = useState<Vector2 | undefined>(undefined);
  const [mouseButton, setMouseButton] = useState<MOUSE | undefined>(undefined);

  useEffect(() => {
    const callback = (event: PointerEventData): void => {
      void (async () => {
        const activatedOnLeftClick = leftClick && event.button === MOUSE.LEFT;
        const activatedOnRightClick = rightClick && event.button === MOUSE.RIGHT;

        if (
          !(activatedOnLeftClick || activatedOnRightClick) ||
          (disableOnEditTool && isActiveEditTool(renderTarget.commandsController))
        ) {
          setPosition(undefined);
          setMouseButton(undefined);
          return;
        }

        const position = new Vector2(event.offsetX, event.offsetY);

        setPosition(position);
        setMouseButton(event.button);

        const intersection = await viewer.getAnyIntersectionFromPixel(position);

        const annotationIntersection = await viewer.get360AnnotationIntersectionFromPixel(
          event.offsetX,
          event.offsetY
        );

        if (intersection !== undefined) {
          setIntersection(intersection);
        } else {
          setIntersection(undefined);
        }

        if (annotationIntersection !== null) {
          setImage360AnnotationIntersection(annotationIntersection);
        } else {
          setImage360AnnotationIntersection(undefined);
        }
      })();
    };

    viewer.on('click', callback);

    return () => {
      viewer.off('click', callback);
    };
  }, [viewer]);

  const { data: nodeDataPromises } = useFdm3dNodeDataPromises(intersection);

  const { data: assetMappingResult } = useAssetMappingForTreeIndex(intersection);

  const pointCloudAnnotationMappingResult =
    usePointCloudAnnotationMappingForIntersection(intersection);

  const pointCloudFdmVolumeMappingResult =
    usePointCloudFdmVolumeMappingForIntersection(intersection);

  return useCombinedClickedNodeData(
    mouseButton,
    position,
    nodeDataPromises,
    assetMappingResult,
    pointCloudAnnotationMappingResult,
    pointCloudFdmVolumeMappingResult,
    image360AnnotationIntersection ?? intersection
  );
};

const useCombinedClickedNodeData = (
  mouseButton: MOUSE | undefined,
  position: Vector2 | undefined,
  fdmPromises: FdmNodeDataPromises | undefined,
  assetMappings: NodeAssetMappingResult | undefined,
  pointCloudAssetMappingsResult: UseQueryResult<PointCloudAnnotationMappedAssetData[]>,
  pointCloudFdmVolumeMappingsResult: UseQueryResult<PointCloudFdmVolumeMappingWithViews[]>,
  intersection: AnyIntersection | Image360AnnotationIntersection<DataSourceType> | undefined
): ClickedNodeData | undefined => {
  const fdmData = useFdmData(fdmPromises);

  return useMemo(() => {
    if (intersection === undefined) {
      return undefined;
    }

    const assetMappingData =
      assetMappings === undefined
        ? undefined
        : assetMappings.node === undefined
          ? null
          : {
              cadNode: assetMappings.node,
              assetIds: assetMappings.mappings.map((mapping) => mapping.assetId)
            };

    const pointCloudAssetMappings = normalizeListDataResult(pointCloudAssetMappingsResult);
    const pointCloudFdmVolumeMappings = normalizeListDataResult(pointCloudFdmVolumeMappingsResult);

    return {
      mouseButton,
      position,
      fdmResult: fdmData,
      assetMappingResult: assetMappingData,
      pointCloudAnnotationMappingResult: pointCloudAssetMappings,
      pointCloudFdmVolumeMappingResult: pointCloudFdmVolumeMappings,
      intersection
    };
  }, [
    intersection,
    fdmData,
    assetMappings?.node,
    pointCloudAssetMappingsResult.data,
    pointCloudAssetMappingsResult.isFetching,
    pointCloudFdmVolumeMappingsResult.data,
    pointCloudFdmVolumeMappingsResult.isFetching
  ]);

  function normalizeListDataResult<T>(result: UseQueryResult<T[]>): T[] | undefined | null {
    return result.isFetching
      ? undefined
      : result.data === undefined || result.data.length === 0
        ? null
        : result.data;
  }
};

const useFdmData = (
  fdmPromises: FdmNodeDataPromises | undefined
): FdmNodeDataResult | undefined | null => {
  const [fdmData, setFdmData] = useState<FdmNodeDataResult | undefined | null>();

  useEffect(() => {
    if (fdmPromises === undefined) {
      setFdmData(undefined);
      return;
    }

    void setData(fdmPromises);

    async function setData(promises: FdmNodeDataPromises): Promise<void> {
      const cadAndFdmNodes = await promises.cadAndFdmNodesPromise;

      if (cadAndFdmNodes === undefined || cadAndFdmNodes.fdmIds.length === 0) {
        setFdmData(null);
        return;
      }

      setFdmData({
        fdmNodes: cadAndFdmNodes.fdmIds,
        cadNode: cadAndFdmNodes.cadNode,
        views: undefined
      });

      const views = await promises.viewsPromise;

      if (views === undefined || views.length === 0) {
        setFdmData({
          fdmNodes: cadAndFdmNodes.fdmIds,
          cadNode: cadAndFdmNodes.cadNode,
          views: null
        });
        return;
      }

      setFdmData({
        fdmNodes: cadAndFdmNodes.fdmIds,
        cadNode: cadAndFdmNodes.cadNode,
        views
      });
    }
  }, [fdmPromises]);

  return fdmData;
};

export function getClickedNodeDataIntersectionPosition(
  clickedNodeData: ClickedNodeData
): Vector3 | undefined {
  const intersection = clickedNodeData.intersection;
  if (intersection !== undefined && intersection.type === 'image360Annotation') {
    return undefined;
  }

  return intersection.point;
}
