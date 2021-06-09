import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store';
import { getNodeByTreeIndex } from 'src/pages/RevisionDetails/components/TreeView/utils/treeFunctions';
import { TreeDataNode } from 'src/pages/RevisionDetails/components/TreeView/types';
import React, { useCallback, useEffect, useState } from 'react';
import { ModalProps } from 'antd/lib/modal';
import { Modal, Table, Tabs } from 'antd';
import { ColumnProps } from 'antd/lib/table';
import { Button } from '@cognite/cogs.js';

import { getContainer } from 'src/utils';
import styled from 'styled-components';
import omit from 'lodash/omit';
import { setNodePropertyFilter } from 'src/store/modules/TreeView';

type DataSource = {
  key: string;
  value: any;
  action?: React.ReactNode;
};

// for some reason if Table is used as styled component, styles are not applied
const TableWrapper = styled.div`
  overflow: auto;
  max-height: max(65vh, 400px);
  .ant-table-column-sorters {
    padding: 0;
  }
  & td,
  th {
    padding: 8px;
  }
`;

type Props = ModalProps & { treeIndex?: number; onClose: () => void };

const azSortByKey = (key) => (a, b) => {
  const aStr = String(a[key]).toLowerCase();
  const bStr = String(b[key]).toLowerCase();
  if (aStr > bStr) {
    return 1;
  }
  if (aStr < bStr) {
    return -1;
  }
  return 0;
};

export const NodeInfoModal = ({ treeIndex, onClose, ...restProps }: Props) => {
  const defaultCdfMetaTabKey = 'cdfMetaTabKey';
  const [activeTabKey, setActiveTabKey] = useState<null | string>(null);
  const [nodeKeys, setNodeKeys] = useState<Array<string>>([]);
  const dispatch = useDispatch();

  const node = useSelector(
    useCallback(
      (app: RootState) => {
        if (treeIndex == null) {
          return null;
        }
        const treeNode = getNodeByTreeIndex(
          app.treeView.treeData,
          treeIndex
        ) as TreeDataNode | undefined;
        return treeNode && treeNode.meta;
      },
      [treeIndex]
    )
  );

  useEffect(() => {
    if (!node) {
      return;
    }
    const properties = node.properties || {};
    const newNodeKeys = Object.keys(properties);
    // custom "sorting" to make the most useful categories appear on the first place
    const bubbleUpProp = (key: string) => {
      if (key in properties) {
        newNodeKeys.unshift(newNodeKeys.splice(newNodeKeys.indexOf(key), 1)[0]);
      }
    };
    bubbleUpProp('Item');
    bubbleUpProp('PDMS');
    setNodeKeys(newNodeKeys);
  }, [node]);

  useEffect(() => {
    if (
      (activeTabKey && nodeKeys.includes(activeTabKey)) ||
      activeTabKey === defaultCdfMetaTabKey
    ) {
      return;
    }
    const setDefaultActiveTabPriority = (...keys: string[]) => {
      const key = keys.find((k) => nodeKeys.includes(k));
      if (key) {
        setActiveTabKey(key);
      }
    };
    setDefaultActiveTabPriority('PDMS', 'Item');

    // that's a bit tricky, but what's going on here is the following:
    // NodeInfoModal is the same for different nodes. And different nodes might have different nodeKeys
    // when you open modal and select tab X it remains active for the other nodes, but it can be missing for some node
    // the whole hook is needed to avoid an exception when some key was active for one node,
    // but doesn't exist for a newly opened node
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(nodeKeys.slice().sort())]);

  if (!node) {
    return null;
  }

  const getTableDataSource = (tabKey: string): DataSource[] => {
    let data;
    if (tabKey === defaultCdfMetaTabKey) {
      data = omit(node, 'properties');
    } else {
      data = (node.properties || {})[tabKey];
    }

    if (!data) {
      if (tabKey !== defaultCdfMetaTabKey) {
        return getTableDataSource(defaultCdfMetaTabKey);
      }
      return [];
    }

    return Object.entries(data).map(([key, value]) => {
      return {
        key,
        value:
          typeof value === 'object' ? (
            <pre style={{ font: 'inherit' }}>
              {JSON.stringify(value, null, 2)}
            </pre>
          ) : (
            value
          ),
        ...(tabKey !== defaultCdfMetaTabKey && {
          action: (
            <button
              type="button"
              onClick={() => {
                dispatch(
                  setNodePropertyFilter({ [tabKey]: { [key]: `${value}` } })
                );
                onClose();
              }}
            >
              →
            </button>
          ),
        }),
      };
    });
  };

  const getColumns = (
    columns: Array<
      {
        title: ColumnProps<DataSource>['title'];
        key: keyof DataSource;
      } & Partial<ColumnProps<DataSource>>
    >
  ): Array<ColumnProps<DataSource>> => {
    return columns.map((col) => ({
      dataIndex: col.key,
      sortDirections: ['ascend', 'descend', 'ascend'],
      sorter: azSortByKey(col.key),
      ...col,
    }));
  };

  return (
    <Modal
      width={800}
      title="Node properties"
      footer={[
        <Button key="submit" type="primary" onClick={onClose}>
          OK
        </Button>,
      ]}
      onCancel={onClose}
      onOk={onClose}
      getContainer={getContainer}
      {...restProps}
    >
      <Tabs
        type="card"
        activeKey={activeTabKey || defaultCdfMetaTabKey}
        onChange={setActiveTabKey}
      >
        {nodeKeys.map((key) => (
          <Tabs.TabPane key={key} tab={key} />
        ))}
        <Tabs.TabPane key={defaultCdfMetaTabKey} tab="CDF Metadata" />
      </Tabs>

      <TableWrapper>
        <Table
          dataSource={getTableDataSource(activeTabKey || defaultCdfMetaTabKey)}
          rowKey={(item) => item.key}
          columns={getColumns([
            {
              title: () => <b>Property</b>,
              key: 'key',
              defaultSortOrder: 'ascend',
            },
            {
              title: () => <b>Value</b>,
              key: 'value',
            },
            {
              title: null,
              sorter: undefined,
              key: 'action',
            },
          ])}
          pagination={false}
        />
      </TableWrapper>
    </Modal>
  );
};
