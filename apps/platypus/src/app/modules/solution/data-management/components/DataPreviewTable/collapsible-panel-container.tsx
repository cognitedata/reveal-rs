import { CogDataList, PrimitiveTypesListData } from '@cognite/cog-data-grid';
import { CollapsablePanel, Button, Input, Flex } from '@cognite/cogs.js';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { AgGridReact } from 'ag-grid-react';
import {
  ChangeEvent,
  ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SidePanelTitle } from './data-preview-side-panel-title';
import { SidePanel } from './SidePanel';

import * as S from './elements';
import { InstancePreview } from './InstancePreview/InstancePreview';
import { DataModelTypeDefsType } from '@platypus/platypus-core';

export type DataPreviewSidebarData =
  | {
      type: 'list';
      fieldName: string;
      value: PrimitiveTypesListData;
    }
  | {
      type: 'custom';
      fieldName: string;
      externalId: string;
      fieldType: DataModelTypeDefsType;
    };

export type CollapsiblePanelContainerProps = {
  children: ReactElement;
  data: DataPreviewSidebarData | undefined;
  onClose: VoidFunction;
  dataModelTypeName: string;
  dataModelExternalId: string;
};

export const CollapsiblePanelContainer: React.FC<
  CollapsiblePanelContainerProps
> = ({ children, data, onClose, dataModelTypeName, dataModelExternalId }) => {
  const { t } = useTranslation('DataPreviewCollapsiblePanelContainer');
  const gridRef = useRef<AgGridReact>(null);
  const [openSearchInput, setOpenSearchInput] = useState<boolean>(false);

  const onSearchInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      gridRef.current?.api.setQuickFilter(event.target.value);
    },
    []
  );

  const onSearchInputCancel = useCallback(() => {
    setOpenSearchInput(false);
    gridRef.current?.api.setQuickFilter('');
  }, []);

  const getSidebarContent = () => {
    if (!data) {
      return null;
    }
    if (data?.type === 'list') {
      return (
        <>
          <Flex>
            {!openSearchInput && (
              <Button
                data-cy="side-panel-search-button"
                icon="Search"
                type="secondary"
                onClick={() => setOpenSearchInput(true)}
              />
            )}
            {openSearchInput && (
              <>
                <Input
                  data-cy="side-panel-search-input"
                  autoFocus
                  onChange={onSearchInputChange}
                />
                <Button
                  data-cy="side-panel-search-cancel-button"
                  type="link"
                  variant="ghost"
                  onClick={onSearchInputCancel}
                  aria-label="side-panel-search-cancel-button"
                >
                  {t('side-panel-list-search-cancel-btn', 'Cancel')}
                </Button>
              </>
            )}
          </Flex>
          <CogDataList ref={gridRef} listData={data.value || []} />
        </>
      );
    } else {
      return (
        <InstancePreview
          externalId={data.externalId}
          dataModelType={data.fieldType}
          dataModelExternalId={dataModelExternalId}
        />
      );
    }
  };
  return (
    <S.CollapsablePanelContainer>
      <CollapsablePanel
        sidePanelRight={
          <SidePanel
            title={
              <SidePanelTitle
                listLength={
                  data?.type === 'list' ? data?.value.length : undefined
                }
                fieldName={data?.fieldName || ''}
                dataModelTypeName={dataModelTypeName}
              />
            }
            onCloseClick={onClose}
          >
            {getSidebarContent()}
          </SidePanel>
        }
        sidePanelRightVisible={!!data}
        sidePanelRightWidth={376}
      >
        {children}
      </CollapsablePanel>
    </S.CollapsablePanelContainer>
  );
};
