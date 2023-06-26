import React, { useEffect, useRef } from 'react';
import { type AddModelOptions, type CogniteCadModel } from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';
import { type Matrix4 } from 'three';

interface Cognite3dModelProps {
  addModelOptions: AddModelOptions;
  transform?: Matrix4;
}

export default function CogniteCadModelContainer({
  addModelOptions,
  transform
}: Cognite3dModelProps): React.JSX.Element {
  const modelRef = useRef<CogniteCadModel>();
  const viewer = useReveal();
  const { modelId, revisionId } = addModelOptions;

  useEffect(() => {
    addModel(modelId, revisionId, transform).catch(console.error);
    return () => {
      if (modelRef.current === undefined || !viewer.models.includes(modelRef.current)) return;
      viewer.removeModel(modelRef.current);
      modelRef.current = undefined;
    };
  }, [addModelOptions]);

  useEffect(() => {
    if (modelRef.current === undefined || transform === undefined) return;
    modelRef.current.setModelTransformation(transform);
  }, [transform]);

  return <></>;

  async function addModel(modelId: number, revisionId: number, transform?: Matrix4) {
    const cadModel = await viewer.addCadModel({ modelId, revisionId });
    if (transform !== undefined) {
      cadModel.setModelTransformation(transform);
    }
    modelRef.current = cadModel;
  }
}
