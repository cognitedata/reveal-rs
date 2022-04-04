import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import React, { Suspense, useEffect, useState } from 'react';
import { SegmentedControl } from '@cognite/cogs.js';
import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { SchemaEditorMode } from '../../types';
import { UIEditor } from './UIEditor';
import { ErrorBoundary } from '../ErrorBoundary/ErrorBoundary';
import { BuiltInType } from '@platypus/platypus-core';
import services from '../../di';
import { SolutionDataModelType } from '@platypus/platypus-core';

const GraphqlCodeEditor = React.lazy(() =>
  import('../GraphqlCodeEditor/GraphqlCodeEditor').then((module) => ({
    default: module.GraphqlCodeEditor,
  }))
);

export interface EditorPanelProps {
  graphQlSchema: string;
  editorMode: SchemaEditorMode;
  onSchemaChanged: (schemaString: string) => void;
  currentType: null | SolutionDataModelType;
  setCurrentType: (type: null | SolutionDataModelType) => void;
}

export const EditorPanel = (props: EditorPanelProps) => {
  const { t } = useTranslation('EditorPanel');
  const [builtInTypes, setBuiltInTypes] = useState<BuiltInType[]>([]);

  useEffect(() => {
    async function getOptions() {
      const builtInTypesResponse =
        await services.solutionDataModelService.getSupportedPrimitiveTypes();
      setBuiltInTypes(builtInTypesResponse);
    }

    // Load built in types only once, since they are not going to change
    getOptions();
  }, []);
  const [currentView, setCurrentView] = useState('ui');

  return (
    <div data-cy="editor_panel" style={{ height: '100%', overflow: 'hidden' }}>
      <PageToolbar title={t('editor_title', 'Editor')} titleLevel={6}>
        <SegmentedControl
          currentKey={currentView}
          onButtonClicked={setCurrentView}
        >
          <SegmentedControl.Button
            key="code"
            icon="Code"
            aria-label="Code editor"
          />
          <SegmentedControl.Button
            key="ui"
            icon="DataTable"
            aria-label="UI editor"
          />
        </SegmentedControl>
      </PageToolbar>

      {currentView === 'code' ? (
        <Suspense fallback={<Spinner />}>
          <GraphqlCodeEditor
            builtInTypes={builtInTypes}
            code={props.graphQlSchema}
            onChange={props.onSchemaChanged}
            disabled={props.editorMode === SchemaEditorMode.View}
          />
        </Suspense>
      ) : (
        <ErrorBoundary>
          <UIEditor
            currentType={props.currentType}
            setCurrentType={props.setCurrentType}
            disabled={props.editorMode === SchemaEditorMode.View}
            graphQLSchemaString={props.graphQlSchema}
            onSchemaChange={(schemaString) =>
              props.onSchemaChanged(schemaString)
            }
          />
        </ErrorBoundary>
      )}
    </div>
  );
};
