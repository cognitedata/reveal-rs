import { lazy, Suspense, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageContentLayout } from '@platypus-app/components/Layouts/PageContentLayout';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { Spinner } from '@platypus-app/components/Spinner/Spinner';
import { StyledPage } from '../data-model/pages/elements';
import {
  useDataModel,
  useDataModelVersions,
  useSelectedDataModelVersion,
} from '@platypus-app/hooks/useDataModelActions';
import useSelector from '@platypus-app/hooks/useSelector';
import { DataModelState } from '@platypus-app/redux/reducers/global/dataModelReducer';
import { DataModelVersion } from '@platypus/platypus-core';
import { VersionSelectorToolbar } from '@platypus-app/components/VersionSelectorToolbar';
import { DocLinkButtonGroup } from '@platypus-app/components/DocLinkButtonGroup/DocLinkButtonGroup';
import { Flex } from '@cognite/cogs.js';
import { DOCS_LINKS } from '@platypus-app/constants';
import { useDraftRows } from './hooks/useDraftRows';
import { useDataModelState } from '../hooks/useDataModelState';

type TabType = 'preview' | 'pipelines' | 'data-quality';

const PreviewPage = lazy<any>(() =>
  import('./pages/Preview').then((module) => ({
    default: module.Preview,
  }))
);

export interface DataManagementPageProps {
  dataModelExternalId: string;
}

export const DataManagementPage = ({
  dataModelExternalId,
}: DataManagementPageProps) => {
  const { t } = useTranslation('SolutionDataPreview');

  const { subSolutionPage } = useParams<{
    subSolutionPage: string;
  }>();

  const initialPage: TabType = (subSolutionPage as TabType) || 'preview';
  const [tab] = useState<TabType>(initialPage);

  const { data: dataModelVersions } = useDataModelVersions(dataModelExternalId);

  const navigate = useNavigate();

  const { selectedVersionNumber } = useSelector<DataModelState>(
    (state) => state.dataModel
  );

  const { data: dataModel } = useDataModel(dataModelExternalId);

  const selectedDataModelVersion = useSelectedDataModelVersion(
    selectedVersionNumber,
    dataModelVersions || [],
    dataModelExternalId,
    dataModel?.space || ''
  );

  const { setSelectedVersionNumber } = useDataModelState();

  const selectedTypeName = useSelector<string>(
    (state) => state.dataManagement.selectedType?.name || ''
  );

  const { clearState } = useDraftRows();

  const handleDataModelVersionSelect = (dataModelVersion: DataModelVersion) => {
    navigate(
      `/data-models/${dataModelVersion.space}/${dataModelExternalId}/${dataModelVersion.version}/data/data-management/preview?type=${selectedTypeName}`
    );
    setSelectedVersionNumber(dataModelVersion.version);
    clearState();
  };

  const Preview = (
    <StyledPage style={tab !== 'preview' ? { display: 'none' } : {}}>
      <Suspense fallback={<Spinner />}>
        <PreviewPage dataModelExternalId={dataModelExternalId} />
      </Suspense>
    </StyledPage>
  );

  return (
    <PageContentLayout>
      <PageContentLayout.Header>
        <VersionSelectorToolbar
          title={t('data_management_title', 'Data management')}
          schemas={dataModelVersions || []}
          draftSaved={false}
          onDataModelVersionSelect={handleDataModelVersionSelect}
          selectedDataModelVersion={selectedDataModelVersion}
        >
          <Flex justifyContent="space-between">
            <DocLinkButtonGroup docsLinkUrl={DOCS_LINKS.POPULATION} />
          </Flex>
        </VersionSelectorToolbar>
      </PageContentLayout.Header>

      <PageContentLayout.Body>{Preview}</PageContentLayout.Body>
    </PageContentLayout>
  );
};
