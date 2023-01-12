import Editor, { Monaco } from '@monaco-editor/react';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { useMixpanel } from '@platypus-app/hooks/useMixpanel';
import { BuiltInType, DataModelTypeDefs } from '@platypus/platypus-core';
import debounce from 'lodash/debounce';
import {
  Environment as MonacoEditorEnvironment,
  editor as MonacoEditor,
} from 'monaco-editor';
import React, { useEffect, useMemo, useRef, useState } from 'react';

// web workers stuff
import { setupGraphql } from '../../web-workers';
import GraphQlWorker from '../../web-workers/worker-loaders/graphqlWorkerLoader';
import MonacoEditorWorker from '../../web-workers/worker-loaders/monacoLanguageServiceWorkerLoader';

import { isFDMv3 } from '@platypus-app/flags';

// point here so the context can be used
declare const self: any;

(self as any).MonacoEnvironment = {
  getWorker(_: string, label: string) {
    // // when graphql, load our custom web worker
    if (label === 'graphql') {
      return new GraphQlWorker();
    }

    // otherwise, load the default web worker from monaco
    return new MonacoEditorWorker();
  },
} as MonacoEditorEnvironment;

type Props = {
  code: string;
  currentTypeName: string | null;
  typeDefs: DataModelTypeDefs | null;
  builtInTypes: BuiltInType[];
  externalId: string;
  space: string;
  version: string;
  disabled?: boolean;
  onChange: (code: string) => void;
};

export const GraphqlCodeEditor = React.memo(
  ({
    code,
    currentTypeName,
    typeDefs,
    builtInTypes,
    externalId,
    disabled = false,
    onChange,
  }: Props) => {
    const [editorValue, setEditorValue] = useState(code);
    const langProviders = useRef<any>(null);
    const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);

    const { track } = useMixpanel();

    const editorWillMount = (monacoInstance: Monaco) => {
      langProviders.current = setupGraphql(monacoInstance, builtInTypes, {
        useExtendedSdl: isFDMv3(),
      });
    };

    const handleEditorDidMount = (
      editor: MonacoEditor.IStandaloneCodeEditor
    ) => {
      editorRef.current = editor;
    };

    const debouncedOnChange = useMemo(
      () => debounce((value: string) => onChange(value), 500),
      [onChange]
    );

    useEffect(() => {
      return () => {
        debouncedOnChange.cancel();
      };
    }, [debouncedOnChange]);

    useEffect(() => {
      if (currentTypeName && editorRef.current && typeDefs) {
        const selectedType = typeDefs?.types.find(
          (typeDef) => typeDef.name === currentTypeName
        );

        if (selectedType?.location) {
          // scroll the editor to this line
          editorRef.current.revealLine(selectedType.location.line);
          // set the focus there
          editorRef.current.setPosition({
            column: selectedType?.location.column,
            lineNumber: selectedType?.location.line,
          });
        }
      }

      // eslint-disable-next-line
    }, [currentTypeName]);

    useEffect(() => {
      setEditorValue(code);
    }, [code]);

    useEffect(() => {
      track('CodeEditor', { dataModel: externalId });
    }, [track, externalId]);

    useEffect(() => {
      // Destroy lang services when component is unmounted
      return () => {
        if (langProviders.current) {
          langProviders.current.dispose();
        }
      };
    }, []);

    return (
      <div style={{ height: 'calc(100% - 56px)' }}>
        <Editor
          options={{
            minimap: { enabled: false },
            autoClosingBrackets: 'always',
            renderValidationDecorations: 'on',
            readOnly: disabled,
            overviewRulerLanes: 0,
            scrollBeyondLastLine: false,
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
          }}
          language="graphql"
          value={editorValue}
          loading={<Spinner />}
          beforeMount={editorWillMount}
          onMount={handleEditorDidMount}
          defaultLanguage="graphql"
          onChange={(value) => {
            const editCode = value || '';
            debouncedOnChange(editCode);
            setEditorValue(editCode);
          }}
        />
      </div>
    );
  }
);
