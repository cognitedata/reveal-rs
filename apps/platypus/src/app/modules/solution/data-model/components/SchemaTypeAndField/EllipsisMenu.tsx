import { useState, MouseEvent } from 'react';

import styled from 'styled-components';

import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { Button, Menu, Dropdown } from '@cognite/cogs.js';

type Props = {
  disabled?: boolean;
  onDelete: (value: string) => void;
  onRename: (value: string) => void;
  typeName: string;
};

export const EllipsisMenu = ({
  disabled,
  onDelete,
  onRename,
  typeName,
}: Props) => {
  const [isDropdownVisible, setDropdownVisibility] = useState(false);
  const { t } = useTranslation('schema_type_dropdown');

  const onRenameClick = (e: MouseEvent) => {
    e.stopPropagation();
    onRename(typeName);
    setDropdownVisibility(false);
  };
  const onDeleteClick = (e: MouseEvent) => {
    e.stopPropagation();
    onDelete(typeName);
    setDropdownVisibility(false);
  };

  return (
    <Dropdown
      disabled={disabled}
      visible={isDropdownVisible}
      onClickOutside={() => setDropdownVisibility(false)}
      content={
        <Menu style={{ width: 200, height: 80 }}>
          <Menu.Item
            css={{}}
            onClick={onRenameClick}
            icon="Edit"
            iconPlacement="left"
          >
            {t('rename_type', 'Rename type')}
          </Menu.Item>
          <Menu.Item
            css={{}}
            onClick={onDeleteClick}
            data-cy="delete-type-btn"
            icon="Delete"
            iconPlacement="left"
          >
            {t('delete_type', 'Delete type')}
          </Menu.Item>
        </Menu>
      }
    >
      <EllipsisButton
        type="ghost"
        icon="EllipsisVertical"
        disabled={disabled}
        aria-label={`Additional actions for ${typeName}`}
        onClick={(e) => {
          e.stopPropagation();
          setDropdownVisibility(!isDropdownVisible);
        }}
      />
    </Dropdown>
  );
};

const EllipsisButton = styled(Button)`
  :hover {
    background: rgba(34, 42, 83, 0.06);
  }
`;
