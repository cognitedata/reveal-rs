import { useCallback, useEffect, useState } from 'react';
import { UnifiedViewer } from '@cognite/unified-file-viewer';
import { toast } from '@cognite/cogs.js';
import { FileDropData } from '../components/IndustryCanvasFileUploadModal/IndustryCanvasFileUploadModal';
import { TOAST_POSITION } from '../constants';

type UseDragAndDropProps = {
  unifiedViewerRef: UnifiedViewer | null;
};

export const useDragAndDrop = ({ unifiedViewerRef }: UseDragAndDropProps) => {
  const [fileDropData, setFileDropData] = useState<FileDropData | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);

      if (unifiedViewerRef === null) {
        return;
      }

      const files = [...event.dataTransfer.files];
      if (files.length > 1) {
        toast.warning(
          <div>
            <h4>Multiple files</h4>
            <p>
              You can only upload one file at a time.
              <br />
              <br />
              <b>{files.length}</b> files were dropped.
            </p>
          </div>,
          {
            toastId: 'industry-canvas-multiple-files',
            position: TOAST_POSITION,
          }
        );
        return;
      }

      // TODO(UFV-605): There sometimes is an offset issue when dropping files on the canvas. Seems to be a bug in UFV.
      const relativePointerPosition =
        unifiedViewerRef.stage.getRelativePointerPosition();

      setFileDropData({
        file: [...event.dataTransfer.files][0],
        relativePointerPosition,
      });
    },
    [unifiedViewerRef]
  );

  useEffect(() => {
    const dragOver = (event: DragEvent) => {
      event.preventDefault();
      setIsDragging(true);
    };

    const dragLeave = (event: DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
    };

    const drop = (event: DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
    };

    document.addEventListener('dragover', dragOver);
    document.addEventListener('dragleave', dragLeave);
    document.addEventListener('drop', drop);

    return () => {
      document.removeEventListener('dragover', dragOver);
      document.removeEventListener('dragleave', dragLeave);
      document.removeEventListener('drop', drop);
    };
  }, []);

  return {
    onDrop,
    isDragging,
    fileDropData,
    resetFileDropData: () => setFileDropData(null),
  };
};
