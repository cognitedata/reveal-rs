import { useEffect } from 'react';

import { UnifiedViewer } from '@cognite/unified-file-viewer';

import { useIndustrialCanvasStore } from '../state/useIndustrialCanvasStore';

const useRefocusCanvasWhenPanesClose = ({
  unifiedViewerRef,
}: {
  unifiedViewerRef: UnifiedViewer | null;
}) => {
  const { isCommentsPaneOpen, isResourceSelectorOpen, isFileUploadModalOpen } =
    useIndustrialCanvasStore((state) => ({
      isCommentsPaneOpen: state.isCommentsPaneOpen,
      isResourceSelectorOpen: state.isResourceSelectorOpen,
      isFileUploadModalOpen: state.isFileUploadModalOpen,
    }));

  useEffect(() => {
    if (
      !isCommentsPaneOpen &&
      !isResourceSelectorOpen &&
      !isFileUploadModalOpen
    ) {
      // Put focus back on the canvas element right after a container has been
      // added, so that the user may immediately perform actions on them. For
      // example, delete the added container references by using the backspace
      // key
      unifiedViewerRef?.stage?.container().focus();
    }
  }, [
    isCommentsPaneOpen,
    isResourceSelectorOpen,
    isFileUploadModalOpen,
    unifiedViewerRef,
  ]);
};
export default useRefocusCanvasWhenPanesClose;
