/*!
 * Copyright 2023 Cognite AS
 */

import { type Cognite3DViewer } from '@cognite/reveal';
import { type ReactNode, type ReactElement, useRef, useEffect } from 'react';
import { RevealKeepAliveContext } from './RevealKeepAliveContext';
import { type FdmNodeCache } from '../NodeCacheProvider/FdmNodeCache';
import { type AssetMappingCache } from '../NodeCacheProvider/AssetMappingCache';
import { type PointCloudAnnotationCache } from '../NodeCacheProvider/PointCloudAnnotationCache';
import { type Image360AnnotationCache } from '../NodeCacheProvider/Image360AnnotationCache';

export function RevealKeepAlive({ children }: { children?: ReactNode }): ReactElement {
  const viewerRef = useRef<Cognite3DViewer>();
  const isRevealContainerMountedRef = useRef<boolean>(false);
  const fdmNodeCache = useRef<FdmNodeCache>();
  const assetMappingCache = useRef<AssetMappingCache>();
  const pointCloudAnnotationCache = useRef<PointCloudAnnotationCache>();
  const image360AnnotationCache = useRef<Image360AnnotationCache>();

  useEffect(() => {
    return () => {
      viewerRef.current?.dispose();
      viewerRef.current = undefined;
    };
  }, []);
  return (
    <RevealKeepAliveContext.Provider
      value={{
        viewerRef,
        isRevealContainerMountedRef,
        fdmNodeCache,
        assetMappingCache,
        pointCloudAnnotationCache,
        image360AnnotationCache
      }}>
      {children}
    </RevealKeepAliveContext.Provider>
  );
}
