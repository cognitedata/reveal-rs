import { UMSUser } from '@cognite/user-management-service-types';

export const getUmsUserFromId = (
  users?: UMSUser[],
  userId?: string
): UMSUser | undefined => {
  if (users && userId) {
    return users.find((user) => user.id === userId);
  }

  return undefined;
};
