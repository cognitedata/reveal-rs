import { useMemo, useState } from 'react';
import { Button, Flex, Icon, Label } from '@cognite/cogs.js';
import { Table, TableNoResults } from '@cognite/cdf-utilities';
import { Checkbox, notification } from 'antd';
import DataSetEditor from 'pages/DataSetEditor';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { useHandleFilters } from 'utils/filterUtils';
import { setItemInStorage } from 'utils/localStorage';
import { getContainer } from 'utils/shared';
import useLocalStorage from 'hooks/useLocalStorage';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import isArray from 'lodash/isArray';
import { useTableColumns, DataSetRow, getLabelsList } from './TableColumns';
import {
  DataSetWithExtpipes,
  useDataSetsList,
  useUpdateDataSetVisibility,
} from '../../actions/index';
import { useWithExtpipes } from '../../hooks/useWithExtpipes';
import { useDataSetMode, useSelectedDataSet } from '../../context/index';
import { useTranslation } from 'common/i18n';
import Page from 'components/page';
import RowActions from 'components/data-sets-list/row-actions';
import TableFilter, { GovernanceStatus } from 'components/table-filters';
import { useSearchParamState } from 'hooks/useSearchParamState';
import { trackUsage } from 'utils';

const DataSetsList = (): JSX.Element => {
  const { t } = useTranslation();
  const { handleDataSetsFilters } = useHandleFilters();
  const { getTableColumns } = useTableColumns();
  const { data: withExtpipes, isFetched: didFetchWithExtpipes } =
    useWithExtpipes();

  const [creationDrawerVisible, setCreationDrawerVisible] =
    useState<boolean>(false);
  const [showArchived, setShowArchived] = useLocalStorage<boolean>(
    'data-sets-show-archived',
    false
  );
  const [changesSaved, setChangesSaved] = useState<boolean>(true);
  const [userWarned, setUserWarned] = useState<boolean>(false);

  const searchFilter = useSearchParamState<string>('search');
  const labelFilter = useSearchParamState<string[]>('labels');
  const governanceFilter =
    useSearchParamState<GovernanceStatus[]>('governance');

  const { setMode } = useDataSetMode();

  const { setSelectedDataSet } = useSelectedDataSet();

  const {
    dataSetsWithExtpipes = [],
    isExtpipesFetched,
    isFetched: didFetchDataSets,
    isLoading: loading,
  } = useDataSetsList();
  const { updateDataSetVisibility, isLoading: isUpdatingDataSetVisibility } =
    useUpdateDataSetVisibility();

  const { flow } = getFlow();
  const { data: hasWritePermissions } = usePermissions(
    flow,
    'datasetsAcl',
    'WRITE'
  );

  const dataSetsList = useMemo(() => {
    return handleDataSetsFilters(
      showArchived,
      searchFilter,
      governanceFilter,
      dataSetsWithExtpipes
    );
  }, [
    handleDataSetsFilters,
    showArchived,
    searchFilter,
    governanceFilter,
    dataSetsWithExtpipes,
  ]);

  const tableData = useMemo(() => {
    let tableDataSets: DataSetRow[] = [];
    if (dataSetsWithExtpipes?.length && !loading) {
      tableDataSets = dataSetsList.map(
        (dataSetWithExtpipes: DataSetWithExtpipes): DataSetRow => {
          const { dataSet, extpipes } = dataSetWithExtpipes;
          const labelsFromMetadata = dataSet.metadata?.consoleLabels;
          return {
            key: dataSet.id,
            id: dataSet.id,
            externalId: dataSet.externalId,
            name: dataSet.name,
            description: dataSet.description,
            labels: isArray(labelsFromMetadata) ? labelsFromMetadata : [],
            quality: dataSet.metadata.consoleGoverned,
            extpipes,
            writeProtected: dataSet.writeProtected,
            archived:
              dataSet.metadata.archived !== undefined
                ? dataSet.metadata.archived
                : false,
          };
        }
      );
    }
    return tableDataSets;
  }, [dataSetsWithExtpipes, loading, dataSetsList]);

  const filteredTableData = useMemo(() => {
    let filteredArray = tableData;
    if (!!labelFilter?.length) {
      filteredArray = filteredArray.filter(({ labels: testLabels }) =>
        testLabels.some((label) => labelFilter.includes(label))
      );
    }
    return filteredArray;
  }, [labelFilter, tableData]);

  const labels = useMemo(() => {
    return getLabelsList(
      dataSetsWithExtpipes.map(({ dataSet }) => dataSet),
      showArchived
    );
  }, [dataSetsWithExtpipes, showArchived]);

  const handleModalClose = () => {
    setCreationDrawerVisible(false);
    setMode('create');
    setSelectedDataSet(undefined);
  };

  const getSourcesList = () => {
    const sourceNames: string[] = [];
    dataSetsWithExtpipes.forEach(({ dataSet }) => {
      if (dataSet?.metadata?.consoleSource?.names?.length)
        dataSet.metadata.consoleSource.names.forEach((name: string) => {
          if (!sourceNames.includes(name)) {
            sourceNames.push(name);
          }
        });
    });
    return sourceNames;
  };

  const statusColumn = {
    title: t('status'),
    key: 'status',
    width: '5%',
    render: (row: DataSetRow) =>
      row.archived && (
        <Label size="medium" variant="danger">
          {t('archived')}
        </Label>
      ),
  };

  const actionsColumn = {
    dataIndex: 'options',
    key: 'options',
    title: '',
    render: (_: any, record: DataSetRow) => (
      <div
        onClick={(evt) => {
          evt.stopPropagation();
        }}
      >
        <RowActions
          actions={[
            {
              children: t('edit'),
              onClick: () => {
                trackUsage({
                  e: 'data.sets.edit.click',
                  dataSetId: record.key,
                });
                editDataSet(record.key);
              },
              disabled: !hasWritePermissions,
              loading: isUpdatingDataSetVisibility || loading,
              icon: 'Edit',
            },
            {
              children: record.archived ? t('restore') : t('archive'),
              onClick: () => {
                if (record.archived) {
                  trackUsage({
                    e: 'data.sets.archive.click',
                    dataSetId: record.key,
                  });
                  return restoreDataSet(record.key);
                }
                trackUsage({
                  e: 'data.sets.restore.click',
                  dataSetId: record.key,
                });
                return archiveDataSet(record.key);
              },
              disabled: !hasWritePermissions,
              loading: isUpdatingDataSetVisibility || loading,
              icon: record.archived ? 'Restore' : 'Archive',
            },
          ]}
        />
      </div>
    ),
    width: '52px',
  };

  const archiveDataSet = (key: number) => {
    const d = dataSetsWithExtpipes.find((curDs) => curDs.dataSet.id === key);
    if (d) {
      updateDataSetVisibility(d.dataSet, true);
    }
  };

  const restoreDataSet = (key: number) => {
    const d = dataSetsWithExtpipes.find((curDs) => curDs.dataSet.id === key);
    if (d) {
      updateDataSetVisibility(d.dataSet, false);
    }
  };

  const editDataSet = (key: number) => {
    setMode('edit');
    setSelectedDataSet(key);
    trackEvent('DataSets.EditingFlow.Starts editing data set');
    setCreationDrawerVisible(true);
  };

  const discardChangesButton = (
    <div style={{ display: 'block', textAlign: 'right', marginTop: '20px' }}>
      <Button
        type="danger"
        size="small"
        onClick={() => {
          setCreationDrawerVisible(false);
          setMode('create');
          setSelectedDataSet(undefined);
          notification.close('navigateAway');
        }}
      >
        {t('discard-changes')}
      </Button>
    </div>
  );

  const CreateButton = (
    <Button
      type="primary"
      icon="Add"
      onClick={() => {
        setCreationDrawerVisible(true);
        trackUsage({ e: 'data.sets.create.click' });
        setUserWarned(false);
      }}
      disabled={!hasWritePermissions}
    >
      {t('create-data-set')}
    </Button>
  );

  const onClose = () => {
    if (userWarned || changesSaved) {
      setCreationDrawerVisible(false);
      setMode('create');
      setSelectedDataSet(undefined);
    } else {
      notification.warn({
        message: 'Warning',
        description: (
          <div>
            {t(
              'you-have-unsaved-changes-are-you-sure-you-want-to-navigate-away'
            )}
            {discardChangesButton}
          </div>
        ),
        key: 'navigateAway',
        getContainer,
      });
    }
  };

  if (!didFetchWithExtpipes || !didFetchDataSets) {
    return <Icon type="Loader" />;
  }

  return (
    <Page title={t('landing-title')}>
      <DataSetEditor
        visible={creationDrawerVisible}
        onClose={onClose}
        changesSaved={changesSaved}
        setChangesSaved={setChangesSaved}
        sourceSuggestions={getSourcesList()}
        handleCloseModal={() => handleModalClose()}
      />
      <Flex
        alignItems="center"
        justifyContent="space-between"
        style={{ marginBottom: 16 }}
      >
        <TableFilter
          filteredCount={filteredTableData.length}
          labelOptions={labels}
          totalCount={dataSetsWithExtpipes.length}
        />
        <Flex alignItems="center" gap={8}>
          <Checkbox
            onChange={(e) => {
              setShowArchived(e.target.checked);
              trackUsage({ e: 'data.sets.view.archive.click' });
            }}
            checked={showArchived}
          >
            {t('show-archived-data-sets')}
          </Checkbox>
          {CreateButton}
        </Flex>
      </Flex>
      <Table<DataSetRow>
        rowKey="key"
        loading={loading}
        columns={[
          ...getTableColumns(
            dataSetsWithExtpipes.map((x) => x.dataSet),
            showArchived,
            withExtpipes,
            isExtpipesFetched
          ),
          ...(showArchived ? [statusColumn] : []),
          actionsColumn,
        ]}
        dataSource={filteredTableData}
        onChange={(_pagination, _filters, sorter) => {
          if (!isArray(sorter) && sorter?.columnKey && sorter?.order)
            setItemInStorage(sorter?.columnKey, sorter?.order);
        }}
        getPopupContainer={getContainer}
        emptyContent={
          <TableNoResults
            title={t('data-set-list-no-records')}
            content={t('data-set-list-search-not-found', {
              $: !!searchFilter ? `"${searchFilter}"` : searchFilter,
            })}
          />
        }
        appendTooltipTo={getContainer()}
      />
    </Page>
  );
};

export default DataSetsList;
