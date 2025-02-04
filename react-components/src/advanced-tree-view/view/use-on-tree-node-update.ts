/*!
 * Copyright 2025 Cognite AS
 */
import { useCallback, useEffect } from 'react';

import { type TreeNodeType } from '../model/tree-node-type';

export const useOnTreeNodeUpdate = (node: TreeNodeType | undefined, update: () => void): void => {
  const memoizedUpdate = useCallback(update, [node]);
  useEffect(() => {
    if (node === undefined) {
      // AAA
      return;
    }
    memoizedUpdate();
    node.addTreeNodeListener?.(memoizedUpdate);
    return () => {
      node.removeTreeNodeListener?.(memoizedUpdate);
    };
  }, [node, memoizedUpdate]);
};
