import 'graphiql/graphiql.min.css';

import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { QueryExplorer } from '../components/QueryExplorer';
import { BasicPlaceholder } from '@platypus-app/components/BasicPlaceholder/BasicPlaceholder';
import { useSelectedDataModelVersion } from '@platypus-app/hooks/useSelectedDataModelVersion';
import { useParams } from 'react-router-dom';

export interface QueryExplorerPageProps {
  dataModelExternalId: string;
  space: string;
}

export const QueryExplorerPage = ({
  dataModelExternalId,
  space,
}: QueryExplorerPageProps) => {
  const { version } = useParams() as { version: string };

  const { dataModelVersion: selectedDataModelVersion } =
    useSelectedDataModelVersion(version, dataModelExternalId, space);

  return (
    <PageContentLayout>
      <PageContentLayout.Body>
        {selectedDataModelVersion.version ? (
          <QueryExplorer
            key={`${dataModelExternalId}_${selectedDataModelVersion.version}_${space}`}
            dataModelExternalId={dataModelExternalId}
            space={space}
            schemaVersion={selectedDataModelVersion.version}
          />
        ) : (
          <BasicPlaceholder
            type="EmptyStateFolderSad"
            title="Query explorer is not available due to a data model is not found. Please publish one."
            size={300}
          />
        )}
      </PageContentLayout.Body>
    </PageContentLayout>
  );
};
