import { WellboreInternal } from 'domain/wells/wellbore/internal/types';

import React, { useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import sortBy from 'lodash/sortBy';

import { Dropdown, Menu } from '@cognite/cogs.js';

import { MoreOptionsButton, ViewButton } from 'components/Buttons';
import { RowProps, Table } from 'components/Tablev3';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import { useTranslation } from 'hooks/useTranslation';
import { useVisibleWellboreColumns } from 'hooks/useVisibleWellboreColumns';
import { SelectedMap } from 'modules/inspectTabs/types';
import { WellboreId } from 'modules/wellSearch/types';
import { WellboreSubtableOptions } from 'pages/authorized/constant';
import { REMOVE_FROM_SET_TEXT } from 'pages/authorized/favorites/constants';
import { DeleteWellFromSetModal } from 'pages/authorized/favorites/modals';
import { NO_WELLBORES_FOUND } from 'pages/authorized/search/well/content/constants';
import { Message } from 'pages/authorized/search/well/content/result/elements';
import { FlexRow } from 'styles/layout';

import {
  FavoriteWelboreResultsTableWrapper,
  RemoveFavoriteLabel,
} from './elements';

export interface Props {
  wellbores: WellboreInternal[];
  selectedWellboreIds: WellboreId[];
  onRemoveWellbores: (wellboreIds: string[]) => void;
  onViewWellbores: (wellboreIds: string[]) => void;
  onSelectedWellbore: (wellboreId: string) => void;
}

const WellboreResult: React.FC<Props> = ({
  wellbores,
  selectedWellboreIds,
  onRemoveWellbores,
  onViewWellbores,
  onSelectedWellbore,
}) => {
  const [isDeleteWellModalOpen, setIsDeleteWellModalOpen] = useState(false);

  const { t } = useTranslation('WellData');
  const columns = useVisibleWellboreColumns();
  const handleOpenDeleteModal = () => setIsDeleteWellModalOpen(true);
  const handleCloseDeleteModal = () => setIsDeleteWellModalOpen(false);
  const [hoveredWellbore, setHoveredWellbore] = useState<WellboreInternal>();

  const [selectedWellbores, setSelectedWellbores] = useState<SelectedMap>({});

  useDeepEffect(() => {
    setSelectedWellbores(
      selectedWellboreIds.reduce((previousValue, currentValue) => {
        return { ...previousValue, [currentValue]: true };
      }, {})
    );
  }, [selectedWellboreIds]);

  const getSortedWellbores = (wellboreList: WellboreInternal[] | undefined) =>
    wellboreList ? sortBy(wellboreList, 'name') : [];

  const sortedWellbores = useDeepMemo(
    () => getSortedWellbores(wellbores),
    [wellbores]
  );

  if (isEmpty(sortedWellbores)) {
    return <Message>{t(NO_WELLBORES_FOUND)}</Message>;
  }

  const handleRemoveWellbore = (): void => {
    if (isUndefined(hoveredWellbore)) {
      return;
    }
    onRemoveWellbores([hoveredWellbore?.id]);
    handleCloseDeleteModal();
  };

  const handleViewClick = (row: RowProps<WellboreInternal>): void => {
    onViewWellbores([row.original.id]);
  };

  const renderRowHoverComponent: React.FC<{
    row: RowProps<WellboreInternal>;
  }> = ({ row }) => {
    const wellbore = row.original;
    return (
      <FlexRow>
        <ViewButton
          data-testid="button-view-document"
          onClick={() => handleViewClick(row)}
          hideIcon
        />
        <Dropdown
          openOnHover
          content={
            <Menu>
              <Menu.Item
                onClick={() => {
                  handleOpenDeleteModal();
                  setHoveredWellbore(wellbore);
                }}
              >
                <RemoveFavoriteLabel data-testid="remove-from-set">
                  {t(REMOVE_FROM_SET_TEXT)}
                </RemoveFavoriteLabel>
              </Menu.Item>
            </Menu>
          }
        >
          <MoreOptionsButton data-testid="menu-button" />
        </Dropdown>
      </FlexRow>
    );
  };

  const handleRowSelect = (row: RowProps<WellboreInternal>) => {
    onSelectedWellbore(row.original.id);
  };

  return (
    <FavoriteWelboreResultsTableWrapper>
      <Table<WellboreInternal>
        id="wellbore-result-table"
        data={sortedWellbores}
        columns={columns}
        options={WellboreSubtableOptions}
        renderRowHoverComponent={renderRowHoverComponent}
        handleRowSelect={handleRowSelect}
        selectedIds={selectedWellbores}
        hideHeaders
        indent
      />

      <DeleteWellFromSetModal
        title={hoveredWellbore?.name}
        onConfirm={handleRemoveWellbore}
        onClose={handleCloseDeleteModal}
        isOpen={isDeleteWellModalOpen}
        isWell={false}
      />
    </FavoriteWelboreResultsTableWrapper>
  );
};

export const FavoriteWellboreTable = React.memo(WellboreResult);
