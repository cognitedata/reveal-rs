import { useEffect, useRef, useState } from 'react';
import { useAuthContext } from '@cognite/react-container';
import { ExternalFileInfo, FileInfo } from '@cognite/sdk';
import {
  CognitePid,
  DIAGRAM_PARSER_SOURCE,
  getFileNameWithoutExtension,
} from '@cognite/pid-tools';

export enum SaveState {
  Ready,
  Saving,
  Error,
  Saved,
}

const useCdfDiagrams = () => {
  const { client } = useAuthContext();
  const [diagrams, setDiagrams] = useState<FileInfo[]>([]);
  const pidViewer = useRef<CognitePid>();
  const [saveStatus, setSaveStatus] = useState<SaveState>(SaveState.Ready);

  useEffect(() => {
    client?.files
      .list({
        filter: { mimeType: 'image/svg+xml', source: DIAGRAM_PARSER_SOURCE },
      })
      .then((response) => {
        setDiagrams(response.items);
      });
  }, []);

  const saveGraph = () => {
    setSaveStatus(SaveState.Saving);
    if (!pidViewer.current) return;

    const graph = pidViewer.current.getGraphDocument();

    if (graph === null) {
      setSaveStatus(SaveState.Error);
      throw Error('Could not save document');
    }

    const externalId = `${getFileNameWithoutExtension(
      graph.documentMetadata.name
    )}.json`;

    const fileInfo: ExternalFileInfo = {
      name: externalId,
      externalId,
      mimeType: 'application/json',
      source: DIAGRAM_PARSER_SOURCE,
      metadata: {
        type: 'graph',
        diagramType: graph.documentMetadata.type,
        unit: graph.documentMetadata.unit,
        lineNumbers: graph.lineNumbers.join(','),
      },
    };
    client?.files
      .upload(fileInfo, JSON.stringify(graph), true)
      .then(() => {
        setSaveStatus(SaveState.Saved);
      })
      .catch((error) => {
        setSaveStatus(SaveState.Error);
        throw Error(error);
      });
  };

  return { diagrams, pidViewer, saveGraph, saveState: saveStatus };
};

export default useCdfDiagrams;
