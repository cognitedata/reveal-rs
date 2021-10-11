import React from 'react';
import { useTranslation } from 'react-i18next';

import { Dropdown, Menu, Label } from '@cognite/cogs.js';

import { NoPropagationWrapper } from 'components/buttons/NoPropagationWrapper';
import { useUserProfileQuery } from 'modules/api/user/useUserQuery';
import { BasicUserInfo } from 'modules/user/types';
import { getFullNameOrDefaultText } from 'modules/user/utils';

interface Props {
  assignee?: BasicUserInfo;
  assignFeedback: () => void;
  unassignFeedback: () => void;
}

enum Options {
  assignToMe = 0,
  unassign = 1,
}

export const AssigneeColumn: React.FC<Props> = (props) => {
  const { assignee, assignFeedback, unassignFeedback } = props;
  const { t } = useTranslation('Admin');
  const user = useUserProfileQuery();
  const [visibleAssignee, setVisibleAssignee] = React.useState<
    undefined | BasicUserInfo
  >(assignee);

  const isAssigned = !!visibleAssignee;
  const isAssignedToMe = user?.data?.id === visibleAssignee?.id;

  const handleChange = (value: number) => {
    if (value === Options.assignToMe) {
      setVisibleAssignee(user?.data);
      assignFeedback();
    } else if (value === Options.unassign) {
      setVisibleAssignee(undefined);
      unassignFeedback();
    }
  };

  const options = [
    {
      value: Options.assignToMe,
      display: isAssignedToMe ? t('Assigned to me') : t('Assign to me'),
    },
    {
      value: Options.unassign,
      display: isAssigned ? t('Unassign') : t('Unassigned'),
    },
  ];

  const getSelected = () => {
    if (isAssignedToMe) {
      return Options.assignToMe;
    }
    if (!isAssigned) {
      return Options.unassign;
    }

    return undefined;
  };

  const MenuContent = (
    <Menu>
      {options.map((option) => (
        <Menu.Item
          key={option.value}
          onClick={() => handleChange(option.value)}
          disabled={getSelected() === option.value}
        >
          {option.display}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <NoPropagationWrapper>
      <Dropdown content={MenuContent}>
        <Label
          size="medium"
          iconPlacement="right"
          icon="ChevronDownLarge"
          variant={visibleAssignee ? 'normal' : 'unknown'}
          aria-label="Unassigned"
        >
          {visibleAssignee
            ? getFullNameOrDefaultText(visibleAssignee)
            : 'Unassigned'}
        </Label>
      </Dropdown>
    </NoPropagationWrapper>
  );
};
