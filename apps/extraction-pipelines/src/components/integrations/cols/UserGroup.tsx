import React, { FunctionComponent } from 'react';
import { Avatar } from '@cognite/cogs.js';
import styled from 'styled-components';
import { StyledTooltip } from 'styles/StyledToolTip';
import { User } from 'model/User';
import AvatarGroup from 'components/Avatar/AvatarGroup';
import AvatarWithTooltip from 'components/Avatar/AvatarWithTooltip';

export const StyledBlueAvatarTooltip = styled.div`
  p {
    margin: 0 0 0.3125rem;
  }
`;

interface OwnProps {
  users: User[];
}

type Props = OwnProps;

const blueAvatarTooltip = (users: User[], avatarsLimit: number) => {
  const hiddenAvatars = users.slice(avatarsLimit);
  return (
    <StyledBlueAvatarTooltip>
      {hiddenAvatars.map((value) => {
        return <p key={value.email}>{value.email}</p>;
      })}
    </StyledBlueAvatarTooltip>
  );
};

const UserGroup: FunctionComponent<Props> = ({ users = [] }: Props) => {
  const avatarsLimit = 2;
  const showBlueAvatar = users.length > avatarsLimit;
  return (
    <AvatarGroup>
      {users
        .filter((_, index) => avatarsLimit > index)
        .map((user) => {
          return (
            <AvatarWithTooltip
              key={`avatar-${user.email}-${user.name}`}
              user={user}
            />
          );
        })}
      {showBlueAvatar ? (
        <StyledTooltip
          placement="top"
          content={blueAvatarTooltip(users, avatarsLimit)}
          key="tooltip-blue-avatar"
        >
          <Avatar
            text={`+ ${users.length - avatarsLimit}`}
            key="avatar-blue-avatar"
            className="bg-blue"
          />
        </StyledTooltip>
      ) : (
        <></>
      )}
    </AvatarGroup>
  );
};

export default UserGroup;
