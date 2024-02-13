/*!
 * Copyright 2023 Cognite AS
 */
import { type ReactNode, type ReactElement, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useReveal } from './ViewerContext';

export function RevealCanvas({ children }: { children?: ReactNode }): ReactElement {
  const viewer = useReveal();
  const parentElement = useRef<HTMLDivElement>(null);

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }} ref={parentElement}>
      {mountChildren()}
    </div>
  );

  function mountChildren(): ReactElement {
    useEffect(() => {
      if (parentElement.current !== null) {
        parentElement.current.appendChild(viewer.domElement);
      }
    }, [parentElement.current]);
    return <>{createPortal(children, viewer.domElement)}</>;
  }
}
